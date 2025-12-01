import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import GestionInventarioService, { Variante, Producto, Color, Talla } from '../../services/gestion_inventario.services';

@Component({
  selector: 'app-inventario-producto',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './inventario-producto.component.html'
})
export class InventarioProductoComponent implements OnInit {

  productId!: number;
  productoNombre: string = '';
  variantes: Variante[] = [];
  cargando: boolean = false;
  visible: boolean = false;

  colores: Color[] = [];
  tallas: Talla[] = [];

  filtros = { color: '', talla: '', stock: '' as 'con' | 'sin' | '' };
  variantesFiltradas: Variante[] = [];

  constructor(private route: ActivatedRoute, private inventarioService: GestionInventarioService) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.productId = +idParam;
      this.visible = true;

      this.inventarioService.getProductById(this.productId).subscribe({
        next: (data: Producto) => {
          this.productoNombre = data.nombre;
        },
        error: (err) => {
          console.error('Error cargando producto', err);
          this.productoNombre = `Producto #${this.productId}`;
        }
      });

      this.cargarVariantes();

      this.inventarioService.getColors().subscribe({
        next: (data: Color[]) => this.colores = data,
        error: (err) => console.error('Error cargando colores', err)
      });

      this.inventarioService.getSizes().subscribe({
        next: (data: Talla[]) => this.tallas = data,
        error: (err) => console.error('Error cargando tallas', err)
      });
    }

    this.inventarioService.getRefresh().subscribe(() => this.cargarVariantes());
  }

  cargarVariantes(): void {
    this.cargando = true;
    this.inventarioService.getVariantsByProduct(this.productId).subscribe({
      next: (data) => { 
        this.variantes = data; 
        this.aplicarFiltros();
        this.cargando = false; 
      },
      error: (err) => { 
        console.error(err); 
        this.cargando = false; 
      }
    });
  }

  aplicarFiltros(): void {
    this.variantesFiltradas = this.variantes.filter(v => {
      const colorMatch = !this.filtros.color || v.color === this.filtros.color;
      const tallaMatch = !this.filtros.talla || v.talla === this.filtros.talla;
      const stockMatch = !this.filtros.stock ||
        (this.filtros.stock === 'con' && (v.cantidad ?? 0) >= 5) || 
        (this.filtros.stock === 'sin' && (v.cantidad ?? 0) < 5);     
      return colorMatch && tallaMatch && stockMatch;
    });
  }

  limpiarFiltros(): void {
    this.filtros = { color: '', talla: '', stock: '' };
    this.aplicarFiltros();
  }
}
