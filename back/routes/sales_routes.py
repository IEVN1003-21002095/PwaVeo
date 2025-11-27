from flask import Blueprint
from controllers.sales_controller import obtener_listado_ventas

sales_bp = Blueprint("sales_bp", __name__)

@sales_bp.route("/", methods=["GET"])
def list_all_sales():
    return obtener_listado_ventas()
