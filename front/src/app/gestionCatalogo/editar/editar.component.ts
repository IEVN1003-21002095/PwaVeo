import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import GestionCatalogoService from '../services/gestion_catalogo.services';
import { Product } from '../models/product.model';

@Component({
  selector: 'app-editar-producto',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './editar.component.html'
})
export class EditarComponent implements OnInit {

  regProducto: Product = {
    id: 0,
    nombre: '',
    descripcion: '',
    categoria: '',
    costo: 0,
    precio: 0,
    proveedor_id: 1,
    activo: 1,
    imagen: ''
  };

  categorias = ['Ropa', 'Accesorios', 'Calzado', 'Tecnología'];
  variantes: Variante[] = []; // Lista de variantes del producto

  visible: boolean = false;

  constructor(
    private catalogoService: GestionCatalogoService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = Number(idParam);
      this.catalogoService.getProductById(id).subscribe({
        next: (product) => {
          if (product) this.abrir(product);
          else this.router.navigate(['/gestionCatalogo']);
        },
        error: () => this.router.navigate(['/gestionCatalogo'])
      });
    }
  }

  abrir(producto: Product) {
    this.regProducto = { ...producto };
    this.cargarVariantes(producto.id);
    this.visible = true;
  }

  cerrar() {
    this.visible = false;
    this.router.navigate(['/gestionCatalogo']);
  }

  modificar() {
    if (!this.regProducto.id) return;

    const payload = {
      ...this.regProducto,
      costo: Number(this.regProducto.costo),
      precio: Number(this.regProducto.precio),
      activo: Number(this.regProducto.activo),
      variantes: this.variantes.map(v => ({
        id: v.id || 0,
        color: v.color || '',
        talla: v.talla || '',
        cantidad: Number(v.cantidad) || 0,
        ubicacion: v.ubicacion || ''
      }))
    };

    this.catalogoService.editarProducto(payload).subscribe({
      next: (resp) => {
        if (resp.success) {
          alert('Producto modificado');
          this.cerrar();
        } else {
          alert("Error al guardar: " + resp.message);
        }
      },
      error: (err) => {
        console.error("Error al actualizar:", err);
        alert("Error de servidor al actualizar");
      }
    });
  }

  cargarVariantes(productId: number) {
    this.catalogoService.getVariants(productId).subscribe({
      next: (res) => {
        if (res.success) {
          this.variantes = res.data.map((v: any) => ({
            id: v.id,
            color: v.color,
            talla: v.talla,
            cantidad: v.cantidad,
            ubicacion: v.ubicacion
          }));
        } else {
          console.error("Error al cargar variantes:", res.message);
        }
      },
      error: (err) => console.error("Error al obtener variantes:", err)
    });
  }

  eliminarVariante(variant: Variante) {
    if (!confirm(`¿Deseas eliminar la variante ${variant.color} - ${variant.talla}?`)) return;

    if (variant.id && variant.id !== 0) {
      this.catalogoService.eliminarVariante(variant.id).subscribe({
        next: (res) => {
          if (res.success) {
            alert("Variante eliminada");
            this.cargarVariantes(this.regProducto.id);
          } else {
            alert("Error: " + res.message);
          }
        },
        error: (err) => {
          console.error(err);
          alert("Error al eliminar variante");
        }
      });
    } else {
      this.variantes = this.variantes.filter(v => v !== variant);
    }
  }

  onVarianteCreada(variante: Variante) {
    this.variantes.push(variante); // Se agrega automáticamente al listado
  }
}
