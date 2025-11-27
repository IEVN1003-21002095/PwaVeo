from flask import Blueprint
from controllers.customer_controller import (
    obtener_cliente_por_cliente_id,
    actualizar_cliente,
    eliminar_cliente
)

customer_bp = Blueprint("customer_bp", __name__)

@customer_bp.route("/<int:usuario_id>", methods=["GET"])
def get_customer(usuario_id):
    return obtener_cliente_por_cliente_id(usuario_id)

@customer_bp.route("/<int:usuario_id>", methods=["PUT"])
def update_customer(usuario_id):
    return actualizar_cliente(usuario_id)

@customer_bp.route("/<int:usuario_id>", methods=["DELETE"])
def delete_customer(usuario_id):
    return eliminar_cliente(usuario_id)
