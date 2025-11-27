from flask import Blueprint
from controllers.orders_controller import (
    obtener_pedidos_por_usuario,
    obtener_detalle_pedido
)

orders_bp = Blueprint('orders_bp', __name__)

# 📌 Todos los pedidos del usuario
@orders_bp.get('/pedidos/<int:usuario_id>')
def listar_pedidos(usuario_id):
    return obtener_pedidos_por_usuario(usuario_id)


# 📌 Detalle de un pedido
@orders_bp.get('/pedidos/<int:usuario_id>/<int:pedido_id>')
def detalle_pedido(usuario_id, pedido_id):
    return obtener_detalle_pedido(usuario_id, pedido_id)
