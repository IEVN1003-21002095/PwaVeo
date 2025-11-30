from flask import Blueprint, jsonify
from controllers.catalog_controller import CatalogController

catalog_bp = Blueprint("catalog", __name__)
controller = CatalogController()

# =========================================================
# CATALOGO GENERAL (solo info general)
# =========================================================
@catalog_bp.route('/', methods=['GET'])
def catalog_products():
    result = controller.list_catalog_products()
    return jsonify(result), 200

# =========================================================
# DETALLE DE PRODUCTO (con variaciones de color y talla)
# =========================================================
@catalog_bp.route('/<int:product_id>', methods=['GET'])
def product_detail(product_id):
    result = controller.get_product_detail(product_id)
    return jsonify(result), 200
