import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { DashboardService, DashboardMetrics, RecentOrder, ChartData, ChartResponse } from './services/dashboard.service';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import './chart.config'; // Importar configuración de Chart.js

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule, HttpClientModule, BaseChartDirective],
  providers: [DashboardService],
  templateUrl: './dashboard-home.component.html'
})
export class DashboardHomeComponent implements OnInit {
  
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;
  
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

  // Estadísticas adicionales de pandas
  chartStats = {
    promedio_diario: 0,
    total_semana: 0,
    mejor_dia: { fecha: '', total: 0 }
  };

  // Configuración de Chart.js
  public lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Ventas Diarias',
        fill: true,
        tension: 0.4,
        borderColor: '#4e73df',
        backgroundColor: 'rgba(78, 115, 223, 0.1)',
        pointBackgroundColor: '#4e73df',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#4e73df',
        pointRadius: 5,
        pointHoverRadius: 7
      }
    ]
  };

  public lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top'
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(0,0,0,0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#4e73df',
        borderWidth: 1,
        callbacks: {
          label: function(context) {
            const value = context.parsed.y ?? 0;
            return ' $' + value.toFixed(2);
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '$' + value;
          }
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  getBarHeight(value: number): number {
    if (this.maxChartValue === 0) return 0;
    return (value / this.maxChartValue) * 100;
  }

  loadDashboardData(): void {
    console.log('📊 Cargando datos del dashboard...');
    
    this.dashboardService.getSummaryMetrics().subscribe({
      next: (response: any) => {
        console.log('✅ Métricas recibidas:', response);
        if (response.success && response.data) {
          this.metrics = response.data;
        } else {
          console.warn('⚠️ Respuesta de métricas sin datos válidos');
        }
      },
      error: (err) => {
        console.error('❌ Error cargando métricas:', err);
        console.error('Detalles del error:', err.error);
      }
    });

    this.dashboardService.getRecentOrders().subscribe({
      next: (response: any) => {
        console.log('✅ Órdenes recibidas:', response);
        if (response.success && response.data) {
          this.recentOrders = response.data;
        } else {
          console.warn('⚠️ Respuesta de órdenes sin datos válidos');
        }
      },
      error: (err) => {
        console.error('❌ Error cargando órdenes:', err);
        console.error('Detalles del error:', err.error);
      }
    });

    this.dashboardService.getChartData().subscribe({
      next: (response: ChartResponse) => {
        console.log('✅ Datos de gráfico recibidos:', response);
        if (response.success && response.data) {
          this.chartData = response.data;
          
          // Actualizar estadísticas de pandas
          if (response.stats) {
            this.chartStats = response.stats;
            console.log('📈 Estadísticas de pandas:', this.chartStats);
          }
          
          // Actualizar datos del gráfico
          const labels = response.data.map(item => {
            const date = new Date(item.dia);
            return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
          });
          const values = response.data.map(item => item.total);
          
          console.log('🏷️ Labels:', labels);
          console.log('💰 Values:', values);
          
          this.lineChartData.labels = labels;
          this.lineChartData.datasets[0].data = values;
          
          if (values.length > 0) {
            this.maxChartValue = Math.max(...values);
          }
          
          // Actualizar el gráfico
          this.chart?.update();
          console.log('✅ Gráfico actualizado');
        } else {
          console.warn('⚠️ Respuesta de gráfico sin datos válidos');
        }
      },
      error: (err) => {
        console.error('❌ Error cargando gráfica:', err);
        console.error('Detalles del error:', err.error);
      }
    });
  }
}