from database import get_connection
import pymysql

class DashboardController:
    
    @staticmethod
    def get_summary_metrics():
        """
        Obtiene los KPI principales para las tarjetas del Dashboard.
        """
        # Inicializamos connection en None para evitar errores en el finally
        connection = None 
        metrics = {}
        
        try:
            connection = get_connection()
            with connection.cursor() as cursor:
                # 1. Total Ventas del Último Mes
                query_sales = """
                    SELECT COALESCE(SUM(total), 0) as total_ventas_mes
                    FROM ventas 
                    WHERE estado = 'completada' 
                    AND fecha >= DATE_SUB(NOW(), INTERVAL 1 MONTH);
                """
                cursor.execute(query_sales)
                result_sales = cursor.fetchone()
                metrics['ventas_mensuales'] = float(result_sales['total_ventas_mes']) if result_sales else 0.0

                # 2. Número de Clientes
                query_customers = """
                    SELECT COUNT(*) as total_clientes 
                    FROM usuarios 
                    WHERE rol = 'cliente';
                """
                cursor.execute(query_customers)
                result_customers = cursor.fetchone()
                metrics['total_clientes'] = result_customers['total_clientes'] if result_customers else 0

                # 3. Productos Activos (Valida si existe la columna activo)
                query_products = """
                    SELECT COUNT(*) as productos_activos 
                    FROM productos 
                    WHERE activo = 1;
                """
                cursor.execute(query_products)
                result_products = cursor.fetchone()
                metrics['productos_activos'] = result_products['productos_activos'] if result_products else 0

                # 4. Stock Bajo (< 10 unidades)
                query_low_stock = """
                    SELECT COUNT(*) as stock_bajo 
                    FROM inventario 
                    WHERE cantidad < 10;
                """
                cursor.execute(query_low_stock)
                result_stock = cursor.fetchone()
                metrics['stock_bajo'] = result_stock['stock_bajo'] if result_stock else 0

                # 5. Pedidos Pendientes
                query_pending = """
                    SELECT COUNT(*) as pedidos_pendientes 
                    FROM ventas 
                    WHERE estado = 'pendiente';
                """
                cursor.execute(query_pending)
                result_pending = cursor.fetchone()
                metrics['pedidos_pendientes'] = result_pending['pedidos_pendientes'] if result_pending else 0

            return {"success": True, "data": metrics}

        except Exception as e:
            print(f"❌ Error en DashboardController.get_summary_metrics: {e}")
            return {"success": False, "error": str(e)}
        finally:
            # Validación segura: Solo cerramos si la conexión existe y está abierta
            if connection and hasattr(connection, 'open') and connection.open:
                connection.close()

    @staticmethod
    def get_recent_orders():
        """
        Obtiene las últimas 5 órdenes.
        """
        connection = None
        try:
            connection = get_connection()
            with connection.cursor() as cursor:
                query = """
                    SELECT 
                        v.id as venta_id,
                        CONCAT(u.nombre, ' ', u.apellido) as cliente,
                        v.total,
                        v.estado,
                        v.fecha
                    FROM ventas v
                    JOIN usuarios u ON v.usuario_id = u.id
                    ORDER BY v.fecha DESC
                    LIMIT 5;
                """
                cursor.execute(query)
                orders = cursor.fetchall()
                
                # Serialización para JSON
                for order in orders:
                    if 'total' in order:
                        order['total'] = float(order['total'])
            
            return {"success": True, "data": orders}
        except Exception as e:
            print(f"❌ Error en DashboardController.get_recent_orders: {e}")
            return {"success": False, "error": str(e)}
        finally:
            if connection and hasattr(connection, 'open') and connection.open:
                connection.close()
            
    @staticmethod
    def get_sales_chart_data():
        """
        Datos para graficar ventas por día.
        """
        connection = None
        try:
            connection = get_connection()
            with connection.cursor() as cursor:
                query = """
                    SELECT DATE(fecha) as dia, SUM(total) as total
                    FROM ventas
                    WHERE estado = 'completada'
                    GROUP BY DATE(fecha)
                    ORDER BY dia DESC
                    LIMIT 7;
                """
                cursor.execute(query)
                data = cursor.fetchall()
                
                formatted_data = []
                for item in data:
                    formatted_data.append({
                        "dia": str(item['dia']),
                        "total": float(item['total'])
                    })

            return {"success": True, "data": formatted_data}
        except Exception as e:
            print(f"❌ Error en DashboardController.get_sales_chart_data: {e}")
            return {"success": False, "error": str(e)}
        finally:
            if connection and hasattr(connection, 'open') and connection.open:
                connection.close()