from flask import Blueprint
from controllers.review_controller import (
    actualizar_visibilidad_review,
    obtener_reviews_por_producto
)

review_bp = Blueprint("review_bp", __name__)

@review_bp.route("/<int:review_id>/visibility", methods=["PUT"])
def update_review_visibility(review_id):
    return actualizar_visibilidad_review(review_id)

@review_bp.route("/product/<int:producto_id>", methods=["GET"])
def get_visible_reviews(producto_id):
    return obtener_reviews_por_producto(producto_id)
