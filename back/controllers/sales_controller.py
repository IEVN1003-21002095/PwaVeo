from database import get_db_connection

class SalesController:

    def get_dashboard_stats(self):
        conn = get_db_connection()
        try:
            cursor = conn.cursor(dictionary=True)
            stats = {}

            # 1. Ingresos del Día (Sumar total de ventas de hoy que no estén canceladas)
            cursor.execute("""
                SELECT SUM(total) as total 
                FROM ventas 
                WHERE DATE(fecha) = CURDATE() AND estado != 'cancelada'
            """)
            row = cursor.fetchone()
            stats['ingresosDelDia'] = float(row['total']) if row and row['total'] else 0.0

            # 2. Pedidos por Producir (Estado 'pendiente')
            cursor.execute("SELECT COUNT(*) as total FROM ventas WHERE estado = 'pendiente'")
            stats['pedidosPorProducir'] = cursor.fetchone()['total']

            # 3. Nuevos Registros (Total Clientes)
            cursor.execute("SELECT COUNT(*) as total FROM clientes")
            stats['nuevosRegistros'] = cursor.fetchone()['total']
            
            # 4. Top 5 Productos Vendidos
            cursor.execute("""
                SELECT p.nombre, p.id as sku, SUM(vd.cantidad) as unidades
                FROM venta_detalle vd
                JOIN inventario i ON vd.inventario_id = i.id
                JOIN productos p ON i.producto_id = p.id
                JOIN ventas v ON vd.venta_id = v.id
                WHERE v.estado != 'cancelada'
                GROUP BY p.id
                ORDER BY unidades DESC
                LIMIT 5
            """)
            stats['topProductos'] = cursor.fetchall()

            # 5. Datos para Gráfica (Últimos 30 días)
            cursor.execute("""
                SELECT DATE_FORMAT(fecha, '%Y-%m-%d') as fecha, SUM(total) as total
                FROM ventas
                WHERE fecha >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) AND estado != 'cancelada'
                GROUP BY DATE_FORMAT(fecha, '%Y-%m-%d')
                ORDER BY fecha ASC
            """)
            stats['ventasGrafico'] = cursor.fetchall()

            return {'success': True, 'data': stats}
        except Exception as e:
            return {'success': False, 'error': str(e)}
        finally:
            if conn.is_connected(): conn.close()