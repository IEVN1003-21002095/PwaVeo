import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { Product } from '../models/product.model';
import GestionCatalogoService from '../services/gestion_catalogo.service';

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
    private catalogoService: GestionCatalogoService, 
    private router: Router
  ) {}

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    console.log("Eliminando Producto ID:", this.id);

    if (this.id) {
      this.catalogoService.getProductById(this.id).subscribe({
        next: (p) => {
          if (p) {
            this.producto = p;
          } else {
            this.router.navigate(['/admin/catalogo']);
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
        this.router.navigate(['/admin/catalogo']);
      },
      error: (err) => {
        console.error("Error al eliminar:", err);
        alert("No se pudo eliminar el producto.");
      }
    });
  }
}