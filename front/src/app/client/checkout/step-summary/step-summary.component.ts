import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CheckoutsService } from '../checkouts.service';
import { CarritoService } from '../../carrito/carrito.service';

@Component({
  selector: 'app-step-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './step-summary.component.html',
  styleUrl: './step-summary.component.scss'
})
export class StepSummaryComponent implements OnInit {
  address: any = null;
  payment: any = null;
  cartItems: any[] = [];
  errorMsg = '';
  loading = false;
  purchaseComplete = false;
  addressData: any = null;
  metodoNombre = '';

  constructor(
    private checkoutSvc: CheckoutsService,
    private carritoSvc: CarritoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Verificar que se completaron los pasos anteriores
    this.address = this.checkoutSvc.address$.value;
    this.payment = this.checkoutSvc.payment$.value;

    if (!this.address || !this.payment) {
      this.router.navigate(['/client/checkout/address']);
      return;
    }

    // Extraer los datos de dirección
    this.addressData = this.address.direccion;
    
    // Mapear metodo_pago_id a nombre
    const metodosMap: any = {
      1: 'Débito/Crédito',
      2: 'PayPal',
      3: 'Transferencia Bancaria'
    };
    this.metodoNombre = metodosMap[this.payment.metodo_pago_id] || 'No especificado';

    this.carritoSvc.cart$.subscribe(items => {
      this.cartItems = items;
    });

    console.log('Dirección:', this.addressData);
    console.log('Método pago:', this.payment);
    console.log('Carrito:', this.cartItems);
  }

  get subtotal(): number {
    return this.cartItems.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
  }

  confirmPurchase(): void {
    this.loading = true;
    this.errorMsg = '';

    const userId = localStorage.getItem('userId') || '1';
    
    // Validar que todos los items tengan inventarioId
    const itemsInvalidos = this.cartItems.filter(it => !it.inventarioId);
    if (itemsInvalidos.length > 0) {
      this.errorMsg = `Algunos productos no tienen inventario válido. Por favor elimínalos del carrito y agrégalos nuevamente: ${itemsInvalidos.map(i => i.nombre).join(', ')}`;
      this.loading = false;
      return;
    }
    
    // Preparar payload completo con dirección, método de pago y productos
    const payload = {
      usuario_id: userId,
      items: this.cartItems.map(it => ({
        inventario_id: it.inventarioId!,
        cantidad: it.cantidad,
        precio_unitario: it.precio
      })),
      direccion: this.addressData, // Enviar objeto completo de dirección
      metodo_pago_id: this.payment.metodo_pago_id
    };

    console.log('Enviando compra completa:', payload);

    this.checkoutSvc.confirmPurchase(payload).subscribe({
      next: (resp) => {
        console.log('Respuesta confirmación:', resp);
        this.loading = false;
        if (resp && resp.exito) {
          this.purchaseComplete = true;
          this.carritoSvc.clearCart();
          alert('¡Compra finalizada! Referencia: ' + resp.referencia);
        } else {
          this.errorMsg = resp.mensaje || 'Error al finalizar compra';
        }
      },
      error: (err) => {
        console.error('Error al confirmar:', err);
        this.loading = false;
        this.errorMsg = err?.error?.mensaje || 'Error de conexión';
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/client/checkout/payment']);
  }
}
