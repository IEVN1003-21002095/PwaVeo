import { Component, Input, OnInit, Output, EventEmitter, signal } from '@angular/core';
import { Product } from '../modelos/producto.model';
import { ACTIVE_PRODUCTS } from '../catalogo-c/catalogo-c.component'; // Datos de ejemplo

@Component({
  selector: 'app-detalles',
  standalone: true,
  templateUrl: './detalles.component.html',
  styleUrls: [],
})
export class DetallesComponent implements OnInit {
  @Input() productId: number | null = null;
  @Output() goBack = new EventEmitter<void>();

  producto: Product | undefined;

  cantidad = signal(1);
  tallaSeleccionada = signal<'S' | 'M' | 'L'>('L');
  colorSeleccionado = signal<'blanco' | 'negro'>('negro');
  favorito = signal(false);

  tallas: ('S' | 'M' | 'L')[] = ['S', 'M', 'L'];
  colores: ('blanco' | 'negro')[] = ['blanco', 'negro'];

  ngOnInit(): void {
    this.loadProductDetails();
  }

  loadProductDetails(): void {
    if (this.productId !== null) {
      this.producto = ACTIVE_PRODUCTS.find(p => p.id === this.productId);
      if (!this.producto) {
        console.error(`Producto con ID ${this.productId} no encontrado.`);
      }
    }
  }

  ajustarCantidad(delta: number): void {
    this.cantidad.update(c => Math.max(1, c + delta));
  }

  seleccionarTalla(talla: 'S' | 'M' | 'L'): void {
    this.tallaSeleccionada.set(talla);
  }

  seleccionarColor(color: 'blanco' | 'negro'): void {
    this.colorSeleccionado.set(color);
  }

  stockDisponible(): boolean {
    if (!this.producto) return false;
    const color = this.colorSeleccionado();
    const talla = this.tallaSeleccionada();
    return (this.producto.stock as any)[color][talla] > 0;
  }

  agregarAlCarrito(): void {
    console.log(`Agregando al carrito: ${this.producto?.nombre} (ID: ${this.productId}), Talla: ${this.tallaSeleccionada()}, Color: ${this.colorSeleccionado()}, Cantidad: ${this.cantidad()}`);
  }
}
