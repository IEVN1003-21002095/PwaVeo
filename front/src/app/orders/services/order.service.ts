// src/app/orders/services/order.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrderService { 
  private apiUrl = 'http://localhost:5000/api/client'; // URL base de Flask

  constructor(private http: HttpClient) { }

  getOrdersHistory(): Observable<any> {
    return this.http.get(`${this.apiUrl}/orders`);
  }

  getOrderDetails(orderId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/orders/${orderId}`);
  }

  updateUserProfile(data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/profile`, data);
  }
}