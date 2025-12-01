import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { OrdersService, OrderDetail } from '../services/orders.service';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './order-detail.component.html',
  styleUrl: './order-detail.component.scss'
})
export class OrderDetailComponent implements OnInit {
  orderDetail: OrderDetail | null = null;
  orderId: number = 0;
  isLoading = false;
  errorMsg = '';

  constructor(
    private ordersService: OrdersService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.orderId = +params['id'];
      if (this.orderId) {
        this.loadOrderDetail();
      }
    });
  }

  loadOrderDetail(): void {
    this.isLoading = true;
    this.errorMsg = '';
    
    this.ordersService.getOrderDetails(this.orderId).subscribe({
      next: (response) => {
        this.orderDetail = response;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar detalles del pedido:', err);
        this.errorMsg = err.error?.error || 'Error al cargar los detalles del pedido.';
        this.isLoading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/client/pedidos']);
  }

  calculateSubtotal(): number {
    if (!this.orderDetail?.items) return 0;
    return this.orderDetail.items.reduce((sum, item) => 
      sum + (item.precio_unitario_venta * item.cantidad), 0
    );
  }

  getStatusClass(status: string): string {
    const statusLower = status?.toLowerCase() || '';
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