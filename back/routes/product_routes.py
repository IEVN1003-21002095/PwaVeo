from flask import Blueprint
from controllers.product_controller import (
    obtener_productos,
    obtener_producto_por_id,
    registrar_producto,
    actualizar_producto,
    eliminar_producto,
    actualizar_stock_variante
)

product_bp = Blueprint("product_bp", __name__)

@product_bp.route("/", methods=["GET"])
def get_all_products():
    return obtener_productos()

@product_bp.route("/", methods=["POST"])
def create_product():
    return registrar_producto()

@product_bp.route("/<int:id>", methods=["GET"])
def get_product(id):
    return obtener_producto_por_id(id)

@product_bp.route("/<int:id>", methods=["PUT"])
def update_product(id):
    return actualizar_producto(id)

@product_bp.route("/<int:id>", methods=["DELETE"])
def delete_product(id):
    return eliminar_producto(id)

@product_bp.route("/stock/<int:inventario_id>", methods=["PUT"])
def update_stock(inventario_id):
    return actualizar_stock_variante(inventario_id)
