"""
Script de prueba para verificar el dashboard controller con pandas
"""
from controllers.dashboard_controller import DashboardController
import json

print("=" * 60)
print("PRUEBA DEL DASHBOARD CONTROLLER")
print("=" * 60)

print("\n1️⃣ Probando get_summary_metrics()...")
try:
    result = DashboardController.get_summary_metrics()
    print(f"✅ Success: {result['success']}")
    if result['success']:
        print(f"📊 Datos: {json.dumps(result['data'], indent=2)}")
    else:
        print(f"❌ Error: {result.get('error', 'Unknown')}")
except Exception as e:
    print(f"❌ Excepción: {e}")

print("\n2️⃣ Probando get_recent_orders()...")
try:
    result = DashboardController.get_recent_orders()
    print(f"✅ Success: {result['success']}")
    if result['success']:
        print(f"📦 Órdenes: {len(result['data'])} órdenes encontradas")
        if result['data']:
            print(f"Primera orden: {result['data'][0]}")
    else:
        print(f"❌ Error: {result.get('error', 'Unknown')}")
except Exception as e:
    print(f"❌ Excepción: {e}")

print("\n3️⃣ Probando get_sales_chart_data() con PANDAS...")
try:
    result = DashboardController.get_sales_chart_data()
    print(f"✅ Success: {result['success']}")
    if result['success']:
        print(f"📈 Datos del gráfico: {len(result['data'])} días")
        print(f"📊 Estadísticas:")
        if 'stats' in result:
            stats = result['stats']
            print(f"   - Total semana: ${stats.get('total_semana', 0):.2f}")
            print(f"   - Promedio diario: ${stats.get('promedio_diario', 0):.2f}")
            print(f"   - Mejor día: {stats.get('mejor_dia', {})}")
        print(f"\n📅 Primeros 3 días:")
        for item in result['data'][:3]:
            print(f"   {item['dia']}: ${item['total']:.2f}")
    else:
        print(f"❌ Error: {result.get('error', 'Unknown')}")
except Exception as e:
    print(f"❌ Excepción: {e}")
    import traceback
    traceback.print_exc()

print("\n" + "=" * 60)
print("FIN DE LA PRUEBA")
print("=" * 60)
