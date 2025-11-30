from flask import Blueprint, jsonify, request
from controllers.auth_controller import AuthController
# 👇 1. IMPORTANTE: Importamos el cadenero de JWT
from flask_jwt_extended import jwt_required

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")
controller = AuthController()

# ------------------ RUTAS USUARIOS (PÚBLICAS) ------------------
# Estas NO llevan candado porque aquí es donde obtienes la llave

@auth_bp.post("/register")
def register_user():
    data = request.get_json(silent=True) or {}
    return controller.registrar_usuario(data)

@auth_bp.post("/login")
def login_user():
    data = request.get_json(silent=True) or {}
    return controller.iniciar_sesion(data)

@auth_bp.post("/recover")
def recover_password():
    data = request.get_json(silent=True) or {}
    return controller.recuperar_contrasena(data)

# ------------------ RUTAS CLIENTES (PRIVADAS / PROTEGIDAS) ------------------
# 👇 2. IMPORTANTE: Agregamos @jwt_required() para exigir la llave maestra

@auth_bp.get("/clientes")
@jwt_required() # <--- ¡CANDADO PUESTO!
def get_clientes():
    return controller.list_clientes()

@auth_bp.post("/clientes")
@jwt_required() # <--- ¡CANDADO PUESTO!
def create_cliente():
    data = request.get_json(silent=True) or {}
    return jsonify(controller.crear_cliente(data))

@auth_bp.put("/clientes/<int:cliente_id>")
@jwt_required() # <--- ¡CANDADO PUESTO!
def update_cliente(cliente_id):
    data = request.get_json(silent=True) or {}
    return jsonify(controller.actualizar_cliente(cliente_id, data))

@auth_bp.delete("/clientes/<int:cliente_id>")
@jwt_required() # <--- ¡CANDADO PUESTO!
def delete_cliente(cliente_id):
    return jsonify(controller.eliminar_cliente(cliente_id))