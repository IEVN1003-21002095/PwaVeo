from flask import Blueprint, request, jsonify
from controllers.cart_controller import CartController

cart_bp = Blueprint('cart', __name__, url_prefix='/api/cart')
controller = CartController()


@cart_bp.route('/validate', methods=['POST'])
def validate_cart():
    data = request.get_json(silent=True) or {}
    cart = data.get('cart') or []
    try:
        result = controller.validate_cart(cart)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@cart_bp.route('/add', methods=['POST'])
def add_to_cart():
    # Endpoint auxiliar que valida y responde si se puede agregar (no persiste en servidor por ahora)
    data = request.get_json(silent=True) or {}
    item = data.get('item')
    if not item:
        return jsonify({'success': False, 'message': 'item es requerido'}), 400
    try:
        resp = controller.validate_cart([item])
        return jsonify(resp), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500
