from flask import jsonify, request
from database import get_connection, leer_producto_bd, leer_inventario_bd


# ============================================================
#   OBTENER TODOS LOS PRODUCTOS
# ============================================================

def obtener_productos():
    try:
        connection = get_connection()
        cursor = connection.cursor()

        sql = """
            SELECT id, nombre, descripcion, precio, costo, categoria, estado
            FROM productos
        """
        cursor.execute(sql)
        productos = cursor.fetchall()

        return jsonify({
            "mensaje": "Productos consultados correctamente.",
            "exito": True,
            "data": productos
        }), 200

    except Exception as ex:
        return jsonify({
            "mensaje": f"Error al consultar productos: {ex}",
            "exito": False
        }), 500

    finally:
        if connection:
            connection.close()


# ============================================================
#   OBTENER PRODUCTO POR ID
# ============================================================

def obtener_producto_por_id(producto_id):
    try:
        producto = leer_producto_bd(producto_id)

        if not producto:
            return jsonify({
                "mensaje": "Producto no encontrado.",
                "exito": False
            }), 404

        return jsonify({
            "mensaje": "Producto encontrado.",
            "exito": True,
            "data": producto
        }), 200

    except Exception as ex:
        return jsonify({
            "mensaje": f"Error al obtener producto: {ex}",
            "exito": False
        }), 500


# ============================================================
#   REGISTRAR PRODUCTO
# ============================================================

def registrar_producto():
    try:
        data = request.json

        required = ["nombre", "descripcion", "precio", "costo", "proveedor_id", "categoria"]
        if not all(k in data for k in required):
            return jsonify({
                "mensaje": "Faltan campos obligatorios.",
                "exito": False
            }), 400

        connection = get_connection()
        cursor = connection.cursor()

        sql = """
            INSERT INTO productos (nombre, descripcion, precio, costo, proveedor_id, categoria, estado)
            VALUES (%s, %s, %s, %s, %s, %s, 'Activo')
        """
        cursor.execute(sql, (
            data["nombre"],
            data["descripcion"],
            data["precio"],
            data["costo"],
            data["proveedor_id"],
            data["categoria"]
        ))

        producto_id = cursor.lastrowid
        connection.commit()

        return jsonify({
            "mensaje": "Producto registrado correctamente.",
            "exito": True,
            "producto_id": producto_id
        }), 201

    except Exception as ex:
        return jsonify({
            "mensaje": f"Error al registrar producto: {ex}",
            "exito": False
        }), 500

    finally:
        if connection:
            connection.close()


# ============================================================
#   ACTUALIZAR PRODUCTO
# ============================================================

def actualizar_producto(producto_id):
    try:
        existente = leer_producto_bd(producto_id)

        if not existente:
            return jsonify({
                "mensaje": "Producto no encontrado.",
                "exito": False
            }), 404

        data = request.json
        connection = get_connection()
        cursor = connection.cursor()

        sql = """
            UPDATE productos
            SET nombre = %s,
                descripcion = %s,
                precio = %s,
                costo = %s,
                estado = %s,
                categoria = %s
            WHERE id = %s
        """

        cursor.execute(sql, (
            data.get("nombre", existente["nombre"]),
            data.get("descripcion", existente["descripcion"]),
            data.get("precio", existente["precio"]),
            data.get("costo", existente["costo"]),
            data.get("estado", existente["estado"]),
            data.get("categoria", existente["categoria"]),
            producto_id
        ))

        connection.commit()

        return jsonify({
            "mensaje": "Producto actualizado correctamente.",
            "exito": True
        }), 200

    except Exception as ex:
        return jsonify({
            "mensaje": f"Error al actualizar producto: {ex}",
            "exito": False
        }), 500

    finally:
        if connection:
            connection.close()


# ============================================================
#   ELIMINAR PRODUCTO (SOFT DELETE)
# ============================================================

def eliminar_producto(producto_id):
    try:
        existente = leer_producto_bd(producto_id)

        if not existente:
            return jsonify({
                "mensaje": "Producto no encontrado.",
                "exito": False
            }), 404

        connection = get_connection()
        cursor = connection.cursor()

        sql = "UPDATE productos SET estado = 'Inactivo' WHERE id = %s"
        cursor.execute(sql, (producto_id,))
        connection.commit()

        return jsonify({
            "mensaje": "Producto desactivado correctamente.",
            "exito": True
        }), 200

    except Exception as ex:
        return jsonify({
            "mensaje": f"Error al desactivar producto: {ex}",
            "exito": False
        }), 500

    finally:
        if connection:
            connection.close()


# ============================================================
#   ACTUALIZAR STOCK DE VARIANTE
# ============================================================

def actualizar_stock_variante(inventario_id):
    try:
        variante = leer_inventario_bd(inventario_id)

        if not variante:
            return jsonify({
                "mensaje": "Variante no encontrada.",
                "exito": False
            }), 404

        data = request.json
        connection = get_connection()
        cursor = connection.cursor()

        # NUEVA CANTIDAD
        if "nueva_cantidad" in data:
            sql = """
                UPDATE inventario
                SET cantidad = %s
                WHERE id = %s
            """
            cursor.execute(sql, (data["nueva_cantidad"], inventario_id))

        # AJUSTE (sumar/restar)
        elif "cantidad_ajuste" in data:
            sql = """
                UPDATE inventario
                SET cantidad = cantidad + %s
                WHERE id = %s
            """
            cursor.execute(sql, (data["cantidad_ajuste"], inventario_id))

        else:
            return jsonify({
                "mensaje": "Debes enviar 'nueva_cantidad' o 'cantidad_ajuste'.",
                "exito": False
            }), 400

        connection.commit()

        return jsonify({
            "mensaje": "Stock actualizado correctamente.",
            "exito": True
        }), 200

    except Exception as ex:
        return jsonify({
            "mensaje": f"Error al actualizar stock: {ex}",
            "exito": False
        }), 500

    finally:
        if connection:
            connection.close()
