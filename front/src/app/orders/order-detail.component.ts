// src/app/orders/order-detail.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // <-- Necesario para *ngIf, *ngFor
import { OrderService } from './services/order.service'; 

@Component({
  selector: 'app-order-detail',
  templateUrl: './order-detail.component.html',
  // 🔑 CRÍTICO: Debe ser standalone para usar su propio CommonModule
  standalone: true, 
  imports: [
      CommonModule
  ],
})
export class OrderDetailComponent implements OnInit {
  orders: any[] = [];
  isLoading = true;
  error: string | null = null;
  expandedOrderId: number | null = null; 

  // Inyección de la dependencia OrderService
  constructor(private orderService: OrderService) { }

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading = true;
    this.error = null;
    this.orderService.getOrdersHistory().subscribe({ 
      next: (response) => {
        this.orders = response.pedidos.map((order: any) => ({
          ...order,
          details: null, 
          isLoadingDetails: false,
          errorDetails: null,
          isExpanded: false 
        }));
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar pedidos:', err);
        this.error = err.error?.message || 'Error al cargar el historial de pedidos.';
        this.isLoading = false;
      }
    });
  }

  toggleOrderDetails(order: any): void {
    order.isExpanded = !order.isExpanded; 

    if (order.isExpanded && !order.details) { 
      this.loadOrderDetails(order);
    }
  }

  loadOrderDetails(order: any): void {
    order.isLoadingDetails = true;
    order.errorDetails = null;
    this.orderService.getOrderDetails(order.pedido_id).subscribe({ 
      next: (response) => {
        order.details = response; 
        order.isLoadingDetails = false;
      },
      error: (err) => {
        console.error('Error al cargar detalles del pedido:', err);
        order.errorDetails = err.error?.message || 'Error al cargar los detalles de este pedido.';
        order.isLoadingDetails = false;
      }
    });
  }
}