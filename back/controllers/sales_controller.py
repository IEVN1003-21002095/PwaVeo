from flask import jsonify
from database import get_connection

def obtener_listado_ventas():
    connection = None
    try:
        connection = get_connection()
        with connection.cursor() as cursor:
            sql = """
                SELECT 
                    v.id,
                    v.fecha_venta,
                    v.total,
                    v.estado AS estado_pago,
                    u.nombre,
                    u.apellido
                FROM ventas v
                JOIN usuarios u ON v.usuario_id = u.id
                ORDER BY v.fecha_venta DESC
            """
            cursor.execute(sql)
            ventas = cursor.fetchall()

        return jsonify({
            'mensaje': "Ventas consultadas.",
            'exito': True,
            'data': ventas
        }), 200

    except Exception as ex:
        return jsonify({'mensaje': f"Error al consultar ventas: {ex}", 'exito': False}), 500
    finally:
        if connection: connection.close()
