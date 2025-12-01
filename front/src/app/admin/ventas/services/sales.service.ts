import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SalesService {

  private baseUrl = 'http://localhost:5000/api/sales';

  constructor(private http: HttpClient) {}

  // 1️⃣ Listar todas las ventas con detalles
  getVentasConDetalles(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/ventas`);
  }

  // 2️⃣ Obtener una venta por ID
  getVentaPorId(ventaId: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/venta/${ventaId}`);
  }

  // 3️⃣ Obtener detalles de una venta
  getDetallesPorVenta(ventaId: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/venta/${ventaId}/detalles`);
  }

  // 4️⃣ Actualizar una venta
  updateVenta(ventaId: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/venta/${ventaId}`, data);
  }

  // 5️⃣ Actualizar un detalle de venta
  updateDetalle(detalleId: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/detalle/${detalleId}`, data);
  }
}
