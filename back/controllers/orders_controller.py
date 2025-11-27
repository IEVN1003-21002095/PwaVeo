from flask import jsonify
from database import get_connection

# 📌 Obtener todos los pedidos de un usuario
def obtener_pedidos_por_usuario(usuario_id):
    connection = None
    try:
        connection = get_connection()
        with connection.cursor() as cursor:
            sql = """
                SELECT 
                    id, fecha_pedido, total, estado, numero_seguimiento
                FROM pedidos 
                WHERE usuario_id = %s
                ORDER BY fecha_pedido DESC
            """
            cursor.execute(sql, (usuario_id,))
            pedidos = cursor.fetchall()

        return jsonify({
            'mensaje': "Pedidos consultados.",
            'exito': True,
            'data': pedidos
        }), 200

    except Exception as ex:
        return jsonify({'mensaje': f"Error al consultar pedidos: {ex}", 'exito': False}), 500
    finally:
        if connection: connection.close()


# 📌 Obtener un pedido específico
def obtener_detalle_pedido(usuario_id, pedido_id):
    connection = None
    try:
        connection = get_connection()
        with connection.cursor() as cursor:

            # Validar que el pedido sí pertenece al usuario
            sql_pedido = """
                SELECT *
                FROM pedidos
                WHERE id = %s AND usuario_id = %s
            """
            cursor.execute(sql_pedido, (pedido_id, usuario_id))
            pedido = cursor.fetchone()

            if pedido is None:
                return jsonify({'mensaje': "Pedido no encontrado.", 'exito': False}), 404

            # Obtener items
            sql_detalles = """
                SELECT 
                    dp.cantidad,
                    dp.precio_unitario,
                    dp.subtotal,
                    p.nombre AS nombre_producto,
                    i.nombre_color,
                    i.nombre_talla
                FROM detalles_pedido dp
                JOIN inventario i ON dp.inventario_id = i.id
                JOIN productos p ON i.producto_id = p.id
                WHERE dp.pedido_id = %s
            """
            cursor.execute(sql_detalles, (pedido_id,))
            detalles = cursor.fetchall()

            pedido["items"] = detalles

        return jsonify({
            'mensaje': "Detalle consultado.",
            'exito': True,
            'data': pedido
        }), 200

    except Exception as ex:
        return jsonify({'mensaje': f"Error al consultar el pedido: {ex}", 'exito': False}), 500
    finally:
        if connection: connection.close()
