from flask import Blueprint
from controllers.checkout_controller import (
    guardar_direccion,
    validar_metodo_pago,
    confirmar_pedido
)

checkout_bp = Blueprint("checkout_bp", __name__)

@checkout_bp.route("/address/<int:usuario_id>", methods=["POST"])
def save_address(usuario_id):
    return guardar_direccion(usuario_id)

@checkout_bp.route("/payment/<int:metodo_pago_id>/validate", methods=["GET"])
def validate_payment_method(metodo_pago_id):
    return validar_metodo_pago(metodo_pago_id)

@checkout_bp.route("/confirm", methods=["POST"])
def confirm_order():
    return confirmar_pedido()
