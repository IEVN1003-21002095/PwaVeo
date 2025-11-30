import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { DashboardService, DashboardMetrics, RecentOrder, ChartData } from './service/dashboard.service';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule, HttpClientModule], // Importante para usar Pipes y Http
  providers: [DashboardService],
  templateUrl: './dashboard-home.component.html',
  // styleUrl se omite porque pediste los estilos en el HTML
})
export class DashboardHomeComponent implements OnInit {
  
  // Inicialización de datos por defecto para evitar errores de renderizado
  metrics: DashboardMetrics = {
    ventas_mensuales: 0,
    total_clientes: 0,
    productos_activos: 0,
    stock_bajo: 0,
    pedidos_pendientes: 0
  };

  recentOrders: RecentOrder[] = [];
  chartData: ChartData[] = [];

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    // 1. Cargar Métricas
    this.dashboardService.getSummaryMetrics().subscribe({
      next: (resp: any) => {
         // El backend devuelve { success: true, data: ... } o directo la data dependiendo de tu interceptor
         // Asumiendo estructura: { data: metrics } basado en tu dashboard_routes.py
         this.metrics = resp; 
      },
      error: (err) => console.error('Error cargando métricas', err)
    });

    // 2. Cargar Órdenes Recientes
    this.dashboardService.getRecentOrders().subscribe({
      next: (resp: any) => {
        this.recentOrders = resp;
      },
      error: (err) => console.error('Error cargando órdenes', err)
    });

    // 3. Cargar Datos Gráfica
    this.dashboardService.getChartData().subscribe({
      next: (resp: any) => {
        this.chartData = resp;
      },
      error: (err) => console.error('Error cargando gráfica', err)
    });
  }
}