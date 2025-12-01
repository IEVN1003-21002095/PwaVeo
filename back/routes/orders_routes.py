# orders_routes.py
from flask import Blueprint
from controllers.orders_controller import get_orders_history, get_order_details, update_user_profile
from flask_jwt_extended import jwt_required

orders_bp = Blueprint('orders_bp', __name__, url_prefix='/api/client')

# Ruta para el historial de pedidos del usuario autenticado
@orders_bp.route('/orders', methods=['GET'])
@jwt_required()
def orders_history():
    return get_orders_history()

# Ruta para el detalle de un pedido específico
@orders_bp.route('/orders/<int:order_id>', methods=['GET'])
@jwt_required()
def order_details(order_id):
    return get_order_details(order_id)

# Ruta para actualizar el perfil del usuario
@orders_bp.route('/profile', methods=['PUT'])
@jwt_required()
def profile_update():
    return update_user_profile()