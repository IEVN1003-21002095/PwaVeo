import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule, Location } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

import { Insumo } from '../models/insumo.model';
import { InventarioService } from '../services/inventario.services';

@Component({
  selector: 'app-editar-stock',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './editar.component.html'
})
export class EditarComponent implements OnInit {
  
  dataSource: any = [];
  formGroup!: FormGroup;
  tem: any;

  regInventario: Insumo = {
    id: 0,
    nombre_insumo: '',
    color_id: 0,
    talla_id: 0,
    cantidad: 0,
    unidad: '',
    precio: 0,
    estado: 'Activo'
  };

  coloresOptions = [
    { id: 1, nombre: 'Negro' },
    { id: 2, nombre: 'Blanco' }
  ];

  tallasOptions = [
    { id: 1, nombre: 'S' },
    { id: 2, nombre: 'M' },
    { id: 3, nombre: 'L' },
    { id: 4, nombre: 'XL' }
  ];

  constructor(
    private fb: FormBuilder,
    private location: Location,
    public inventarioService: InventarioService,
    private router: Router
  ) {}

  ngOnInit() {
    this.formGroup = this.initForm();
    
    this.tem = this.location.path().split('/');
    const id = parseInt(this.tem[3]); 
    console.log("Componente ID: " + id);

    this.inventarioService.getInventarioPorId(id).subscribe({
      next: (insumo) => {
        if (insumo) {
          this.dataSource = insumo;
          this.asignaCampos(this.dataSource);
        } else {
          console.error("Insumo no encontrado");
          this.router.navigate(['/gestionStock']);
        }
      },
      error: (err) => console.error(err)
    });
  }

  initForm(): FormGroup {
    return this.fb.group({
      nombre_insumo: [''],
      color_id: [0],
      talla_id: [0],
      cantidad: [0],
      unidad: [''],
      precio: [0],
      estado: ['Activo']
    });
  }

  asignaCampos(dataSource: Insumo) {
    this.regInventario.id = dataSource.id;
    this.regInventario.nombre_insumo = dataSource.nombre_insumo;
    this.regInventario.color_id = dataSource.color_id;
    this.regInventario.talla_id = dataSource.talla_id;
    this.regInventario.cantidad = dataSource.cantidad;
    this.regInventario.unidad = dataSource.unidad;
    this.regInventario.precio = dataSource.precio;
    this.regInventario.estado = dataSource.estado;

    console.log("Insumo cargado:", this.regInventario);
  }

  modificar() {
    if (!this.regInventario.id) return;

    this.inventarioService.actualizar(this.regInventario.id, this.regInventario).subscribe({
      next: () => {
        console.log("Insumo modificado:", this.regInventario);
        this.router.navigate(['/gestionStock']);
      },
      error: (err) => console.error("Error al actualizar:", err)
    });
  }
}