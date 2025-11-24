from database import get_connection

try:
    cn = get_connection()
    print("Conexión exitosa a TiDB Cloud!")
    cn.close()
except Exception as e:
    print("Error:", e)
