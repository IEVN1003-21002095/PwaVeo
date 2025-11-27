from flask import jsonify, request
from database import (
    get_connection,
    leer_cliente_por_usuario_id,
    leer_inventario_bd,
    leer_direccion_cliente,
    leer_metodo_pago
)
from decimal import Decimal, InvalidOperation

# ------------------------------
# PASO 1: Guardar / actualizar dirección
# ------------------------------
def guardar_direccion(usuario_id):
    """
    Inserta una nueva dirección para el cliente asociado a usuario_id.
    """
    connection = None
    try:
        data = request.json or {}

        # Validar campos requeridos
        required = ["calle", "ciudad", "estado", "codigo_postal"]
        missing = [k for k in required if k not in data]
        if missing:
            return jsonify({"mensaje": f"Faltan campos requeridos: {missing}", "exito": False}), 400

        cliente_data = leer_cliente_por_usuario_id(usuario_id)
        if cliente_data is None:
            return jsonify({"mensaje": "Usuario no es un cliente válido.", "exito": False}), 403

        cliente_id = cliente_data["id"]

        connection = get_connection()
        with connection.cursor() as cursor:
            sql = """
                INSERT INTO direcciones_cliente
                (cliente_id, calle, ciudad, estado, codigo_postal, pais)
                VALUES (%s, %s, %s, %s, %s, %s)
            """
            cursor.execute(sql, (
                cliente_id,
                data["calle"],
                data["ciudad"],
                data["estado"],
                data["codigo_postal"],
                data.get("pais", "México")
            ))
            direccion_id = cursor.lastrowid
            connection.commit()

        return jsonify({
            "mensaje": "Dirección guardada con éxito.",
            "exito": True,
            "direccion_id": direccion_id
        }), 201

    except ConnectionError:
        return jsonify({"mensaje": "Error de conexión a la base de datos.", "exito": False}), 503
    except Exception as ex:
        if connection:
            connection.rollback()
        return jsonify({"mensaje": f"Error al guardar dirección: {ex}", "exito": False}), 500
    finally:
        if connection:
            connection.close()


# ------------------------------
# PASO 2: Validar método de pago (consulta)
# ------------------------------
def validar_metodo_pago(metodo_pago_id):
    """
    Verifica que el método de pago exista y esté activo.
    """
    try:
        metodo = leer_metodo_pago(metodo_pago_id)
        if metodo is None:
            return jsonify({"mensaje": "Método de pago no válido.", "exito": False}), 400

        return jsonify({"mensaje": "Método de pago validado.", "exito": True, "data": metodo}), 200

    except ConnectionError:
        return jsonify({"mensaje": "Error de conexión a la base de datos.", "exito": False}), 503
    except Exception as ex:
        return jsonify({"mensaje": f"Error al validar pago: {ex}", "exito": False}), 500


