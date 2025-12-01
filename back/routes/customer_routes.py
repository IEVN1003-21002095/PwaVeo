from flask import Blueprint, request, jsonify
from controllers.customer_controller import CustomerController
from flask_jwt_extended import jwt_required

customer_bp = Blueprint("customer_bp", __name__, url_prefix="/api/customers")
controller = CustomerController()

@customer_bp.route("/", methods=["GET"])
@jwt_required()
def list_customers():
    page = int(request.args.get("page", 1))
    per_page = int(request.args.get("per_page", 10))
    search = request.args.get("search", None)
    response = controller.list_clients(page=page, per_page=per_page, search=search)
    return jsonify(response)

@customer_bp.route("/<int:client_id>", methods=["GET"])
@jwt_required()
def client_detail(client_id):
    response = controller.get_client_detail(client_id)
    return jsonify(response)

@customer_bp.route("/<int:client_id>", methods=["PUT"])
@jwt_required()
def update_client(client_id):
    data = request.get_json(silent=True) or {}
    response = controller.update_client_contact(client_id, data)
    return jsonify(response)

@customer_bp.route("/<int:client_id>", methods=["DELETE"])
@jwt_required()
def delete_customer(client_id):
    response = controller.delete_client(client_id)
    return jsonify(response)

@customer_bp.route("/<int:client_id>/orders", methods=["GET"])
@jwt_required()
def get_orders(client_id):
    response = controller.get_client_orders(client_id)
    return jsonify(response)