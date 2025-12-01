from flask import jsonify, request
from database import get_connection
from datetime import datetime

def get_ventas_con_detalles_controller():
    try:
        conn = get_connection()
        with conn.cursor() as cursor:
            cursor.execute("""
                SELECT 
                    v.id AS venta_id,
                    v.cliente_id,
                    u.nombre AS cliente_nombre,
                    u.apellido AS cliente_apellido,
                    v.usuario_id,
                    v.fecha,
                    v.metodo_pago_id,
                    v.subtotal,
                    v.descuento,
                    v.total,
                    v.estado,
                    v.notas,
                    v.creado_en,
                    d.id AS detalle_id,
                    d.inventario_id,
                    d.nombre_producto_venta,
                    d.cantidad,
                    d.precio_unitario,
                    d.precio_unitario_venta,
                    d.descuento_unitario
                FROM ventas v
                LEFT JOIN clientes c ON v.cliente_id = c.id
                LEFT JOIN usuarios u ON c.usuario_id = u.id
                LEFT JOIN venta_detalle d ON v.id = d.venta_id
                ORDER BY v.id;
            """)
            rows = cursor.fetchall()

        ventas_dict = {}
        for row in rows:
            vid = row["venta_id"]
            if vid not in ventas_dict:
                ventas_dict[vid] = {**row, "detalles": []}
                for key in ["detalle_id","inventario_id","nombre_producto_venta","cantidad","precio_unitario","precio_unitario_venta","descuento_unitario"]:
                    ventas_dict[vid].pop(key, None)
            if row["detalle_id"]:
                detalle = {k: row[k] for k in ["detalle_id","inventario_id","nombre_producto_venta","cantidad","precio_unitario","precio_unitario_venta","descuento_unitario"]}
                ventas_dict[vid]["detalles"].append(detalle)

        return jsonify({"success": True, "data": list(ventas_dict.values())})

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
    finally:
        conn.close()


# ============================================================
# GET - VENTA POR ID
# ============================================================
def get_venta_por_id_controller(venta_id):
    try:
        conn = get_connection()
        with conn.cursor() as cursor:
            cursor.execute("""
                SELECT 
                    v.id AS venta_id,
                    v.cliente_id,
                    v.usuario_id,
                    v.fecha,
                    v.metodo_pago_id,
                    v.subtotal,
                    v.descuento,
                    v.total,
                    v.estado,
                    v.notas,
                    v.creado_en,
                    d.id AS detalle_id,
                    d.inventario_id,
                    d.nombre_producto_venta,
                    d.cantidad,
                    d.precio_unitario,
                    d.precio_unitario_venta,
                    d.descuento_unitario
                FROM ventas v
                LEFT JOIN venta_detalle d ON v.id = d.venta_id
                WHERE v.id = %s
            """, (venta_id,))
            rows = cursor.fetchall()

        if not rows:
            return jsonify({"success": False, "error": "Venta no encontrada"}), 404

        venta = {**rows[0], "detalles": []}
        for key in ["detalle_id","inventario_id","nombre_producto_venta","cantidad","precio_unitario","precio_unitario_venta","descuento_unitario"]:
            venta.pop(key, None)

        for row in rows:
            if row["detalle_id"]:
                detalle = {k: row[k] for k in ["detalle_id","inventario_id","nombre_producto_venta","cantidad","precio_unitario","precio_unitario_venta","descuento_unitario"]}
                venta["detalles"].append(detalle)

        return jsonify({"success": True, "data": venta})

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
    finally:
        conn.close()


# ============================================================
# GET - DETALLES DE UNA VENTA
# ============================================================
def get_detalles_por_venta_controller(venta_id):
    try:
        conn = get_connection()
        with conn.cursor() as cursor:
            cursor.execute("""
                SELECT *
                FROM venta_detalle
                WHERE venta_id = %s
            """, (venta_id,))
            detalles = cursor.fetchall()

        return jsonify({"success": True, "data": detalles})

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
    finally:
        conn.close()


# ============================================================
# PUT - ACTUALIZAR VENTA
# ============================================================
def update_venta_controller(venta_id):
    data = request.json
    try:
        conn = get_connection()
        with conn.cursor() as cursor:
            fecha = data.get("fecha")
            if fecha:
                fecha = datetime.fromisoformat(fecha)

            cursor.execute("""
                UPDATE ventas
                SET cliente_id=%s, usuario_id=%s, fecha=%s, metodo_pago_id=%s,
                    subtotal=%s, descuento=%s, total=%s, estado=%s, notas=%s
                WHERE id=%s
            """, (
                data.get("cliente_id"),
                data.get("usuario_id"),
                fecha,
                data.get("metodo_pago_id"),
                float(data.get("subtotal", 0)),
                float(data.get("descuento", 0)),
                float(data.get("total", 0)),
                data.get("estado"),
                data.get("notas"),
                venta_id
            ))
            conn.commit()

        return jsonify({"success": True, "message": "Venta actualizada correctamente"})

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
    finally:
        conn.close()


# ============================================================
# PUT - ACTUALIZAR DETALLE
# ============================================================
def update_detalle_controller(detalle_id):
    data = request.json
    try:
        conn = get_connection()
        with conn.cursor() as cursor:
            cursor.execute("""
                UPDATE venta_detalle
                SET inventario_id=%s, nombre_producto_venta=%s, cantidad=%s,
                    precio_unitario=%s, precio_unitario_venta=%s, descuento_unitario=%s
                WHERE id=%s
            """, (
                data.get("inventario_id"),
                data.get("nombre_producto_venta"),
                data.get("cantidad"),
                float(data.get("precio_unitario", 0)),
                float(data.get("precio_unitario_venta", 0)),
                float(data.get("descuento_unitario", 0)),
                detalle_id
            ))
            conn.commit()

        return jsonify({"success": True, "message": "Detalle actualizado correctamente"})

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
    finally:
        conn.close()
