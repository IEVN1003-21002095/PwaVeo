from flask import jsonify
from database import get_connection
import datetime
import bcrypt
# 👇 IMPORTANTE: Importamos la función para crear la llave maestra
from flask_jwt_extended import create_access_token

class AuthController:

    # ---------------- HASH Y VERIFICACIÓN ----------------
    def hashear_contrasena(self, password: str):
        salt = bcrypt.gensalt()
        return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")

    def verificar_contrasena(self, hash_almacenado, password):
        return bcrypt.checkpw(password.encode("utf-8"), hash_almacenado.encode("utf-8"))

    # ---------------- BASE DE DATOS ----------------
    def leer_usuario_bd(self, correo):
        connection = get_connection()
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT * FROM usuarios WHERE correo = %s", (correo,))
                return cursor.fetchone()
        finally:
            connection.close()

    # ---------------- USUARIOS ----------------
    def registrar_usuario(self, data):
        # 1. Mapeo de datos (Compatibilidad Front-Back)
        nombre = data.get("nombre")
        apellido = data.get("apellido", "") # Opcional, por defecto vacío
        correo = data.get("email") or data.get("correo") # Aceptamos ambos
        contrasena = data.get("password") or data.get("contrasena")
        rol = data.get("rol", "cliente") # Por defecto 'cliente'

        # 2. Validaciones básicas
        if not nombre or not correo or not contrasena:
            return jsonify({"mensaje": "Faltan datos: nombre, correo y contraseña son obligatorios.", "exito": False}), 400

        if "@" not in correo:
            return jsonify({"mensaje": "Correo inválido.", "exito": False}), 400

        # Validamos si ya existe
        if self.leer_usuario_bd(correo):
            return jsonify({"mensaje": "El correo ya está registrado.", "exito": False}), 400

        connection = None
        try:
            contrasena_hash = self.hashear_contrasena(contrasena)
            connection = get_connection()
            cursor = connection.cursor()

            # Insertamos en tabla USUARIOS
            cursor.execute("""
                INSERT INTO usuarios 
                (nombre, apellido, correo, contrasena, rol, activo, creado_en, actualizado_en, verificado)
                VALUES (%s, %s, %s, %s, %s, 1, NOW(), NOW(), 0)
            """, (nombre, apellido, correo, contrasena_hash, rol))
            
            usuario_id = cursor.lastrowid

            # Insertamos en tabla CLIENTES (Perfil vacío inicial)
            cursor.execute("""
                INSERT INTO clientes 
                (usuario_id, direccion, telefono, fecha_registro, 
                 acepta_terminos, acepta_privacidad, 
                 fecha_aceptacion_terminos, fecha_aceptacion_privacidad)
                VALUES (%s, '', '', NOW(), 1, 1, NOW(), NOW())
            """, (usuario_id,))

            connection.commit()
            
            return jsonify({
                "mensaje": "Usuario registrado correctamente.", 
                "exito": True, 
                "usuario_id": usuario_id
            }), 201

        except Exception as ex:
            if connection:
                connection.rollback()
            import traceback
            traceback.print_exc()
            return jsonify({"mensaje": f"Error interno: {ex}", "exito": False}), 500
        finally:
            if connection:
                connection.close()

    def iniciar_sesion(self, data):
        # 1. Mapeo de datos
        correo = data.get("email") or data.get("correo")
        contrasena = data.get("password") or data.get("contrasena")

        if not correo or not contrasena:
            return jsonify({"mensaje": "Faltan correo o contraseña.", "exito": False}), 400

        # 2. Buscar usuario
        usuario = self.leer_usuario_bd(correo)
        
        # 3. Verificar contraseña
        if not usuario or not self.verificar_contrasena(usuario["contrasena"], contrasena):
            return jsonify({"mensaje": "Credenciales incorrectas.", "exito": False}), 401

        # 4. GENERACIÓN DE LA LLAVE MAESTRA (JWT) 🔥
        # Convertimos el ID a string por seguridad
        access_token = create_access_token(identity=str(usuario["id"]))

        return jsonify({
            "mensaje": "Inicio de sesión exitoso.",
            "exito": True,
            "token": access_token, # <--- ¡AQUÍ VA LA LLAVE!
            "usuario": {
                "id": usuario["id"],
                "nombre": usuario["nombre"],
                "rol": usuario["rol"]
            }
        }), 200

    # ---------------- RECUPERAR CONTRASEÑA ----------------
    def recuperar_contrasena(self, data):
        correo = data.get("email") or data.get("correo")
        
        if not correo:
            return jsonify({"mensaje": "Correo requerido.", "exito": False}), 400
        try:
            self.leer_usuario_bd(correo)
            return jsonify({"mensaje": "Si el correo existe, se enviará un enlace.", "exito": True}), 200
        except Exception as ex:
            import traceback
            traceback.print_exc()
            return jsonify({"mensaje": f"Error interno: {ex}", "exito": False}), 500

    # ---------------- CLIENTES ----------------
    def list_clientes(self):
        try:
            connection = get_connection()
            with connection.cursor() as cursor:
                cursor.execute("SELECT * FROM clientes")
                clientes = cursor.fetchall()
            return jsonify({"exito": True, "clientes": clientes}), 200
        except Exception as ex:
            import traceback
            traceback.print_exc()
            return jsonify({"exito": False, "mensaje": str(ex)}), 500
        finally:
            if connection:
                connection.close()

    # ---------------- PLACEHOLDERS ----------------
    def obtener_cliente(self, cliente_id):
        return {"mensaje": "Función no implementada", "exito": False}

    def crear_cliente(self, data):
        return {"mensaje": "Función no implementada", "exito": False}

    def actualizar_cliente(self, cliente_id, data):
        return {"mensaje": "Función no implementada", "exito": False}

    def eliminar_cliente(self, cliente_id):
        return {"mensaje": "Función no implementada", "exito": False}