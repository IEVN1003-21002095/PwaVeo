import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import GestionCatalogoService from '../services/gestion_catalogo.services';

@Component({
  selector: 'app-agregar-producto',
  standalone: true,
  templateUrl: './agregar.component.html',
  imports: [CommonModule, FormsModule]
})
export default class AgregarProductoComponent {

  nuevoProducto: any = {
    id: 0,
    nombre: '',
    tipo: '',
    sku: '',
    estado: 'activo',
    precio: 0,
    descripcion: '',
    imagen: '',
    stock: {
      blanco: { S: 0, M: 0, L: 0 },
      negro: { S: 0, M: 0, L: 0 }
    }
  };

  constructor(
    private catalogoService: GestionCatalogoService,
    private router: Router
  ) {}

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      this.nuevoProducto.imagen = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  guardarProducto() {
    this.catalogoService.agregarProducto({
      ...this.nuevoProducto,
      id: this.catalogoService.getNextId()
    });

    this.router.navigate(['/gestionCatalogo']);
  }

  /** 🚫 Cancelar y regresar al listado */
  cancelar() {
    this.router.navigate(['/gestionCatalogo']);
  }
}
