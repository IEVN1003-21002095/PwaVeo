import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import GestionInventarioService, { Variante } from '../../services/gestion_inventario.service';

@Component({
  selector: 'app-eliminar-variante',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './eliminar-variante.component.html'
})
export class EliminarVarianteComponent implements OnInit {

  id!: number;
  regVariante?: Variante;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private inventarioService: GestionInventarioService
  ) {}

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    if (!this.id) {
      this.router.navigate(['/admin/catalogo']);
      return;
    }

    this.inventarioService.getInventory(this.id).subscribe({
      next: (v) => {
        if (v) this.regVariante = v;
        else this.router.navigate(['/admin/catalogo']);
      },
      error: () => this.router.navigate(['/admin/catalogo'])
    });
  }

  eliminar(): void {
    if (!this.id) return;

    this.inventarioService.deleteVariant(this.id).subscribe({
      next: (res) => {
        console.log('Variante eliminada:', res);
        this.inventarioService.triggerRefresh();

        if (this.regVariante?.producto_id) {
          this.router.navigate(['/admin/catalogo/inventario', this.regVariante.producto_id]);
        } else {
          this.router.navigate(['/admin/catalogo']);
        }
      },
      error: (err) => {
        console.error('Error eliminando la variante:', err);
        alert('No se pudo eliminar la variante. Revisa la consola.');
      }
    });
  }
}
