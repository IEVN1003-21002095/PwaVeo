import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DashboardMetrics {
  ventas_mensuales: number;
  total_clientes: number;
  productos_activos: number;
  stock_bajo: number;
  pedidos_pendientes: number;
}

export interface RecentOrder {
  venta_id: number;
  cliente: string;
  total: number;
  estado: string;
  fecha: string;
}

export interface ChartData {
  dia: string;
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = 'http://localhost:5000/api/dashboard';

  constructor(private http: HttpClient) { }

  getSummaryMetrics(): Observable<DashboardMetrics> {
    return this.http.get<DashboardMetrics>(`${this.apiUrl}/summary`);
  }

  getRecentOrders(): Observable<RecentOrder[]> {
    return this.http.get<RecentOrder[]>(`${this.apiUrl}/recent-orders`);
  }

  getChartData(): Observable<ChartData[]> {
    return this.http.get<ChartData[]>(`${this.apiUrl}/chart-data`);
  }
}