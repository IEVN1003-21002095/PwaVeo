from flask import Blueprint
from controllers.stock_controller import (
    registrar_materia_prima,
    obtener_materia_prima,
    actualizar_materia_prima,
    eliminar_materia_prima
)

stock_bp = Blueprint("stock_bp", __name__)

@stock_bp.route("/raw", methods=["POST"])
def create_raw_material():
    return registrar_materia_prima()

@stock_bp.route("/raw", methods=["GET"])
def list_raw_material():
    return obtener_materia_prima()

@stock_bp.route("/raw/<int:materia_prima_id>", methods=["PUT"])
def update_raw_material(materia_prima_id):
    return actualizar_materia_prima(materia_prima_id)

@stock_bp.route("/raw/<int:materia_prima_id>", methods=["DELETE"])
def delete_raw_material(materia_prima_id):
    return eliminar_materia_prima(materia_prima_id)
