import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CarritoService, CartItem } from '../carrito.service';

@Component({
  selector: 'app-cart-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
  <div class="container py-4">
    <h2 class="mb-4">Tu Carrito de Compras</h2>

    <div *ngIf="items.length === 0" class="p-5 text-center text-muted">El carrito está vacío.</div>

    <div *ngIf="items.length > 0">
      <div *ngFor="let it of items" class="d-flex align-items-center border-bottom py-3">
        <div style="width:80px; height:80px; background:#f0f0f0; margin-right:1rem;">
          <img [src]="it.imagen || 'https://placehold.co/80x80/f0f0f0/6c757d?text=Prod'" style="width:100%;height:100%;object-fit:cover"/>
        </div>
        <div class="flex-grow-1">
          <div class="fw-bold">{{ it.nombre }}</div>
          <div class="text-muted">Talla: {{ it.talla }} · Color: {{ it.color }}</div>
        </div>
        <div class="mx-3 text-center">
          <button class="btn btn-sm btn-outline-secondary me-1" (click)="decrease(it)">-</button>
          <span class="mx-1">{{ it.cantidad }}</span>
          <button class="btn btn-sm btn-outline-secondary ms-1" (click)="increase(it)">+</button>
        </div>
        <div class="text-end ms-3">
          <div class="fw-bold">MXN {{ (it.precio * it.cantidad) | number:'1.2-2' }}</div>
          <button class="btn btn-link text-danger" (click)="remove(it)">Eliminar</button>
        </div>
      </div>

      <div class="mt-4 d-flex justify-content-end">
        <div class="card p-3" style="min-width:250px">
          <div class="d-flex justify-content-between"><span>Subtotal</span><strong>MXN {{ subtotal | number:'1.2-2' }}</strong></div>
          <div class="mt-2 d-grid">
            <button class="btn btn-primary" (click)="goToCheckout()">Proceder al Pago</button>
          </div>
        </div>
      </div>
    </div>
  </div>
  `
})
export class CartPageComponent implements OnInit {
  items: CartItem[] = [];
  subtotal = 0;

  constructor(private carrito: CarritoService) {}

  ngOnInit(): void {
    this.carrito.init();
    this.carrito.cart$ .subscribe(list => {
      this.items = list;
      this.recalc();
    });
  }

  recalc() {
    this.subtotal = this.items.reduce((s, i) => s + (i.precio * i.cantidad), 0);
  }

  increase(it: CartItem) {
    this.carrito.increaseQuantity(it.productoId, it.color, it.talla, 1);
  }

  decrease(it: CartItem) {
    this.carrito.decreaseQuantity(it.productoId, it.color, it.talla, 1);
  }

  remove(it: CartItem) {
    this.carrito.removeItem(i => i.productoId === it.productoId && i.color === it.color && i.talla === it.talla);
  }

  goToCheckout() {
    this.carrito.validateCartServer(this.items).subscribe({
      next: (resp) => {
        if (resp && resp.success) {
          window.location.href = '/client/checkout/address';
        } else {
          const msg = resp.issues ? JSON.stringify(resp.issues) : 'Error validando carrito';
          alert('Problemas con el carrito:\n' + msg);
        }
      },
      error: (err) => {
        console.error(err);
        alert('Error validando carrito en servidor');
      }
    });
  }
}
