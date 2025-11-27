from flask import jsonify, request
from database import get_connection, leer_review_bd

def actualizar_visibilidad_review(review_id):
    connection = None
    try:
        data = request.json
        review = leer_review_bd(review_id)

        if review is None:
            return jsonify({'mensaje': "Reseña no encontrada.", 'exito': False}), 404

        if "visible" not in data or data["visible"] not in [0, 1]:
            return jsonify({'mensaje': "visible debe ser 0 o 1.", 'exito': False}), 400

        connection = get_connection()
        with connection.cursor() as cursor:
            sql = "UPDATE reviews SET visible = %s WHERE id = %s"
            cursor.execute(sql, (data["visible"], review_id))
            connection.commit()

        return jsonify({'mensaje': "Visibilidad actualizada.", 'exito': True}), 200

    except Exception as ex:
        if connection: connection.rollback()
        return jsonify({'mensaje': f"Error al actualizar reseña: {ex}", 'exito': False}), 500
    finally:
        if connection: connection.close()


def obtener_reviews_por_producto(producto_id):
    connection = None
    try:
        connection = get_connection()
        with connection.cursor() as cursor:
            sql = """
                SELECT r.*, u.nombre
                FROM reviews r
                JOIN usuarios u ON r.usuario_id = u.id
                WHERE r.producto_id = %s AND r.visible = 1
                ORDER BY r.fecha DESC
            """
            cursor.execute(sql, (producto_id,))
            reviews = cursor.fetchall()

        return jsonify({'mensaje': "Reviews consultadas.", 'exito': True, 'data': reviews}), 200

    except Exception as ex:
        return jsonify({'mensaje': f"Error al consultar reviews: {ex}", 'exito': False}), 500
    finally:
        if connection: connection.close()
