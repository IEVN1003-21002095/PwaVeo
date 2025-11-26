import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import GestionCatalogoService, { Product } from '../services/gestion_catalogo.services';

@Component({
  selector: 'app-editar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './editar.component.html'
})
export default class EditarComponent implements OnInit {

  producto!: Product;

  constructor(
    private route: ActivatedRoute,
    private catalogoService: GestionCatalogoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = +this.route.snapshot.paramMap.get('id')!;
    const p = this.catalogoService.obtenerProductoPorId(id);

    if (!p) {
      this.router.navigate(['/gestionCatalogo']);
      return;
    }

    this.producto = JSON.parse(JSON.stringify(p));
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      this.producto.imagen = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  guardarCambios() {
    this.catalogoService.actualizarProducto(this.producto);
    this.router.navigate(['/gestionCatalogo']);
  }

  cancelar() {
    this.router.navigate(['/gestionCatalogo']);
  }
}
