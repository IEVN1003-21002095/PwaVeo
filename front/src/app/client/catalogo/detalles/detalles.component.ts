import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { CarritoService } from '../../carrito/carrito.service';
import { ReviewAdminService } from '../../../admin/reviewAdmin/services/reviewAdmin.service';
import { StarsPipe } from '../../../admin/reviewAdmin/stars.pipe';

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

interface ReviewAprobada {
  id: number;
  calificacion: number;
  comentario: string;
  fecha: string;
  nombre_completo: string;
}

@Component({
  selector: 'app-detalles',
  standalone: true,
  imports: [CommonModule, StarsPipe],
  providers: [ReviewAdminService],
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
  reviews: ReviewAprobada[] = [];
  loadingReviews = false;
  
  alertaCarrito = signal<boolean>(false);
  alertaMensaje = signal<string>('');

  constructor(
    private http: HttpClient, 
    private route: ActivatedRoute, 
    private router: Router, 
    private carrito: CarritoService,
    private reviewService: ReviewAdminService
  ) {}

  ngOnInit() {
    // Inicializar servicio carrito (recargar desde localStorage)
    this.carrito.init();
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.cargarProductoBase(id);
      this.cargarVariantesProducto(id);
      this.cargarResenasAprobadas(id);
    }
  }

  cargarResenasAprobadas(productoId: number) {
    this.loadingReviews = true;
    this.http.get<ReviewAprobada[]>(`http://localhost:5000/api/reviews/product/${productoId}`)
      .subscribe({
        next: res => {
          this.reviews = res || [];
          this.loadingReviews = false;
        },
        error: err => {
          console.error('Error cargando reseñas', err);
          this.reviews = [];
          this.loadingReviews = false;
        }
      });
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
    this.router.navigate(['/client', 'catalogo']);
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
    const prod = this.producto();
    if (!prod) {
      this.alertaMensaje.set('Producto no disponible');
      this.alertaCarrito.set(true);
      setTimeout(() => this.alertaCarrito.set(false), 3000);
      return;
    }

    const item = {
      productoId: prod.id,
      nombre: prod.nombre,
      precio: prod.precio,
      imagen: prod.imagen,
      color: colorSel,
      talla: tallaSel,
      cantidad: cantidadSel
    };

    this.carrito.addToCart(item).subscribe(resp => {
      if (resp.success) {
        const mensaje = `¡Listo! Se agregaron ${cantidadSel}x ${prod.nombre} (Talla ${tallaSel}, Color ${colorSel}) al carrito.`;
        this.alertaMensaje.set(mensaje);
        this.alertaCarrito.set(true);
        setTimeout(() => this.alertaCarrito.set(false), 3000);
      } else {
        const msg = resp.message || 'No fue posible añadir al carrito';
        this.alertaMensaje.set(msg);
        this.alertaCarrito.set(true);
        setTimeout(() => this.alertaCarrito.set(false), 4000);
      }
    });
  }
}
