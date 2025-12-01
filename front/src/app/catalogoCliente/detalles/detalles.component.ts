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

interface Variante {
  color: string;
  talla: string;
  cantidad: number;
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

  colores: string[] = ['Blanco', 'Negro'];
  tallas: string[] = ['S', 'M', 'L', 'XL'];
  variantes: Variante[] = [];

  
  alertaCarrito = signal<boolean>(false);
  alertaMensaje = signal<string>('');

  constructor(private http: HttpClient, private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.cargarProductoBase(id);
      this.cargarVariantesProducto(id);
    }
  }

  cargarProductoBase(id: number) {
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

  cargarVariantesProducto(productoId: number) {
    this.http.get<{ success: boolean, data: Variante[] }>(`http://localhost:5000/api/product/${productoId}/inventory`)
      .subscribe({
        next: res => {
          this.variantes = res.data || [];
        },
        error: err => console.error('Error cargando variantes', err)
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

  get varianteDisponible(): boolean {
    const colorSel = this.colorSeleccionadoSignal();
    const tallaSel = this.tallaSeleccionadaSignal();

    const variantesColor = this.variantes.filter(v => v.color === colorSel);
    if (variantesColor.length === 0) return false;

    const varianteSeleccionada = variantesColor.find(v => v.talla === tallaSel);
    if (!varianteSeleccionada) return false;

    return varianteSeleccionada.cantidad > 0;
  }

  agregarAlCarrito() {
    const colorSel = this.colorSeleccionadoSignal();
    const tallaSel = this.tallaSeleccionadaSignal();
    const cantidadSel = this.cantidadSignal();


    const mensaje = `¡Listo! Se agregaron ${cantidadSel}x ${this.producto()?.nombre} (Talla ${tallaSel}, Color ${colorSel}) al carrito.`;
    this.alertaMensaje.set(mensaje);
    this.alertaCarrito.set(true);
    setTimeout(() => this.alertaCarrito.set(false), 3000);
  }
}
