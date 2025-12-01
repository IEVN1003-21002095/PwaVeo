from flask import Blueprint, request, jsonify
from controllers.product_controller import ProductController

product_bp = Blueprint("product", __name__)
controller = ProductController()

# =========================================================
# RUTAS PRODUCTOS
# =========================================================
@product_bp.route('/list', methods=['GET'])
def list_products():
    try:
        result = controller.list_products()
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@product_bp.route('/create', methods=['POST'])
def create_product():
    data = request.get_json(silent=True) or {}
    try:
        result = controller.create(data)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@product_bp.route('/<int:product_id>/update', methods=['PUT'])
def update_product(product_id):
    data = request.get_json(silent=True) or {}
    try:
        result = controller.update(product_id, data)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@product_bp.route('/<int:product_id>/delete', methods=['DELETE'])
def delete_product(product_id):
    try:
        result = controller.delete(product_id)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

# =========================================================
# RUTAS INVENTARIO / VARIANTES
# =========================================================
@product_bp.route('/<int:product_id>/inventory', methods=['GET'])
def get_inventory(product_id):
    try:
        result = controller.get_inventory(product_id)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@product_bp.route('/inventory/<int:inventory_id>', methods=['GET'])
def get_variant_route(inventory_id):
    try:
        result = controller.get_variant(inventory_id)
        if isinstance(result, tuple):
            data, status = result
            return jsonify(data), status
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@product_bp.route('/inventory/add', methods=['POST'])
def add_variant():
    data = request.get_json(silent=True) or {}
    try:
        result = controller.add_variant(data)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@product_bp.route('/inventory/<int:inventory_id>/update', methods=['PUT'])
def update_variant(inventory_id):
    data = request.get_json(silent=True) or {}
    try:
        result = controller.update_variant(inventory_id, data)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@product_bp.route('/inventory/<int:inventory_id>/delete', methods=['DELETE'])
def delete_variant(inventory_id):
    try:
        result = controller.delete_variant(inventory_id)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
