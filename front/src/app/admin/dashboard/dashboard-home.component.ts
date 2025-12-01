import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { DashboardService, DashboardMetrics, RecentOrder, ChartData } from './services/dashboard.service';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  providers: [DashboardService],
  templateUrl: './dashboard-home.component.html'
})
export class DashboardHomeComponent implements OnInit {
  
  metrics: DashboardMetrics = {
    ventas_mensuales: 0,
    total_clientes: 0,
    productos_activos: 0,
    stock_bajo: 0,
    pedidos_pendientes: 0
  };

  recentOrders: RecentOrder[] = [];
  chartData: ChartData[] = [];
  maxChartValue: number = 0;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  getBarHeight(value: number): number {
    if (this.maxChartValue === 0) return 0;
    return (value / this.maxChartValue) * 100;
  }

  loadDashboardData(): void {
    this.dashboardService.getSummaryMetrics().subscribe({
      next: (metrics: DashboardMetrics) => {
         this.metrics = metrics;
      },
      error: (err) => console.error('Error cargando métricas', err)
    });

    this.dashboardService.getRecentOrders().subscribe({
      next: (orders: RecentOrder[]) => {
        this.recentOrders = orders;
      },
      error: (err) => console.error('Error cargando órdenes', err)
    });

    this.dashboardService.getChartData().subscribe({
      next: (data: ChartData[]) => {
        this.chartData = data;
        if (data && data.length > 0) {
          this.maxChartValue = Math.max(...data.map(d => d.total));
        }
      },
      error: (err) => console.error('Error cargando gráfica', err)
    });
  }
}