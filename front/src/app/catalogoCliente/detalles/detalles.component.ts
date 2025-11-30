import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';

interface Producto {
  id: number;
  nombre: string;
  precio: number;
  descripcion: string;
  imagen: string;
}

@Component({
  selector: 'app-detalles',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './detalles.component.html',
})
export class DetallesComponent implements OnInit {
  producto = signal<Producto | null>(null);

  colorSeleccionadoSignal = signal<string>('Blanco');
  tallaSeleccionadaSignal = signal<string>('S');
  cantidadSignal = signal<number>(1);
  favorito = false;

  colores = ['Blanco', 'Negro'];
  tallas = ['S', 'M', 'L', 'XL'];

  constructor(private http: HttpClient, private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) this.cargarProducto(id);
  }

  cargarProducto(id: number) {
    this.http.get<{ data: Producto[] }>(`http://localhost:5000/api/product/list`)
      .subscribe({
        next: res => {
          const prod = res.data.find(p => p.id === id) || null;
          this.producto.set(prod);
        },
        error: err => {
          console.error('Error cargando producto', err);
          this.producto.set(null);
        }
      });
  }

  volverAlCatalogo() {
    this.router.navigate(['/catalogo']);
  }

  seleccionarColor(color: string) {
    this.colorSeleccionadoSignal.set(color);
  }

  seleccionarTalla(talla: string) {
    this.tallaSeleccionadaSignal.set(talla);
  }

  ajustarCantidad(valor: number) {
    const nueva = this.cantidadSignal() + valor;
    if (nueva > 0) this.cantidadSignal.set(nueva);
  }

  agregarAlCarrito() {
    console.log(
      `Agregado al carrito: ${this.producto()?.nombre}, talla ${this.tallaSeleccionadaSignal()}, color ${this.colorSeleccionadoSignal()}, qty ${this.cantidadSignal()}`
    );
  }
}
