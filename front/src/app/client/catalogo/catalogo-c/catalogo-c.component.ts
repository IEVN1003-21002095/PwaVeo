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
  imagen_principal?: string;
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
          const productosActivos = (res.data || []).filter(p => p.activo === 1);
          
          const productosParseados: Producto[] = productosActivos.map(p => ({
            ...p,
            precio: parseFloat(p.precio),
            descripcion: p.descripcion || 'Sin descripción.',
            imagen: p.imagen || 'https://placehold.co/400x533/f4f4f4/cccccc?text=VEO',
            imagen_principal: null
          }));
          
          this.productos.set(productosParseados);
          
          // Cargar imágenes de cada producto en paralelo
          productosActivos.forEach((producto, index) => {
            this.http.get<{ success: boolean; data: any[] }>(
              `http://localhost:5000/api/product/${producto.id}/images`
            ).subscribe({
              next: (imgRes) => {
                if (imgRes.success && imgRes.data && imgRes.data.length > 0) {
                  // Buscar imagen principal, o tomar la primera
                  const principal = imgRes.data.find(img => img.es_principal === 1);
                  const imagenUrl = principal ? principal.imagen_data : imgRes.data[0].imagen_data;
                  
                  // Actualizar el producto específico
                  const productos = this.productos();
                  productos[index].imagen_principal = imagenUrl;
                  this.productos.set([...productos]); // Trigger change detection
                }
              },
              error: (err) => {
                console.log(`No se pudieron cargar imágenes para producto ${producto.id}`, err);
                // Mantener placeholder por defecto
              }
            });
          });
        },
        error: (err) => console.error('Error cargando productos', err)
      });
  }


verDetalle(id: number) {
  this.router.navigate(['/client', 'catalogo', 'producto', id]);
}

}