# ------------------------------
# PASO 3: Confirmar pedido (checkout)
# ------------------------------
def confirmar_pedido():
    """
    Procesa un pedido: valida cliente, dirección, stock; inserta venta, detalle y envío;
    actualiza inventario. Request JSON esperado:
    {
      "usuario_id": int,
      "metodo_pago_id": int,
      "direccion_envio_id": int,
      "items_carrito": [{"inventario_id": int, "cantidad": int}, ...]
    }
    """
    connection = None
    try:
        data = request.json or {}
        # Validación básica de payload
        for field in ("usuario_id", "metodo_pago_id", "direccion_envio_id", "items_carrito"):
            if field not in data:
                return jsonify({"mensaje": f"Falta campo requerido: {field}", "exito": False}), 400

        usuario_id = data["usuario_id"]
        metodo_pago_id = data["metodo_pago_id"]
        direccion_envio_id = data["direccion_envio_id"]
        items_carrito = data["items_carrito"]

        if not isinstance(items_carrito, list) or len(items_carrito) == 0:
            return jsonify({"mensaje": "items_carrito debe ser una lista no vacía.", "exito": False}), 400

        # Validar cliente
        cliente_data = leer_cliente_por_usuario_id(usuario_id)
        if cliente_data is None:
            return jsonify({"mensaje": "Usuario no es un cliente válido.", "exito": False}), 403
        cliente_id = cliente_data["id"]

        # Validar dirección
        direccion_envio = leer_direccion_cliente(direccion_envio_id)
        if direccion_envio is None:
            return jsonify({"mensaje": "Dirección de envío inválida.", "exito": False}), 400

        # Validar método de pago (opcional: aquí solo comprobamos existencia)
        metodo = leer_metodo_pago(metodo_pago_id)
        if metodo is None:
            return jsonify({"mensaje": "Método de pago inválido.", "exito": False}), 400

        # Calculo de subtotal y verificación de stock
        subtotal = Decimal("0")
        items_a_insertar = []

        for idx, item in enumerate(items_carrito):
            if "inventario_id" not in item or "cantidad" not in item:
                return jsonify({"mensaje": f"Cada item debe tener inventario_id y cantidad (error en índice {idx})", "exito": False}), 400

            inventario_id = int(item["inventario_id"])
            cantidad_solicitada = int(item["cantidad"])

            inventario = leer_inventario_bd(inventario_id)
            if inventario is None:
                return jsonify({"mensaje": f"Variante de inventario no encontrada: {inventario_id}", "exito": False}), 404

            disponible = int(inventario.get("cantidad", 0))
            if disponible < cantidad_solicitada:
                return jsonify({"mensaje": f"Stock insuficiente para ID {inventario_id}. Disponible: {disponible}", "exito": False}), 400

            # Precio: garantizar Decimal
            precio_unitario = inventario.get("precio", 0)
            try:
                precio_unitario_dec = Decimal(str(precio_unitario))
            except (InvalidOperation, TypeError):
                return jsonify({"mensaje": f"Precio inválido para inventario {inventario_id}", "exito": False}), 400

            nombre_producto_venta = f"{inventario.get('nombre_producto','-')} - {inventario.get('nombre_color','-')} (Talla {inventario.get('nombre_talla','-')})"
            subtotal += precio_unitario_dec * Decimal(cantidad_solicitada)

            items_a_insertar.append({
                "inventario_id": inventario_id,
                "nombre_producto_venta": nombre_producto_venta,
                "cantidad": cantidad_solicitada,
                "precio_unitario": precio_unitario_dec
            })

        # Inserción transaccional
        connection = get_connection()
        with connection.cursor() as cursor:
            # 1) Insertar venta (subtotal y total = subtotal por ahora; descuento = 0)
            sql_venta = """
                INSERT INTO ventas (cliente_id, usuario_id, metodo_pago_id, subtotal, descuento, total, estado)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """
            subtotal_f = float(subtotal)  # convertir a tipo compatible con BD
            cursor.execute(sql_venta, (
                cliente_id,
                usuario_id,
                metodo_pago_id,
                subtotal_f,
                0.00,
                subtotal_f,
                "pago_pendiente"
            ))
            venta_id = cursor.lastrowid

            # 2) Insertar detalle y actualizar inventario
            sql_detalle = """
                INSERT INTO venta_detalle (venta_id, inventario_id, nombre_producto_venta, cantidad, precio_unitario, subtotal_item)
                VALUES (%s, %s, %s, %s, %s, %s)
            """
            sql_update_inventario = "UPDATE inventario SET cantidad = cantidad - %s WHERE id = %s"

            for it in items_a_insertar:
                cantidad = it["cantidad"]
                precio_unit = float(it["precio_unitario"])
                subtotal_item = float(Decimal(precio_unit) * Decimal(cantidad))

                cursor.execute(sql_detalle, (
                    venta_id,
                    it["inventario_id"],
                    it["nombre_producto_venta"],
                    cantidad,
                    precio_unit,
                    subtotal_item
                ))

                cursor.execute(sql_update_inventario, (cantidad, it["inventario_id"]))

            # 3) Insertar envio
            direccion_completa = f"{direccion_envio.get('calle','')}, {direccion_envio.get('ciudad','')}, {direccion_envio.get('estado','')}, CP: {direccion_envio.get('codigo_postal','')}"
            sql_envio = """
                INSERT INTO envios (venta_id, direccion_entrega, estado_envio, direccion_envio_id)
                VALUES (%s, %s, %s, %s)
            """
            cursor.execute(sql_envio, (venta_id, direccion_completa, "pendiente", direccion_envio_id))

            # commit final
            connection.commit()

        return jsonify({
            "mensaje": "Pedido confirmado con éxito. Pago Pendiente.",
            "exito": True,
            "venta_id": venta_id,
            "total": str(subtotal)  # devolvemos string para preservar formato decimal
        }), 201

    except ConnectionError:
        return jsonify({"mensaje": "Error de conexión a la base de datos.", "exito": False}), 503
    except KeyError as ex:
        return jsonify({"mensaje": f"Falta un campo requerido: {ex}", "exito": False}), 400
    except Exception as ex:
        if connection:
            connection.rollback()
        return jsonify({"mensaje": f"Error al confirmar el pedido: {ex}", "exito": False}), 500
    finally:
        if connection:
            connection.close()
