from flask import Blueprint, request, jsonify
from controllers.product_controller import ProductController

product_bp = Blueprint("product", __name__, url_prefix="/api/product")
controller = ProductController()

# =========================================================
# PRODUCTOS
# =========================================================
@product_bp.route('/list', methods=['GET'])
def list_products():
    try:
        return jsonify(controller.list_products()), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


@product_bp.route('/create', methods=['POST'])
def create_product():
    data = request.get_json(silent=True) or {}
    try:
        return jsonify(controller.create(data)), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


@product_bp.route('/<int:product_id>/update', methods=['PUT'])
def update_product(product_id):
    data = request.get_json(silent=True) or {}
    try:
        return jsonify(controller.update(product_id, data)), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


@product_bp.route('/<int:product_id>/delete', methods=['DELETE'])
def delete_product(product_id):
    try:
        return jsonify(controller.delete(product_id)), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

# =========================================================
# INVENTARIO
# =========================================================
@product_bp.route('/<int:product_id>/inventory', methods=['GET'])
def get_inventory(product_id):
    try:
        return jsonify(controller.get_inventory(product_id)), 200
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
        return jsonify(controller.add_variant(data)), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


@product_bp.route('/inventory/<int:inventory_id>/update', methods=['PUT'])
def update_variant(inventory_id):
    data = request.get_json(silent=True) or {}
    try:
        return jsonify(controller.update_variant(inventory_id, data)), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


@product_bp.route('/inventory/<int:inventory_id>/delete', methods=['DELETE'])
def delete_variant(inventory_id):
    try:
        return jsonify(controller.delete_variant(inventory_id)), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

# =========================================================
# GESTIÓN DE IMÁGENES
# =========================================================
@product_bp.route('/<int:product_id>/images', methods=['GET'])
def get_product_images(product_id):
    """Obtener todas las imágenes de un producto"""
    try:
        return jsonify(controller.get_product_images(product_id)), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


@product_bp.route('/images/add', methods=['POST'])
def add_product_image():
    """Agregar una imagen a un producto"""
    data = request.get_json(silent=True) or {}
    try:
        return jsonify(controller.add_product_image(data)), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


@product_bp.route('/images/<int:image_id>/update', methods=['PUT'])
def update_product_image(image_id):
    """Actualizar una imagen (cambiar imagen o color)"""
    data = request.get_json(silent=True) or {}
    try:
        return jsonify(controller.update_product_image(image_id, data)), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


@product_bp.route('/images/<int:image_id>/delete', methods=['DELETE'])
def delete_product_image(image_id):
    """Eliminar una imagen"""
    try:
        return jsonify(controller.delete_product_image(image_id)), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


@product_bp.route('/images/<int:image_id>/set-principal', methods=['PUT'])
def set_principal_image(image_id):
    """Marcar una imagen como principal"""
    try:
        return jsonify(controller.set_principal_image(image_id)), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

