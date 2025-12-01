from database import get_connection
import pymysql
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

class DashboardController:
    
    @staticmethod
    def get_summary_metrics():
        connection = None 
        metrics = {}
        
        try:
            connection = get_connection()
            with connection.cursor() as cursor:
                query_sales = """
                    SELECT COALESCE(SUM(total), 0) as total_ventas_mes
                    FROM ventas 
                    WHERE estado = 'completada' 
                    AND fecha >= DATE_SUB(NOW(), INTERVAL 1 MONTH);
                """
                cursor.execute(query_sales)
                result_sales = cursor.fetchone()
                metrics['ventas_mensuales'] = float(result_sales['total_ventas_mes']) if result_sales else 0.0

                query_customers = """
                    SELECT COUNT(*) as total_clientes 
                    FROM usuarios 
                    WHERE rol = 'cliente';
                """
                cursor.execute(query_customers)
                result_customers = cursor.fetchone()
                metrics['total_clientes'] = result_customers['total_clientes'] if result_customers else 0

                query_products = """
                    SELECT COUNT(*) as productos_activos 
                    FROM productos 
                    WHERE activo = 1;
                """
                cursor.execute(query_products)
                result_products = cursor.fetchone()
                metrics['productos_activos'] = result_products['productos_activos'] if result_products else 0

                query_low_stock = """
                    SELECT COUNT(*) as stock_bajo 
                    FROM inventario 
                    WHERE cantidad < 10;
                """
                cursor.execute(query_low_stock)
                result_stock = cursor.fetchone()
                metrics['stock_bajo'] = result_stock['stock_bajo'] if result_stock else 0

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
            print(f"Error en DashboardController.get_summary_metrics: {e}")
            return {"success": False, "error": str(e)}
        finally:
            if connection and hasattr(connection, 'open') and connection.open:
                connection.close()

    @staticmethod
    def get_recent_orders():
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
                
                for order in orders:
                    if 'total' in order:
                        order['total'] = float(order['total'])
            
            return {"success": True, "data": orders}
        except Exception as e:
            print(f"Error en DashboardController.get_recent_orders: {e}")
            return {"success": False, "error": str(e)}
        finally:
            if connection and hasattr(connection, 'open') and connection.open:
                connection.close()
            
    @staticmethod
    def get_sales_chart_data():
        """
        Obtiene datos de ventas de los últimos 7 días usando Pandas para análisis
        """
        connection = None
        try:
            connection = get_connection()
            with connection.cursor() as cursor:
                query = """
                    SELECT DATE(fecha) as dia, SUM(total) as total
                    FROM ventas
                    WHERE estado IN ('completada', 'pendiente')
                      AND fecha >= DATE_SUB(NOW(), INTERVAL 7 DAY)
                    GROUP BY DATE(fecha)
                    ORDER BY dia ASC;
                """
                cursor.execute(query)
                data = cursor.fetchall()
                
                # Convertir a DataFrame de pandas
                if data:
                    df = pd.DataFrame(data)
                    df['dia'] = pd.to_datetime(df['dia'])
                    df['total'] = df['total'].astype(float)
                    
                    # Crear rango completo de fechas (últimos 7 días)
                    end_date = datetime.now().date()
                    start_date = end_date - timedelta(days=6)
                    date_range = pd.date_range(start=start_date, end=end_date, freq='D')
                    
                    # Reindexar para incluir días sin ventas (con 0)
                    df = df.set_index('dia').reindex(date_range, fill_value=0).reset_index()
                    df.columns = ['dia', 'total']
                    
                    # Calcular estadísticas adicionales
                    promedio = float(df['total'].mean())
                    total_semana = float(df['total'].sum())
                    dia_max = df.loc[df['total'].idxmax()]
                    
                    formatted_data = []
                    for _, row in df.iterrows():
                        formatted_data.append({
                            "dia": row['dia'].strftime('%Y-%m-%d'),
                            "total": float(row['total'])
                        })
                    
                    return {
                        "success": True, 
                        "data": formatted_data,
                        "stats": {
                            "promedio_diario": round(promedio, 2),
                            "total_semana": round(total_semana, 2),
                            "mejor_dia": {
                                "fecha": dia_max['dia'].strftime('%Y-%m-%d'),
                                "total": float(dia_max['total'])
                            }
                        }
                    }
                else:
                    # Si no hay datos, devolver 7 días con 0
                    end_date = datetime.now().date()
                    start_date = end_date - timedelta(days=6)
                    date_range = pd.date_range(start=start_date, end=end_date, freq='D')
                    
                    formatted_data = []
                    for date in date_range:
                        formatted_data.append({
                            "dia": date.strftime('%Y-%m-%d'),
                            "total": 0.0
                        })
                    
                    return {
                        "success": True, 
                        "data": formatted_data,
                        "stats": {
                            "promedio_diario": 0.0,
                            "total_semana": 0.0,
                            "mejor_dia": {"fecha": None, "total": 0.0}
                        }
                    }

        except Exception as e:
            print(f"Error en DashboardController.get_sales_chart_data: {e}")
            import traceback
            traceback.print_exc()
            return {"success": False, "error": str(e)}
        finally:
            if connection and hasattr(connection, 'open') and connection.open:
                connection.close()