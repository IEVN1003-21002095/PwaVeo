import { Component, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface Producto {
  id: number;
  nombre: string;
  precio: number;
  descripcion?: string;
  imagen?: string;
}

@Component({
  selector: 'app-catalogo-cliente',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './catalogo-cliente.component.html',
})
export class CatalogoClienteComponent implements OnInit {
  productos = signal<Producto[]>([]);

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.cargarProductos();
  }

  cargarProductos() {
    this.http.get<{ data: any[] }>('http://localhost:5000/api/product/list')
      .subscribe({
        next: (res) => {
          const productosParseados: Producto[] = (res.data || [])
            .filter(p => p.activo === 1)
            .map(p => ({
              ...p,
              precio: parseFloat(p.precio),
              descripcion: p.descripcion || 'Sin descripción.',
              imagen: p.imagen || 'https://placehold.co/400x533/f4f4f4/cccccc?text=VEO'
            }));
          this.productos.set(productosParseados);
        },
        error: (err) => console.error('Error cargando productos', err)
      });
  }


verDetalle(id: number) {
  this.router.navigate(['/catalogo', id]);
}

}
