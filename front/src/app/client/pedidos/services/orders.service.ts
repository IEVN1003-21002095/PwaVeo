import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

// Interfaces para tipado
export interface OrderItem {
  nombre_producto_venta: string;
  cantidad: number;
  precio_unitario_venta: number;
}

export interface ShippingAddress {
  nombre_destinatario: string;
  calle: string;
  codigo_postal: string;
  ciudad: string;
  estado: string;
}

export interface Order {
  pedido_id: number;
  fecha_pedido: string;
  total: number;
  estado_display: string;
}

export interface OrderDetail {
  message: string;
  pedido: {
    id: number;
    fecha: string;
    total: number;
    estado_display: string;
    numero_guia: string;
  };
  items: OrderItem[];
  direccion_entrega: ShippingAddress | null;
}

export interface OrdersHistoryResponse {
  message: string;
  total_pedidos: number;
  pedidos: Order[];
}

@Injectable({
  providedIn: 'root'
})
export class OrdersService {
  private apiUrl = 'http://localhost:5000/api/client';

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();
    if (token && token !== '' && token !== 'null') {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  getOrdersHistory(): Observable<OrdersHistoryResponse> {
    return this.http.get<OrdersHistoryResponse>(`${this.apiUrl}/orders`, { 
      headers: this.getHeaders() 
    });
  }

  getOrderDetails(orderId: number): Observable<OrderDetail> {
    return this.http.get<OrderDetail>(`${this.apiUrl}/orders/${orderId}`, { 
      headers: this.getHeaders() 
    });
  }

  updateProfile(data: { telefono: string; direccion?: string }): Observable<any> {
    return this.http.put(`${this.apiUrl}/profile`, data, { 
      headers: this.getHeaders() 
    });
  }
}
