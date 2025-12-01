from flask import Blueprint, request, jsonify
from controllers.checkout_controller import (
    registrar_direccion,
    seleccionar_metodo_pago,
    generar_resumen,
    finalizar_compra
)

checkout_bp = Blueprint("checkout_bp", __name__, url_prefix="/api/checkout")


# -----------------------------------
# 1. REGISTRAR DIRECCIÓN
# -----------------------------------
@checkout_bp.post("/direccion")
def registrar_direccion_route():
    data = request.get_json()
    resultado = registrar_direccion(data)

    if isinstance(resultado, tuple):
        return jsonify(resultado[0]), resultado[1]

    return jsonify(resultado), (200 if resultado.get("exito") else 400)


# -----------------------------------
# 2. SELECCIONAR MÉTODO DE PAGO
# -----------------------------------
@checkout_bp.post("/pago")
def seleccionar_pago_route():
    data = request.get_json()
    resultado = seleccionar_metodo_pago(data)

    if isinstance(resultado, tuple):
        return jsonify(resultado[0]), resultado[1]

    return jsonify(resultado), (200 if resultado.get("exito") else 400)


# -----------------------------------
# 3. GENERAR RESUMEN
# -----------------------------------
@checkout_bp.post("/resumen")
def generar_resumen_route():
    data = request.get_json()
    resultado = generar_resumen(data)

    if isinstance(resultado, tuple):
        return jsonify(resultado[0]), resultado[1]

    return jsonify(resultado), (200 if resultado.get("exito") else 400)


# -----------------------------------
# 4. FINALIZAR COMPRA
# -----------------------------------
@checkout_bp.post("/finalizar")
def finalizar_compra_route():
    data = request.get_json()
    resultado = finalizar_compra(data)

    if isinstance(resultado, tuple):
        return jsonify(resultado[0]), resultado[1]

    return jsonify(resultado), (200 if resultado.get("exito") else 400)


# -----------------------------------
# Alias opcional: /metodo-pago
# -----------------------------------
@checkout_bp.post("/metodo-pago")
def seleccionar_metodo_pago_alias():
    data = request.get_json()
    resultado = seleccionar_metodo_pago(data)

    if isinstance(resultado, tuple):
        return jsonify(resultado[0]), resultado[1]

    return jsonify(resultado), (200 if resultado.get("exito") else 400)


# -----------------------------------
# Alias opcional: /confirmar
# -----------------------------------
@checkout_bp.post("/confirmar")
def confirmar_compra_route():
    data = request.get_json()
    resultado = finalizar_compra(data)

    if isinstance(resultado, tuple):
        return jsonify(resultado[0]), resultado[1]

    return jsonify(resultado), (200 if resultado.get("exito") else 400)
