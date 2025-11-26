import { Component, Input, OnInit, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductoCliente, ACTIVE_PRODUCTS } from '../catalogo-c/catalogo-c.component';

@Component({
  selector: 'app-detalles',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './detalles.component.html',
  styleUrls: [],
})
export class DetallesComponent implements OnInit {
  @Input() productId: number | null = null;
  @Output() goBack = new EventEmitter<void>();

  producto: ProductoCliente | undefined;
  
  cantidad = signal(1);
  tallaSeleccionada = signal('L'); 
  colorSeleccionado = signal('Negro'); 
  activeTab = signal<'detalles' | 'reviews'>('detalles'); 
  favorito = false;

  tallas = ['S', 'M', 'L', 'XL'];
  colores: { name: string, hex: string }[] = [
    { name: 'Negro', hex: '#000000' },
    { name: 'Gris', hex: '#808080' }, 
  ];

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
  
  seleccionarTalla(talla: string): void {
    this.tallaSeleccionada.set(talla);
  }

  seleccionarColor(color: string): void {
    this.colorSeleccionado.set(color);
  }

  changeTab(tab: 'detalles' | 'reviews'): void {
    this.activeTab.set(tab);
  }

  agregarAlCarrito(): void {
    console.log(`Agregando al carrito: ${this.producto?.nombre} (ID: ${this.productId}), Talla: ${this.tallaSeleccionada()}, Color: ${this.colorSeleccionado()}, Cantidad: ${this.cantidad()}`);
  }

  get stockTotal(): number {
    if (!this.producto || !this.producto.stock) return 0;

    // Convertimos los valores a number para evitar errores de TS
    const stockValues = Object.values(this.producto.stock).map(v => Number(v));
    return stockValues.reduce((a, b) => a + b, 0);
  }
}
