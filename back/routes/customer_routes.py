from flask import Blueprint, request, jsonify
from controllers.customer_controller import CustomerController
from flask_jwt_extended import jwt_required, get_jwt_identity
from functools import wraps

customer_bp = Blueprint("customer_bp", __name__, url_prefix="/api/customers")
controller = CustomerController()

# Decorador opcional de JWT para debugging
def jwt_optional(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        try:
            # Intenta validar el JWT si existe
            jwt_required()(lambda: None)()
        except Exception as e:
            # Si falla, continúa sin autenticación (solo para debugging)
            print(f"JWT no válido o ausente: {e}")
            pass
        return fn(*args, **kwargs)
    return wrapper

@customer_bp.route("/", methods=["GET"])
# @jwt_required()  # Comentado temporalmente para debugging
def list_customers():
    page = int(request.args.get("page", 1))
    per_page = int(request.args.get("per_page", 10))
    search = request.args.get("search", None)
    response = controller.list_clients(page=page, per_page=per_page, search=search)
    return jsonify(response)

@customer_bp.route("/<int:client_id>", methods=["GET"])
# @jwt_required()  # Comentado temporalmente para debugging
def client_detail(client_id):
    response = controller.get_client_detail(client_id)
    return jsonify(response)

@customer_bp.route("/<int:client_id>", methods=["PUT"])
# @jwt_required()  # Comentado temporalmente para debugging
def update_client(client_id):
    data = request.get_json(silent=True) or {}
    response = controller.update_client_contact(client_id, data)
    return jsonify(response)

@customer_bp.route("/<int:client_id>", methods=["DELETE"])
# @jwt_required()  # Comentado temporalmente para debugging
def delete_customer(client_id):
    response = controller.delete_client(client_id)
    return jsonify(response)

@customer_bp.route("/<int:client_id>/orders", methods=["GET"])
# @jwt_required()  # Comentado temporalmente para debugging
def get_orders(client_id):
    response = controller.get_client_orders(client_id)
    return jsonify(response)