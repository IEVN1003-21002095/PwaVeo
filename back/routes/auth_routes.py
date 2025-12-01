from flask import Blueprint, request, jsonify
from controllers.auth_controller import AuthController
# Opcional: Si necesitas proteger alguna ruta futura
from flask_jwt_extended import jwt_required 

# 👇 AQUÍ DEFINIMOS EL BLUEPRINT CORRECTO (auth_bp)
auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")
controller = AuthController()

# ------------------ RUTAS DE AUTENTICACIÓN ------------------

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