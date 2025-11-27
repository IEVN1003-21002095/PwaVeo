from flask import jsonify, request
from database import get_connection, leer_materia_prima_bd

def registrar_materia_prima():
    connection = None
    try:
        data = request.json
        required = ["nombre", "unidad_medida", "stock_inicial"]

        for r in required:
            if r not in data:
                return jsonify({'mensaje': f"Falta {r}", 'exito': False}), 400

        connection = get_connection()
        with connection.cursor() as cursor:
            sql = """
                INSERT INTO materia_prima (nombre, unidad_medida, stock_actual)
                VALUES (%s, %s, %s)
            """
            cursor.execute(sql, (
                data["nombre"],
                data["unidad_medida"],
                data["stock_inicial"]
            ))
            connection.commit()

        return jsonify({'mensaje': "Materia prima registrada.", 'exito': True}), 201

    except Exception as ex:
        if connection: connection.rollback()
        return jsonify({'mensaje': f"Error: {ex}", 'exito': False}), 500
    finally:
        if connection: connection.close()


def obtener_materia_prima():
    connection = None
    try:
        connection = get_connection()
        with connection.cursor() as cursor:
            sql = "SELECT id, nombre, unidad_medida, stock_actual FROM materia_prima"
            cursor.execute(sql)
            materia = cursor.fetchall()

        return jsonify({'mensaje': "Materia consultada.", 'exito': True, 'data': materia}), 200

    except Exception as ex:
        return jsonify({'mensaje': f"Error: {ex}", 'exito': False}), 500
    finally:
        if connection: connection.close()


def actualizar_materia_prima(materia_prima_id):
    connection = None
    try:
        data = request.json
        existente = leer_materia_prima_bd(materia_prima_id)

        if existente is None:
            return jsonify({'mensaje': "No existe.", 'exito': False}), 404

        connection = get_connection()
        fields = []
        values = []

        if "nombre" in data:
            fields.append("nombre = %s")
            values.append(data["nombre"])

        if "unidad_medida" in data:
            fields.append("unidad_medida = %s")
            values.append(data["unidad_medida"])

        if "stock_actual" in data:
            fields.append("stock_actual = %s")
            values.append(data["stock_actual"])

        if not fields:
            return jsonify({'mensaje': "Nada que actualizar.", 'exito': False}), 400

        sql = f"UPDATE materia_prima SET {', '.join(fields)} WHERE id = %s"
        values.append(materia_prima_id)

        with connection.cursor() as cursor:
            cursor.execute(sql, values)
            connection.commit()

        return jsonify({'mensaje': "Materia actualizada.", 'exito': True}), 200

    except Exception as ex:
        if connection: connection.rollback()
        return jsonify({'mensaje': f"Error: {ex}", 'exito': False}), 500
    finally:
        if connection: connection.close()


def eliminar_materia_prima(materia_prima_id):
    connection = None
    try:
        existente = leer_materia_prima_bd(materia_prima_id)
        if existente is None:
            return jsonify({'mensaje': "No existe.", 'exito': False}), 404

        connection = get_connection()
        with connection.cursor() as cursor:
            cursor.execute("DELETE FROM materia_prima WHERE id = %s", (materia_prima_id,))
            connection.commit()

        return jsonify({'mensaje': "Materia eliminada.", 'exito': True}), 200

    except Exception as ex:
        if connection: connection.rollback()
        return jsonify({'mensaje': f"Error: {ex}", 'exito': False}), 500
    finally:
        if connection: connection.close()
