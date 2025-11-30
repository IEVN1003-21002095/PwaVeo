from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv

# cargar .env
load_dotenv()

# importar blueprints
from routes.auth_routes import auth_bp
from routes.stock_routes import stock_bp       # Insumos (Materia Prima)
from routes.product_routes import product_bp   # Productos + Variantes (Inventario Producto)
from routes.catalog_routes import catalog_bp # Si tienes un catálogo público separado

def create_app():
    app = Flask(__name__)

    # habilitar CORS para que Angular pueda conectarse
    CORS(app)

    # REGISTRO DE RUTAS (BLUEPRINTS)
    
    # 1. Autenticación
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    
    # 2. Gestión de Stock (Insumos/Materia Prima)
    app.register_blueprint(stock_bp, url_prefix="/api/stock")
    
    # 3. Gestión de Productos (El que acabamos de modificar con variantes)
    # NOTA: Usamos "/api/product" para coincidir con los endpoints estándar, 
    # o "/api/productos" si prefieres español. Asegúrate que Angular use el mismo.
    app.register_blueprint(product_bp, url_prefix="/api/product") 

    # 4. Catálogo Cliente (Si existe)
    app.register_blueprint(catalog_bp, url_prefix="/api/catalogo")

    return app

if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, port=5000)