from flask import Flask
from flask_cors import CORS  # Requiere: pip install flask-cors

# Importación de Blueprints activos
from routes.review_routes import review_bp

# Importación de Blueprints pendientes (comentados para uso futuro)
# from routes.auth_routes import auth_bp
# from routes.customer_routes import customer_bp
# from routes.product_routes import product_bp
# from routes.checkout_routes import checkout_bp
# from routes.orders_routes import orders_bp
# from routes.sales_routes import sales_bp
# from routes.stock_routes import stock_bp

app = Flask(__name__)

# ---------------------------------------------------------------
# CONFIGURACIÓN DE CORS
# Permite que Angular (localhost:4200) haga peticiones a Flask
# ---------------------------------------------------------------
CORS(app, resources={r"/*": {"origins": "http://localhost:4200"}})

# ---------------------------------------------------------------
# REGISTRO DE BLUEPRINTS
# ---------------------------------------------------------------

# Rutas activas
app.register_blueprint(review_bp)

# Rutas pendientes
# app.register_blueprint(auth_bp)
# app.register_blueprint(customer_bp)
# app.register_blueprint(product_bp)
# app.register_blueprint(checkout_bp)
# app.register_blueprint(orders_bp)
# app.register_blueprint(sales_bp)
# app.register_blueprint(stock_bp)

if __name__ == "__main__":
    # Se corre en el puerto 5000 para coincidir con la configuración habitual
    app.run(debug=True, port=5000)