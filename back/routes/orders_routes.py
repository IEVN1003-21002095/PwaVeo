# orders_routes.py
from flask import Blueprint
from controllers.orders_controller import get_orders_history, get_order_details, update_user_profile

orders_bp = Blueprint('orders_bp', __name__, url_prefix='/api/client')

# Ruta para el Criterio 2, 3, 6, 8, 9, 10 (Listado/Historial)
orders_bp.route('/orders', methods=['GET'])(get_orders_history)

# Ruta para el Criterio 4, 5 (Detalle de un pedido)
orders_bp.route('/orders/<int:order_id>', methods=['GET'])(get_order_details)

# Ruta para el Criterio 7 (Edición de perfil)
orders_bp.route('/profile', methods=['PUT'])(update_user_profile)