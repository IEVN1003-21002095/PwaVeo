from flask import jsonify, request
from database import get_connection
import datetime
import bcrypt
import jwt

SECRET_KEY = "CAMBIA_ESTO_POR_UNA_LLAVE_SECRETA"


# ============================================================
#   HASH Y VERIFICACIÓN
# ============================================================

def hashear_contrasena(password: str):
    password_bytes = password.encode("utf-8")
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password_bytes, salt).decode("utf-8")

def verificar_contrasena(hash_almacenado, password):
    return bcrypt.checkpw(password.encode("utf-8"), hash_almacenado.encode("utf-8"))


# ============================================================
#   OBTENER USUARIO DESDE BASE DE DATOS
# ============================================================

def leer_usuario_bd(correo):
    connection = get_connection()
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM usuarios WHERE correo = %s", (correo,))
            return cursor.fetchone()
    finally:
        connection.close()


# ============================================================
#   ENDPOINT: LEER USUARIO POR CORREO
# ============================================================

def endpoint_leer_usuario():
    try:
        data = request.json or {}
        correo = data.get("correo")

        if not correo:
            return jsonify({"exito": False, "mensaje": "Correo requerido"}), 400

        usuario = leer_usuario_bd(correo)

        if not usuario:
            return jsonify({"exito": False, "mensaje": "Usuario no encontrado"}), 404

        return jsonify({"exito": True, "usuario": usuario}), 200

    except Exception as ex:
        return jsonify({"exito": False, "mensaje": str(ex)}), 500


# ============================================================
#   REGISTRO DE USUARIO
# ============================================================

def registrar_usuario():
    connection = None
    try:
        data = request.json or {}
        nombre = data.get("nombre")
        apellido = data.get("apellido")
        correo = data.get("correo")
        contrasena = data.get("contrasena")
        confirmar = data.get("confirmar")
        rol = data.get("rol", "comprador")

        if not all([nombre, correo, contrasena]):
            return jsonify({"mensaje": "Nombre, correo y contraseña son obligatorios.", "exito": False}), 400

        if "@" not in correo:
            return jsonify({"mensaje": "Correo inválido.", "exito": False}), 400

        if contrasena != confirmar:
            return jsonify({"mensaje": "Las contraseñas no coinciden.", "exito": False}), 400

        usuario_existente = leer_usuario_bd(correo)
        if usuario_existente:
            return jsonify({"mensaje": "El correo ya está registrado.", "exito": False}), 400

        contrasena_hash = hashear_contrasena(contrasena)

        connection = get_connection()
        cursor = connection.cursor()

        sql_usuario = """
            INSERT INTO usuarios
            (nombre, apellido, correo, contrasena, rol, activo, creado_en, actualizado_en, verificado)
            VALUES (%s, %s, %s, %s, %s, 1, NOW(), NOW(), 0)
        """
        cursor.execute(sql_usuario, (nombre, apellido, correo, contrasena_hash, rol))
        usuario_id = cursor.lastrowid

        sql_cliente = """
            INSERT INTO clientes
            (usuario_id, direccion, telefono, fecha_registro,
             acepta_terminos, acepta_privacidad,
             fecha_aceptacion_terminos, fecha_aceptacion_privacidad)
            VALUES (%s, '', '', NOW(), 1, 1, NOW(), NOW())
        """
        cursor.execute(sql_cliente, (usuario_id,))

        connection.commit()

        return jsonify({"mensaje": "Usuario registrado correctamente.", "exito": True, "usuario_id": usuario_id}), 201

    except Exception as ex:
        if connection:
            connection.rollback()
        return jsonify({"mensaje": f"Error: {ex}", "exito": False}), 500

    finally:
        if connection:
            connection.close()


# ============================================================
#   LOGIN
# ============================================================

def iniciar_sesion():
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

        token = jwt.encode({
            "usuario_id": usuario["id"],
            "rol": usuario["rol"],
            "exp": datetime.datetime.utcnow() + datetime.timedelta(minutes=30)
        }, SECRET_KEY, algorithm="HS256")

        return jsonify({
            "mensaje": "Inicio de sesión exitoso.",
            "exito": True,
            "token": token,
            "usuario_id": usuario["id"],
            "rol": usuario["rol"]
        }), 200

    except Exception as ex:
        return jsonify({"mensaje": f"Error: {ex}", "exito": False}), 500


# ============================================================
#   RECUPERAR CONTRASEÑA
# ============================================================

def recuperar_contrasena():
    try:
        data = request.json or {}
        correo = data.get("correo")

        if not correo:
            return jsonify({"mensaje": "Correo requerido.", "exito": False}), 400

        usuario = leer_usuario_bd(correo)

        print(f"[DEBUG] Solicitud de recuperación: {correo}")

        return jsonify({
            "mensaje": "Si el correo existe, se enviará un enlace.",
            "exito": True
        }), 200

    except Exception as ex:
        return jsonify({"mensaje": f"Error: {ex}", "exito": False}), 500



# ============================================================
#   ENDPOINT: LISTAR TODOS LOS CLIENTES
# ============================================================

def get_all_clientes():
    try:
        connection = get_connection()
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM clientes")
            clientes = cursor.fetchall()

        return jsonify({"exito": True, "clientes": clientes}), 200

    except Exception as ex:
        return jsonify({"exito": False, "mensaje": str(ex)}), 500

    finally:
        connection.close()
