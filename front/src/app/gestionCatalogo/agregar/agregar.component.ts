import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

import { Product } from '../models/product.model';
import GestionCatalogoService from '../services/gestion_catalogo.services';

@Component({
  selector: 'app-agregar-producto',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CommonModule],
  templateUrl: './agregar.component.html',
  styles: ``
})
export class AgregarComponent implements OnInit {

  formGroup!: FormGroup;

  // Manteniendo el mismo patrón DEL INVENTARIO
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

  constructor(
    private fb: FormBuilder,
    private catalogoService: GestionCatalogoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.formGroup = this.initForm();
  }

  initForm(): FormGroup {
    return this.fb.group({
      nombre: [''],
      descripcion: [''],
      categoria: [''],
      costo: [0],
      precio: [0],
      activo: [1],
      imagen: ['']
    });
  }

  agregar(): void {
    this.catalogoService.agregarProducto(this.regProducto).subscribe({
      next: (resp) => {
        console.log("Producto agregado:", this.regProducto);
        this.router.navigate(['/gestionCatalogo']);
      },
      error: (err) => {
        console.error("Error al agregar:", err);
      }
    });
  }

  onSubmit(): void {
    const v = this.formGroup.value;

    // PASA EL FORM A regProducto  (igual que el inventario)
    this.regProducto.nombre = v.nombre;
    this.regProducto.descripcion = v.descripcion;
    this.regProducto.categoria = v.categoria;
    this.regProducto.costo = Number(v.costo);
    this.regProducto.precio = Number(v.precio);
    this.regProducto.activo = Number(v.activo);
    this.regProducto.imagen = v.imagen;

    this.agregar();
  }
}
