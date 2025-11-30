from flask import jsonify
from database import get_connection
import math

class CustomerController:

    def list_clients(self, page=1, per_page=10, search=None):
        """
        Obtiene un listado paginado de clientes, con opción de búsqueda por nombre o correo.
        """
        offset = (page - 1) * per_page
        try:
            conn = get_connection()
            cursor = conn.cursor()

            # Consulta base
            base_query = """
                SELECT u.id, u.nombre, u.apellido, u.correo, c.fecha_registro
                FROM usuarios u
                LEFT JOIN clientes c ON u.id = c.usuario_id
                WHERE u.rol = 'Cliente'
            """

            # Filtrado por búsqueda
            params = ()
            if search:
                base_query += " AND (u.nombre LIKE %s OR u.apellido LIKE %s OR u.correo LIKE %s)"
                search_param = f"%{search}%"
                params = (search_param, search_param, search_param)

            # Conteo total
            count_query = f"SELECT COUNT(*) FROM ({base_query}) AS total"
            cursor.execute(count_query, params)
            total = cursor.fetchone()[0]

            # Paginación
            base_query += " ORDER BY u.nombre ASC LIMIT %s OFFSET %s"
            params += (per_page, offset)
            cursor.execute(base_query, params)
            clientes = cursor.fetchall()

            # Formatear resultado
            result = []
            for cliente in clientes:
                result.append({
                    "id": cliente[0],
                    "nombre_completo": f"{cliente[1]} {cliente[2]}",
                    "correo": cliente[3],
                    "fecha_registro": cliente[4].strftime("%Y-%m-%d %H:%M:%S") if cliente[4] else None
                })

            return {
                "success": True,
                "page": page,
                "per_page": per_page,
                "total_clients": total,
                "total_pages": math.ceil(total / per_page),
                "clientes": result
            }

        except Exception as e:
            return {"success": False, "message": str(e)}
        finally:
            cursor.close()
            conn.close()

    def get_client_detail(self, client_id):
        """
        Obtiene detalles de un cliente específico.
        """
        try:
            conn = get_connection()
            cursor = conn.cursor()
            query = """
                SELECT u.id, u.nombre, u.apellido, u.correo, c.direccion, c.telefono, c.fecha_registro
                FROM usuarios u
                LEFT JOIN clientes c ON u.id = c.usuario_id
                WHERE u.id = %s
            """
            cursor.execute(query, (client_id,))
            cliente = cursor.fetchone()
            if not cliente:
                return {"success": False, "message": "Cliente no encontrado"}

            return {
                "success": True,
                "cliente": {
                    "id": cliente[0],
                    "nombre_completo": f"{cliente[1]} {cliente[2]}",
                    "correo": cliente[3],
                    "direccion": cliente[4],
                    "telefono": cliente[5],
                    "fecha_registro": cliente[6].strftime("%Y-%m-%d %H:%M:%S") if cliente[6] else None
                }
            }

        except Exception as e:
            return {"success": False, "message": str(e)}
        finally:
            cursor.close()
            conn.close()
