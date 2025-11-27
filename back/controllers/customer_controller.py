from flask import jsonify, request
from database import get_connection, leer_cliente_por_usuario_id


def obtener_cliente_por_cliente_id(usuario_id):
    """
    Consulta el perfil del cliente usando el usuario_id.
    """
    try:
        cliente = leer_cliente_por_usuario_id(usuario_id)

        if cliente is None:
            return jsonify({'mensaje': "Cliente no encontrado", 'exito': False}), 404

        return jsonify({'mensaje': "Cliente consultado", 'exito': True, 'data': cliente}), 200

    except Exception as ex:
        return jsonify({'mensaje': f"Error en consulta de cliente: {ex}", 'exito': False}), 500



def actualizar_cliente(usuario_id):
    """
    Actualiza datos del cliente.
    Puedes agregar más campos dependiendo de tu tabla.
    """
    try:
        data = request.json

        connection = get_connection()
        with connection.cursor() as cursor:
            sql = """
                UPDATE clientes
                SET telefono = %s,
                    direccion = %s
                WHERE usuario_id = %s
            """

            cursor.execute(sql, (
                data.get("telefono"),
                data.get("direccion"),
                usuario_id
            ))

            connection.commit()

        return jsonify({'mensaje': "Cliente actualizado correctamente", 'exito': True}), 200

    except Exception as ex:
        return jsonify({'mensaje': f"Error al actualizar cliente: {ex}", 'exito': False}), 500



def eliminar_cliente(usuario_id):
    """
    Elimina lógicamente un cliente (soft delete).
    """
    try:
        connection = get_connection()

        with connection.cursor() as cursor:
            sql = "UPDATE clientes SET estado = 'inactivo' WHERE usuario_id = %s"
            cursor.execute(sql, (usuario_id,))
            connection.commit()

        return jsonify({'mensaje': "Cliente eliminado correctamente", 'exito': True}), 200

    except Exception as ex:
        return jsonify({'mensaje': f"Error al eliminar cliente: {ex}", 'exito': False}), 500