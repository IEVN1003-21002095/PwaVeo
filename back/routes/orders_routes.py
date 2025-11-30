from flask import Blueprint
from controllers.orders_controller import OrdersController
from middleware.auth_middleware import auth_required  # si usas JWT

orders_bp = Blueprint('orders_bp', __name__)


# ---------------------------------------------------
# 1. Obtener todos los pedidos del cliente actual
# ---------------------------------------------------
@orders_bp.get('/my/orders')
@auth_required
def get_my_orders(user):
    customer_id = user["id"]  # viene del token
    return OrdersController.get_orders_by_customer(customer_id)


# ---------------------------------------------------
# 2. Obtener detalle de un pedido
# ---------------------------------------------------
@orders_bp.get('/my/orders/<int:order_id>')
@auth_required
def get_order_detail(order_id, user):
    customer_id = user["id"]
    return OrdersController.get_order_detail(order_id, customer_id)
