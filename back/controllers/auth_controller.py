from flask import jsonify, request
from database import get_connection, leer_usuario_bd, leer_cliente_por_usuario_id
import datetime


# ============================================================
#   HASH BÁSICO (solo pruebas)
# ============================================================

def hashear_contrasena(password: str):
    return password + "_hashed"

def verificar_contrasena(hash_almacenado, password):
    return hash_almacenado == (password + "_hashed")


# ============================================================
#   REGISTRO DE USUARIO + CLIENTE
# ============================================================

def registrar_usuario():
    """
    Registra un usuario en 'usuarios' y automáticamente crea
    un registro en 'clientes' con valores por defecto.
    """
    connection = None
    try:
        data = request.json or {}

        nombre = data.get("nombre")
        apellido = data.get("apellido")
        correo = data.get("correo")
        contrasena = data.get("contrasena")
        rol = data.get("rol", "cliente")   # Valor por defecto

        if not all([nombre, apellido, correo, contrasena]):
            return jsonify({"mensaje": "Faltan datos obligatorios.", "exito": False}), 400

        # Validar correo único
        usuario_existente = leer_usuario_bd(correo)
        if usuario_existente:
            return jsonify({"mensaje": "El correo ya está registrado.", "exito": False}), 400

        contrasena_hash = hashear_contrasena(contrasena)

        connection = get_connection()
        cursor = connection.cursor()

        # INSERT usuario en tabla usuarios
        sql_user = """
            INSERT INTO usuarios 
            (nombre, apellido, correo, contrasena, rol, activo, creado_en, actualizado_en, verificado)
            VALUES (%s, %s, %s, %s, %s, 1, NOW(), NOW(), 0)
        """
        cursor.execute(sql_user, (nombre, apellido, correo, contrasena_hash, rol))
        usuario_id = cursor.lastrowid

        # INSERT cliente si el rol es cliente
        if rol == "cliente":
            sql_cliente = """
                INSERT INTO clientes
                (usuario_id, direccion, telefono, fecha_registro,
                 acepta_terminos, acepta_privacidad,
                 fecha_aceptacion_terminos, fecha_aceptacion_privacidad)
                VALUES (%s, '', '', NOW(), 1, 1, NOW(), NOW())
            """
            cursor.execute(sql_cliente, (usuario_id,))

        connection.commit()

        return jsonify({
            "mensaje": "Usuario y cliente creados correctamente.",
            "exito": True,
            "usuario_id": usuario_id
        }), 201

    except Exception as ex:
        if connection:
            connection.rollback()
        return jsonify({
            "mensaje": f"Error al registrar usuario: {ex}",
            "exito": False
        }), 500

    finally:
        if connection:
            connection.close()


# ============================================================
#   LOGIN
# ============================================================

def iniciar_sesion():
    """
    Valida correo y contraseña, devuelve rol e ID.
    """
    try:
        data = request.json or {}

        correo = data.get("correo")
        contrasena = data.get("contrasena")

        if not correo or not contrasena:
            return jsonify({"mensaje": "Correo y contraseña requeridos.", "exito": False}), 400

        usuario = leer_usuario_bd(correo)
        if not usuario:
            return jsonify({"mensaje": "Credenciales incorrectas.", "exito": False}), 401

        if not verificar_contrasena(usuario["contrasena"], contrasena):
            return jsonify({"mensaje": "Credenciales incorrectas.", "exito": False}), 401

        return jsonify({
            "mensaje": "Inicio de sesión exitoso.",
            "exito": True,
            "usuario_id": usuario["id"],
            "rol": usuario["rol"],
        }), 200

    except Exception as ex:
        return jsonify({
            "mensaje": f"Error al iniciar sesión: {ex}",
            "exito": False
        }), 500


# ============================================================
#   RECUPERACIÓN DE CONTRASEÑA
# ============================================================

def recuperar_contrasena():
    """
    Simula enviar un email de recuperación.
    """
    try:
        data = request.json or {}
        correo = data.get("correo")

        if not correo:
            return jsonify({"mensaje": "Correo requerido.", "exito": False}), 400

        usuario = leer_usuario_bd(correo)

        if usuario:
            print(f"[DEBUG] Enviando correo de recuperación a {correo}")

        return jsonify({
            "mensaje": "Si el correo existe, se enviará un enlace.",
            "exito": True
        }), 200

    except Exception as ex:
        return jsonify({
            "mensaje": f"Error al recuperar contraseña: {ex}",
            "exito": False
        }), 500
