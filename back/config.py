import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Configuración para la app Flask y TiDB Cloud."""

    SECRET_KEY = os.environ.get("SECRET_KEY", "default_secret_key")

    # Parámetros de conexión a TiDB Cloud
    DB_HOST = os.environ.get("DB_HOST")
    DB_PORT = int(os.environ.get("DB_PORT"))
    DB_USER = os.environ.get("DB_USER")
    DB_PASSWORD = os.environ.get("DB_PASSWORD")
    DB_NAME = os.environ.get("DB_NAME")

    # Ruta al certificado CA (obligatorio con TiDB)
    DB_SSL_CA = os.environ.get("DB_SSL_CA", "certs/ca.pem")

    DEBUG = True
