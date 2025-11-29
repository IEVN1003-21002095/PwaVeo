from flask import Blueprint, request, jsonify
from controllers.orders_controller import OrdersController

orders_bp = Blueprint('orders_bp', __name__)
controller = OrdersController()

@orders_bp.route('/my-orders/<int:usuario_id>', methods=['GET'])
def my_orders(usuario_id):
    result = controller.get_orders_by_user(usuario_id)
    if result['success']:
        return jsonify(result['data']), 200
    return jsonify({'error': result['error']}), 500

@orders_bp.route('/my-orders/detail/<int:venta_id>', methods=['GET'])
def order_detail(venta_id):
    result = controller.get_order_detail(venta_id)
    if result['success']:
        return jsonify(result['data']), 200
    
    status = result.get('status', 500)
    return jsonify({'message': result.get('message', result.get('error'))}), status