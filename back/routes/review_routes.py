from flask import Blueprint
from controllers.review_controller import (
    create_review,
    get_reviews_by_product,
    get_all_reviews,
    approve_review,
    reject_review,
    delete_review,
    get_products_list,
    get_clients_list
)

review_bp = Blueprint("review_bp", __name__)

# --- Rutas de Lectura (Selectores) ---
review_bp.get("/api/products-list")(get_products_list)
review_bp.get("/api/clients-list")(get_clients_list)

# --- Rutas de Cliente ---
review_bp.post("/api/reviews")(create_review)
review_bp.get("/api/reviews/product/<int:producto_id>")(get_reviews_by_product)

# --- Rutas de Admin ---
review_bp.get("/api/reviews/all")(get_all_reviews)
review_bp.put("/api/reviews/<int:review_id>/approve")(approve_review)
review_bp.put("/api/reviews/<int:review_id>/reject")(reject_review)
review_bp.delete("/api/reviews/<int:review_id>")(delete_review)