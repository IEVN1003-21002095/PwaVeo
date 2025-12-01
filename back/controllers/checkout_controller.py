from database import get_connection
import datetime
import random

# ---------- Helpers ----------
def _now():
    return datetime.datetime.now()

def generar_referencia():
    stamp = datetime.datetime.now().strftime("%Y%m%d%H%M%S")
    suffix = str(random.randint(1000, 9999))
    return f"VEO-{stamp}-{suffix}"

def _fetch_one(cursor):
    row = cursor.fetchone()
    return None if not row else row

def _fetch_all(cursor):
    rows = cursor.fetchall()
    return [] if not rows else rows


# ---------------------------
# Registrar dirección
# ---------------------------
def registrar_direccion(data):
    required = ["cliente_id", "nombre_destinatario", "calle", "codigo_postal", "ciudad", "estado"]
    for f in required:
        if not data.get(f):
            return ({"exito": False, "mensaje": f"Falta campo {f}"}, 400)

    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            INSERT INTO direcciones_cliente
            (cliente_id, nombre_destinatario, calle, numero_ext, numero_int,
             colonia, codigo_postal, ciudad, estado, telefono, referencia, activo, creado_en)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,1,NOW())
        """, (
            data["cliente_id"],
            data["nombre_destinatario"],
            data["calle"],
            data.get("numero_ext"),
            data.get("numero_int"),
            data.get("colonia"),
            data["codigo_postal"],
            data["ciudad"],
            data["estado"],
            data.get("telefono"),
            data.get("referencia")
        ))
        conn.commit()
        direccion_id = cursor.lastrowid
        return ({"exito": True, "mensaje": "Dirección registrada", "direccion_id": direccion_id}, 201)
    except Exception as e:
        conn.rollback()
        return ({"exito": False, "mensaje": str(e)}, 500)
    finally:
        cursor.close()
        conn.close()


# ---------------------------
# Seleccionar método de pago
# ---------------------------
def seleccionar_metodo_pago(data):
    if not data or (not data.get("metodo") and not data.get("metodo_id")):
        return ({"exito": False, "mensaje": "Falta metodo o metodo_id"}, 400)

    conn = get_connection()
    cursor = conn.cursor()
    try:
        if data.get("metodo_id"):
            cursor.execute("SELECT id, metodo FROM metodos_pago WHERE id = %s LIMIT 1", (data["metodo_id"],))
        else:
            cursor.execute("SELECT id, metodo FROM metodos_pago WHERE metodo = %s LIMIT 1", (data["metodo"],))

        row = _fetch_one(cursor)
        if not row:
            return ({"exito": False, "mensaje": "Método de pago no encontrado"}, 404)

        if isinstance(row, dict):
            metodo_id = row.get('id')
            metodo_name = row.get('metodo')
        else:
            metodo_id = row[0]
            metodo_name = row[1]

        return ({"exito": True, "metodo_pago_id": metodo_id, "metodo": metodo_name}, 200)
    except Exception as e:
        return ({"exito": False, "mensaje": str(e)}, 500)
    finally:
        cursor.close()
        conn.close()


# ---------------------------
# Generar resumen (mejorado)
# ---------------------------
def generar_resumen(data):
    # campos obligatorios
    requeridos = ["cliente_id", "direccion_id", "metodo_pago_id", "productos"]
    for campo in requeridos:
        if campo not in data:
            return ({"exito": False, "mensaje": f"Falta {campo}"}, 400)

    cliente_id = data["cliente_id"]
    direccion_id = data["direccion_id"]
    metodo_pago_id = data["metodo_pago_id"]
    productos = data["productos"]

    if not isinstance(productos, list) or len(productos) == 0:
        return ({"exito": False, "mensaje": "Faltan items"}, 400)

    conn = get_connection()
    cursor = conn.cursor()
    try:
        # 1) Validar cliente existe
        cursor.execute("SELECT id, usuario_id, telefono FROM clientes WHERE id = %s LIMIT 1", (cliente_id,))
        cliente = _fetch_one(cursor)
        if not cliente:
            return ({"exito": False, "mensaje": "Cliente no existe"}, 404)

        # 2) Validar dirección y que pertenezca al cliente
        cursor.execute("SELECT id, cliente_id, nombre_destinatario, calle, numero_ext, numero_int, colonia, codigo_postal, ciudad, estado, telefono FROM direcciones_cliente WHERE id = %s LIMIT 1", (direccion_id,))
        direccion = _fetch_one(cursor)
        if not direccion:
            # Si no existe, devolvemos lista de direcciones del cliente para ayudar a elegir
            cursor.execute("SELECT id, nombre_destinatario, calle, numero_ext, colonia, codigo_postal, ciudad, estado, telefono, activo FROM direcciones_cliente WHERE cliente_id = %s", (cliente_id,))
            direcciones = _fetch_all(cursor)
            # normalizar salida simple
            direcciones_out = []
            for d in direcciones:
                if isinstance(d, dict):
                    direcciones_out.append({
                        "id": d.get("id"),
                        "nombre_destinatario": d.get("nombre_destinatario"),
                        "calle": d.get("calle"),
                        "numero_ext": d.get("numero_ext"),
                        "colonia": d.get("colonia"),
                        "codigo_postal": d.get("codigo_postal"),
                        "ciudad": d.get("ciudad"),
                        "estado": d.get("estado"),
                        "telefono": d.get("telefono"),
                        "activo": d.get("activo")
                    })
                else:
                    # tupla fallback (id, cliente_id, nombre_destinatario, calle, numero_ext, numero_int, colonia, codigo_postal, ciudad, estado, telefono, referencia, activo, creado_en)
                    direcciones_out.append({
                        "id": d[0],
                        "nombre_destinatario": d[2],
                        "calle": d[3],
                        "numero_ext": d[4],
                        "colonia": d[6],
                        "codigo_postal": d[7],
                        "ciudad": d[8],
                        "estado": d[9],
                        "telefono": d[10],
                        "activo": d[12] if len(d) > 12 else None
                    })
            return ({"exito": False, "mensaje": "Dirección no existe para ese id. Estas son las direcciones del cliente", "direcciones": direcciones_out}, 404)

        # Si la dirección existe, checar que pertenezca al cliente
        dir_cliente_id = direccion.get("cliente_id") if isinstance(direccion, dict) else direccion[1]
        if int(dir_cliente_id) != int(cliente_id):
            # devolver direcciones del cliente como ayuda
            cursor.execute("SELECT id, nombre_destinatario, calle, numero_ext, colonia, codigo_postal, ciudad, estado, telefono, activo FROM direcciones_cliente WHERE cliente_id = %s", (cliente_id,))
            direcciones = _fetch_all(cursor)
            return ({"exito": False, "mensaje": "La dirección no pertenece a este cliente. Lista de direcciones del cliente:", "direcciones": direcciones}, 400)

        # 3) Validar método de pago
        cursor.execute("SELECT id, metodo FROM metodos_pago WHERE id = %s LIMIT 1", (metodo_pago_id,))
        metodo = _fetch_one(cursor)
        if not metodo:
            return ({"exito": False, "mensaje": "Método de pago no encontrado"}, 404)

        # 4) Procesar productos y calcular subtotal
        lista_productos = []
        subtotal = 0.0

        for item in productos:
            inventario_id = item.get("inventario_id")
            cantidad = int(item.get("cantidad", 0))
            if not inventario_id or cantidad <= 0:
                return ({"exito": False, "mensaje": "Item incompleto: inventario_id y cantidad > 0 requeridos"}, 400)

            cursor.execute("""
                SELECT i.id AS inventario_id, i.producto_id, p.nombre AS nombre_producto, COALESCE(p.precio, 0) AS precio_producto, COALESCE(i.cantidad,0) AS stock
                FROM inventario i
                LEFT JOIN productos p ON p.id = i.producto_id
                WHERE i.id = %s
                LIMIT 1
            """, (inventario_id,))
            row = _fetch_one(cursor)
            if not row:
                return ({"exito": False, "mensaje": f"Inventario {inventario_id} no existe"}, 404)

            if isinstance(row, dict):
                inv_id = row.get("inventario_id")
                prod_id = row.get("producto_id")
                nombre = row.get("nombre_producto") or "Producto"
                precio = float(row.get("precio_producto") or 0.0)
                stock = int(row.get("stock") or 0)
            else:
                inv_id = row[0]
                prod_id = row[1]
                nombre = row[2] or "Producto"
                precio = float(row[3] or 0.0)
                stock = int(row[4] or 0)

            if stock < cantidad:
                return ({"exito": False, "mensaje": f"Stock insuficiente para {nombre} (inventario {inv_id})"}, 400)

            total_linea = round(precio * cantidad, 2)
            subtotal += total_linea

            lista_productos.append({
                "inventario_id": inv_id,
                "producto_id": prod_id,
                "producto": nombre,
                "precio_unitario": float(precio),
                "cantidad": cantidad,
                "total": float(total_linea)
            })

        total = round(subtotal, 2)

        # preparar salida: normalizar cliente/direccion/metodo
        cliente_out = {"id": cliente.get("id") if isinstance(cliente, dict) else cliente[0],
                       "usuario_id": cliente.get("usuario_id") if isinstance(cliente, dict) else cliente[1],
                       "telefono": cliente.get("telefono") if isinstance(cliente, dict) and cliente.get("telefono") else (cliente[2] if len(cliente) > 2 else None)}
        # direccion_out simple:
        if isinstance(direccion, dict):
            direccion_out = {
                "id": direccion.get("id"),
                "nombre_destinatario": direccion.get("nombre_destinatario"),
                "calle": direccion.get("calle"),
                "numero_ext": direccion.get("numero_ext"),
                "numero_int": direccion.get("numero_int"),
                "colonia": direccion.get("colonia"),
                "codigo_postal": direccion.get("codigo_postal"),
                "ciudad": direccion.get("ciudad"),
                "estado": direccion.get("estado"),
                "telefono": direccion.get("telefono")
            }
        else:
            direccion_out = {
                "id": direccion[0],
                "nombre_destinatario": direccion[2],
                "calle": direccion[3],
                "numero_ext": direccion[4],
                "numero_int": direccion[5],
                "colonia": direccion[6],
                "codigo_postal": direccion[7],
                "ciudad": direccion[8],
                "estado": direccion[9],
                "telefono": direccion[10] if len(direccion) > 10 else None
            }

        metodo_out = {"id": metodo.get("id") if isinstance(metodo, dict) else metodo[0],
                      "metodo": metodo.get("metodo") if isinstance(metodo, dict) else metodo[1]}

        resumen = {
            "exito": True,
            "cliente": cliente_out,
            "direccion": direccion_out,
            "metodo_pago": metodo_out,
            "productos": lista_productos,
            "subtotal": float(round(subtotal, 2)),
            "total": float(round(total, 2))
        }
        return (resumen, 200)

    except Exception as e:
        return ({"exito": False, "mensaje": str(e)}, 500)
    finally:
        cursor.close()
        conn.close()


# ---------------------------
# Obtener inventario (resuelve inventario_id + color_id)
# ---------------------------
def obtener_inventario(data):
    if not data or not data.get("producto_id") or not data.get("talla") or not data.get("color_hex"):
        return ({"exito": False, "mensaje": "Faltan datos: producto_id, color_hex, talla"}, 400)

    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT i.id AS inventario_id, c.id AS color_id
            FROM inventario i
            JOIN colores c ON c.id = i.color_id
            JOIN tallas t ON t.id = i.talla_id
            WHERE i.producto_id=%s AND c.codigo_hex=%s AND t.talla=%s
            LIMIT 1
        """, (data["producto_id"], data["color_hex"], data["talla"]))

        row = _fetch_one(cursor)
        if not row:
            return ({"exito": False, "mensaje": "No existe inventario"}, 404)

        if isinstance(row, dict):
            return ({"exito": True, "inventario_id": row["inventario_id"], "color_id": row["color_id"]}, 200)
        else:
            return ({"exito": True, "inventario_id": row[0], "color_id": row[1]}, 200)

    except Exception as e:
        return ({"exito": False, "mensaje": str(e)}, 500)
    finally:
        cursor.close()
        conn.close()



