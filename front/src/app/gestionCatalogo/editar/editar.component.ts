import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import GestionCatalogoService from '../services/gestion_catalogo.services';
import { Product } from '../models/product.model';

@Component({
  selector: 'app-editar-producto',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
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
  formGroup!: FormGroup;
  visible: boolean = false;

  constructor(
    private catalogoService: GestionCatalogoService,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder
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

    this.formGroup = this.fb.group({
      nombre: ['', Validators.required],
      categoria: ['', Validators.required],
      costo: [0, Validators.required],
      precio: [0, Validators.required],
      activo: [1, Validators.required],
      descripcion: [''],
      imagen: ['']
    });
  }

  abrir(producto: Product) {
    this.regProducto = { ...producto };
    this.formGroup.patchValue({
      nombre: producto.nombre,
      categoria: producto.categoria,
      costo: producto.costo,
      precio: producto.precio,
      activo: producto.activo,
      descripcion: producto.descripcion,
      imagen: producto.imagen
    });
    this.visible = true;
  }

  modificar() {
    if (!this.regProducto.id || this.formGroup.invalid) return;

    const payload = {
      ...this.regProducto,
      ...this.formGroup.value,
      costo: Number(this.formGroup.value.costo),
      precio: Number(this.formGroup.value.precio),
      activo: Number(this.formGroup.value.activo)
    };

    this.catalogoService.editarProducto(payload).subscribe({
      next: (resp) => {
        if (resp.success) this.router.navigate(['/gestionCatalogo']);
        else console.error(resp.message);
      },
      error: (err) => console.error(err)
    });
  }
}
