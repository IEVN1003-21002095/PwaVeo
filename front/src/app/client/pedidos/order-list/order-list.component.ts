import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { OrdersService, Order } from '../services/orders.service';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './order-list.component.html',
  styleUrl: './order-list.component.scss'
})
export class OrderListComponent implements OnInit {
  orders: Order[] = [];
  totalOrders: number = 0;
  isLoading = false;
  errorMsg = '';

  constructor(
    private ordersService: OrdersService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading = true;
    this.errorMsg = '';
    
    this.ordersService.getOrdersHistory().subscribe({
      next: (response) => {
        this.orders = response.pedidos;
        this.totalOrders = response.total_pedidos;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar pedidos:', err);
        this.errorMsg = 'Error al cargar el historial de pedidos.';
        this.isLoading = false;
      }
    });
  }

  viewOrderDetail(orderId: number): void {
    this.router.navigate(['/client/pedidos', orderId]);
  }

  getStatusClass(status: string): string {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('entregad') || statusLower.includes('completad')) {
      return 'status-completed';
    } else if (statusLower.includes('cancelad')) {
      return 'status-cancelled';
    } else if (statusLower.includes('pendiente')) {
      return 'status-pending';
    } else if (statusLower.includes('enviad')) {
      return 'status-shipped';
    }
    return 'status-default';
  }
}
