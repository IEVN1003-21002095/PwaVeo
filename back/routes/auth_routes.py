from flask import Blueprint
from controllers.auth_controller import (
    registrar_usuario,
    iniciar_sesion,
    recuperar_contrasena
)

auth_bp = Blueprint("auth_bp", __name__, url_prefix="/api/auth")

auth_bp.post("/register")(registrar_usuario)
auth_bp.post("/login")(iniciar_sesion)
auth_bp.post("/recover")(recuperar_contrasena)
