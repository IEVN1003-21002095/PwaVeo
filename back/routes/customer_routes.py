from flask import Blueprint, request, jsonify
from controllers.customer_controller import CustomerController

customer_bp = Blueprint("customer_bp", __name__, url_prefix="/api/customers")
controller = CustomerController()

# Listado de clientes con paginación y búsqueda
@customer_bp.route("/", methods=["GET"])
def list_customers():
    page = int(request.args.get("page", 1))
    per_page = int(request.args.get("per_page", 10))
    search = request.args.get("search", None)
    
    response = controller.list_clients(page=page, per_page=per_page, search=search)
    return jsonify(response)

# Detalle de cliente
@customer_bp.route("/<int:client_id>", methods=["GET"])
def client_detail(client_id):
    response = controller.get_client_detail(client_id)
    return jsonify(response)