# ====================================================
# FINALIZAR COMPRA
# ====================================================
def finalizar_compra(data):
    if not data or "usuario_id" not in data or "items" not in data:
        return ({"exito": False, "mensaje": "Faltan usuario_id o items"}, 400)

    usuario_id = data["usuario_id"]
    items = data["items"]
    notas = data.get("notas")
    simulado = bool(data.get("simulado", True))

    conn = get_connection()
    cursor = conn.cursor()
    try:
        # 1) Obtener cliente_id desde usuario_id
        cursor.execute("SELECT id FROM clientes WHERE usuario_id=%s LIMIT 1", (usuario_id,))
        cliente_row = _fetch_one(cursor)
        if not cliente_row:
            return ({"exito": False, "mensaje": "Usuario no es cliente"}, 400)
        cliente_id = cliente_row["id"] if isinstance(cliente_row, dict) else cliente_row[0]

        # 2) Dirección (insertar si no viene direccion_id)
        direccion_id = data.get("direccion_id")
        direccion_obj = data.get("direccion")
        if not direccion_id:
            if not direccion_obj:
                return ({"exito": False, "mensaje": "Falta direccion o direccion_id"}, 400)
            for f in ("nombre_destinatario", "calle", "codigo_postal", "ciudad", "estado"):
                if not direccion_obj.get(f):
                    return ({"exito": False, "mensaje": f"Falta campo en dirección: {f}"}, 400)
            cursor.execute("""
                INSERT INTO direcciones_cliente
                (cliente_id, nombre_destinatario, calle, numero_ext, numero_int,
                 colonia, codigo_postal, ciudad, estado, telefono, referencia, activo, creado_en)
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,1,NOW())
            """, (
                cliente_id,
                direccion_obj.get("nombre_destinatario"),
                direccion_obj.get("calle"),
                direccion_obj.get("numero_ext"),
                direccion_obj.get("numero_int"),
                direccion_obj.get("colonia"),
                direccion_obj.get("codigo_postal"),
                direccion_obj.get("ciudad"),
                direccion_obj.get("estado"),
                direccion_obj.get("telefono"),
                direccion_obj.get("referencia")
            ))
            conn.commit()
            direccion_id = cursor.lastrowid

        # 3) Método de pago
        metodo_pago_id = data.get("metodo_pago_id")
        metodo_name = None
        if not metodo_pago_id and data.get("metodo"):
            cursor.execute("SELECT id, metodo FROM metodos_pago WHERE metodo=%s LIMIT 1", (data["metodo"],))
            r = _fetch_one(cursor)
            if not r:
                return ({"exito": False, "mensaje": "Método de pago inválido"}, 400)
            metodo_pago_id = r["id"] if isinstance(r, dict) else r[0]
            metodo_name = r["metodo"] if isinstance(r, dict) else (r[1] if len(r) > 1 else None)
        elif metodo_pago_id:
            cursor.execute("SELECT metodo FROM metodos_pago WHERE id=%s LIMIT 1", (metodo_pago_id,))
            r = _fetch_one(cursor)
            if r:
                metodo_name = r["metodo"] if isinstance(r, dict) else (r[0] if len(r) > 0 else None)

        # 4) Validar stock y preparar items
        subtotal = 0.0
        prepared_items = []

        for it in items:
            inventario_id = it.get("inventario_id")
            cantidad = int(it.get("cantidad", 0))
            if not inventario_id or cantidad <= 0:
                return ({"exito": False, "mensaje": "Cada item debe contener inventario_id y cantidad > 0"}, 400)

            cursor.execute("""
                SELECT i.id, i.cantidad AS stock, p.nombre AS nombre_producto, p.precio AS precio_base
                FROM inventario i
                LEFT JOIN productos p ON p.id = i.producto_id
                WHERE i.id=%s
                LIMIT 1
            """, (inventario_id,))
            row = _fetch_one(cursor)
            if not row:
                return ({"exito": False, "mensaje": f"Inventario {inventario_id} no encontrado"}, 404)

            if isinstance(row, dict):
                stock = int(row.get("stock", 0))
                nombre_producto = row.get("nombre_producto") or "Producto"
                price = float(row.get("precio_base") or 0.0)
                inv_id = row.get("id")
            else:
                inv_id = row[0]
                stock = int(row[1] or 0)
                nombre_producto = row[2] or "Producto"
                price = float(row[3] or 0.0)

            if stock < cantidad:
                return ({"exito": False, "mensaje": f"Stock insuficiente para {nombre_producto} (solicitado {cantidad}, disponible {stock})"}, 400)

            precio_unitario = float(it.get("precio_unitario", price))
            subtotal += precio_unitario * cantidad

            prepared_items.append({
                "inventario_id": inv_id,
                "cantidad": cantidad,
                "precio_unitario": precio_unitario,
                "nombre": nombre_producto
            })

        descuento = float(data.get("descuento", 0.0))
        envio = float(data.get("envio", 0.0)) if "envio" in data else (0.0 if subtotal >= 1000 else 80.0)
        total = round(subtotal + envio - descuento, 2)

        # 5) Insertar venta
        referencia = generar_referencia()
        cursor.execute("""
            INSERT INTO ventas
            (cliente_id, usuario_id, fecha, metodo_pago_id, subtotal, descuento, total, estado, notas, creado_en)
            VALUES (%s,%s,NOW(),%s,%s,%s,%s,'pendiente',%s,NOW())
        """, (cliente_id, usuario_id, metodo_pago_id, subtotal, descuento, total, notas))
        conn.commit()
        venta_id = cursor.lastrowid

        # 6) Registrar pago (simulado)
        cursor.execute("""
            INSERT INTO pagos (venta_id, metodo, referencia, token, monto, estado, fecha)
            VALUES (%s,%s,%s,NULL,%s,'simulado',NOW())
        """, (venta_id, metodo_name or str(metodo_pago_id), referencia, total))

        # 7) Insertar detalles y decrementar inventario
        for it in prepared_items:
            cursor.execute("""
                INSERT INTO venta_detalle
                (venta_id, inventario_id, nombre_producto_venta, cantidad, precio_unitario, precio_unitario_venta, descuento_unitario)
                VALUES (%s,%s,%s,%s,%s,%s,0)
            """, (venta_id, it["inventario_id"], it["nombre"], it["cantidad"], it["precio_unitario"], it["precio_unitario"]))

            cursor.execute("""
                UPDATE inventario SET cantidad = cantidad - %s, actualizado_en = NOW() WHERE id = %s
            """, (it["cantidad"], it["inventario_id"]))

        # 8) Crear envío
        cursor.execute("""
            SELECT nombre_destinatario, calle, numero_ext, colonia, codigo_postal, ciudad, estado
            FROM direcciones_cliente
            WHERE id=%s 
            LIMIT 1
        """, (direccion_id,))
        dr = _fetch_one(cursor)

        direccion_text = ""
        if dr:
            if isinstance(dr, dict):
                direccion_text = f"{dr.get('calle','')} {dr.get('numero_ext','')} {dr.get('colonia','')} CP {dr.get('codigo_postal','')} {dr.get('ciudad','')}, {dr.get('estado','')}"
            else:
                # tuple: nombre_destinatario, calle, numero_ext, numero_int, colonia, codigo_postal, ciudad, estado, telefono...
                # adapt if ordering differs
                try:
                    direccion_text = f"{dr[1]} {dr[2] or ''} {dr[4] or ''} CP {dr[5] or ''} {dr[6] or ''}, {dr[7] or ''}"
                except Exception:
                    direccion_text = ""

        cursor.execute("""
            INSERT INTO envios (venta_id, direccion_entrega, estado_envio, creado_en, actualizado_en, direccion_envio_id, empresa_envio)
            VALUES (%s,%s,'pendiente',NOW(),NOW(),%s,%s)
        """, (venta_id, direccion_text, direccion_id, data.get("empresa_envio", "Simulado")))

        conn.commit()

        return ({"exito": True, "mensaje": "Compra finalizada correctamente", "venta_id": venta_id, "referencia": referencia, "total": total}, 201)

    except Exception as e:
        conn.rollback()
        return ({"exito": False, "mensaje": str(e)}, 500)
    finally:
        cursor.close()
        conn.close()
