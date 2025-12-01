from flask import Blueprint, jsonify
from controllers.catalog_controller import CatalogController

catalog_bp = Blueprint("catalog", __name__, url_prefix="/api/catalog")
controller = CatalogController()

# =========================================================
# CATALOGO GENERAL 
# =========================================================
@catalog_bp.route('/list', methods=['GET'])
def catalog_products():
    result = controller.list_catalog_products()
    return jsonify(result), 200

# =========================================================
# DETALLE DE PRODUCTO (con variaciones)
# =========================================================
@catalog_bp.route('/<int:product_id>', methods=['GET'])
def product_detail(product_id):
    result = controller.get_product_detail(product_id)
    return jsonify(result), 200
