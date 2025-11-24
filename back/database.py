import pymysql
from pymysql.cursors import DictCursor
from config import Config

def get_connection():
    try:
        connection = pymysql.connect(
            host=Config.DB_HOST,
            port=Config.DB_PORT,
            user=Config.DB_USER,
            password=Config.DB_PASSWORD,
            database=Config.DB_NAME,
            cursorclass=DictCursor,
            ssl={"ca": Config.DB_SSL_CA}
        )
        return connection

    except Exception as e:
        print("❌ Error conectando a TiDB Cloud:", e)
        raise ConnectionError(f"Error al conectar a TiDB Cloud: {e}")


def get_all_clientes():
    """Retorna toda la tabla clientes."""
    connection = get_connection()
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM clientes;")
            return cursor.fetchall()
    finally:
        connection.close()
