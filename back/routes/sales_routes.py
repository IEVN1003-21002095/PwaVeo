from flask import Blueprint
from controllers.sales_controller import (
    get_ventas_con_detalles_controller,
    get_venta_por_id_controller,
    get_detalles_por_venta_controller,
    update_venta_controller,
    update_detalle_controller
)

sales_bp = Blueprint("sales", __name__, url_prefix="/api/sales")

# ------------------------------------------------------------
# LISTAR TODAS LAS VENTAS CON DETALLES
# ------------------------------------------------------------
sales_bp.route("/ventas", methods=["GET"])(get_ventas_con_detalles_controller)

# ------------------------------------------------------------
# OBTENER UNA VENTA POR ID
# ------------------------------------------------------------
sales_bp.route("/venta/<int:venta_id>", methods=["GET"])(get_venta_por_id_controller)

# ------------------------------------------------------------
# OBTENER LOS DETALLES DE UNA VENTA
# ------------------------------------------------------------
sales_bp.route("/venta/<int:venta_id>/detalles", methods=["GET"])(get_detalles_por_venta_controller)

# ------------------------------------------------------------
# ACTUALIZAR UNA VENTA
# ------------------------------------------------------------
sales_bp.route("/venta/<int:venta_id>", methods=["PUT"])(update_venta_controller)

# ------------------------------------------------------------
# ACTUALIZAR UN DETALLE DE VENTA
# ------------------------------------------------------------
sales_bp.route("/detalle/<int:detalle_id>", methods=["PUT"])(update_detalle_controller)
