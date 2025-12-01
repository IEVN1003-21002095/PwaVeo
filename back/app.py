from flask import Flask
from flask_cors import CORS  # ✅ Importa CORS
from flask_jwt_extended import JWTManager
from config import Config

from routes.auth_routes import auth_bp
from routes.customer_routes import customer_bp
from routes.product_routes import product_bp
from routes.cart_routes import cart_bp
from routes.checkout_routes import checkout_bp
from routes.orders_routes import orders_bp
from routes.review_routes import review_bp
from routes.sales_routes import sales_bp
from routes.stock_routes import stock_bp
from routes.catalog_routes import catalog_bp
from routes.dashboard_routes import dashboard_bp 

app = Flask(__name__)

# Configuración de la aplicación
app.config.from_object(Config)

# Configurar CORS con opciones más explícitas
CORS(app, resources={
    r"/*": {
        "origins": "*",
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }
})

# Inicializar JWT Manager
jwt = JWTManager(app)

# Registrar Blueprints
app.register_blueprint(auth_bp)
app.register_blueprint(customer_bp)
app.register_blueprint(product_bp)
# Cart
app.register_blueprint(cart_bp)
# Checkout
app.register_blueprint(checkout_bp)
app.register_blueprint(catalog_bp)
app.register_blueprint(orders_bp)
app.register_blueprint(review_bp)
app.register_blueprint(sales_bp)
app.register_blueprint(stock_bp)
app.register_blueprint(dashboard_bp)

if __name__ == "__main__":
    app.run(debug=True)
