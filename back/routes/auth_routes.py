from flask import Blueprint, request, jsonify
from controllers.auth_controller import AuthController

auth_bp = Blueprint("auth_bp", __name__, url_prefix="/api/auth")
controller = AuthController()

# ------------------- USUARIOS -------------------
auth_bp.post("/register")(lambda: jsonify(controller.registrar_usuario(request.json)))
auth_bp.post("/login")(lambda: jsonify(controller.iniciar_sesion(request.json)))
auth_bp.post("/recover")(lambda: jsonify(controller.recuperar_contrasena(request.json)))

# ------------------- CLIENTES -------------------
@auth_bp.get("/clientes")
def listar_clientes():
    return jsonify(controller.list_clientes())

@auth_bp.get("/cliente/<int:cliente_id>")
def obtener_cliente(cliente_id):
    return jsonify(controller.obtener_cliente(cliente_id))

@auth_bp.post("/cliente")
def crear_cliente():
    return jsonify(controller.crear_cliente(request.json))

@auth_bp.put("/cliente/<int:cliente_id>")
def modificar_cliente(cliente_id):
    return jsonify(controller.actualizar_cliente(cliente_id, request.json))

@auth_bp.delete("/cliente/<int:cliente_id>")
def borrar_cliente(cliente_id):
    return jsonify(controller.eliminar_cliente(cliente_id))
