import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { Product } from '../models/product.model';
import GestionCatalogoService from '../services/gestion_catalogo.services';

@Component({
  selector: 'app-eliminar-producto',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './eliminar.component.html'
})
export class EliminarComponent implements OnInit {

  id!: number;
  producto: Product | undefined;

  constructor(
    private route: ActivatedRoute,
    private catalogoService: GestionCatalogoService, // Tu servicio conectado al API
    private router: Router
  ) {}

  ngOnInit(): void {
    // 1. Obtener ID de la URL (Ruta hija)
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    console.log("Eliminando Producto ID:", this.id);

    // 2. Cargar datos para mostrar en el modal antes de borrar
    if (this.id) {
      this.catalogoService.getProductById(this.id).subscribe({
        next: (p) => {
          if (p) {
            this.producto = p;
          } else {
            // Si no existe, cerrar modal
            this.router.navigate(['/gestionCatalogo']);
          }
        },
        error: (err) => console.error("Error cargando producto:", err)
      });
    }
  }

  eliminar(): void {
    if (!this.id) return;

    this.catalogoService.eliminarProducto(this.id).subscribe({
      next: () => {
        console.log("Producto eliminado");
        // 3. Navegar de vuelta al catálogo (esto cierra el modal)
        // Como el servicio tiene el Subject 'refresh$', la tabla padre se actualizará sola
        this.router.navigate(['/gestionCatalogo']);
      },
      error: (err) => {
        console.error("Error al eliminar:", err);
        alert("No se pudo eliminar el producto.");
      }
    });
  }
}