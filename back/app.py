from flask import Flask
from flask_cors import CORS

# Importación de Blueprints
from routes.auth_routes import auth_bp

def create_app():
    """Crea y configura la app Flask."""
    app = Flask(__name__)

    # Habilitar CORS
    CORS(app)

    # Registro de Blueprints (rutas de cada módulo)
    app.register_blueprint(auth_bp, url_prefix="/api/auth")

    return app


# Punto de entrada
if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)
