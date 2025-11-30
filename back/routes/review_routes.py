from flask import Blueprint
from controllers.review_controller import (
    create_review,
    get_reviews_by_product,
    get_all_reviews,
    approve_review,
    reject_review,
    delete_review
)

review_bp = Blueprint("review_bp", __name__)

# Cliente
review_bp.post("/reviews")(create_review)
review_bp.get("/reviews/product/<int:producto_id>")(get_reviews_by_product)

# Admin
review_bp.get("/reviews/all")(get_all_reviews)
review_bp.put("/reviews/<int:review_id>/approve")(approve_review)
review_bp.put("/reviews/<int:review_id>/reject")(reject_review)
review_bp.delete("/reviews/<int:review_id>")(delete_review)