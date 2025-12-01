import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SalesService } from '../services/sales.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface Venta {
  venta_id?: number;
  id?: number;
  cliente_id?: number;
  clienteId?: number;
  cliente_nombre?: string;
  cliente_apellido?: string;
  fecha: string;
  total: number;
  estado: string;
  detalles?: any[];
  [key: string]: any;
}

@Component({
  selector: 'app-sales-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule],
  templateUrl: './sales-list.component.html',
  styleUrls: ['./sales-list.component.scss']
})
export class SalesListComponent implements OnInit, OnDestroy {
  ventas: Venta[] = [];
  isLoading = true;
  error: string | null = null;
  private destroy$ = new Subject<void>();

  // Datos de ejemplo (fallback para desarrollo)
  private MOCK_VENTAS: Venta[] = [
    {
      venta_id: 1,
      cliente_id: 1,
      cliente_nombre: 'Juan',
      cliente_apellido: 'Pérez',
      fecha: 'Mon, 24 Nov 2025 20:20:11 GMT',
      total: 499.00,
      estado: 'completada',
      detalles: []
    },
    {
      venta_id: 2,
      cliente_id: 2,
      cliente_nombre: 'María',
      cliente_apellido: 'González',
      fecha: 'Mon, 24 Nov 2025 20:20:11 GMT',
      total: 899.99,
      estado: 'pendiente',
      detalles: [
        {
          cantidad: 1,
          descuento_unitario: '0.00',
          detalle_id: 2,
          inventario_id: 26,
          nombre_producto_venta: 'Hoodie Gris Premium AR (Talla M)',
          precio_unitario: 899.99,
          precio_unitario_venta: 899.99
        }
      ]
    },
    {
      venta_id: 3,
      cliente_id: 1,
      cliente_nombre: 'Juan',
      cliente_apellido: 'Pérez',
      fecha: 'Mon, 24 Nov 2025 20:20:11 GMT',
      total: 800.00,
      estado: 'cancelada',
      detalles: []
    }
  ];

  constructor(private salesService: SalesService) {}

  ngOnInit(): void {
    this.loadVentas();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadVentas(): void {
    this.isLoading = true;
    this.error = null;
    this.salesService.getVentasConDetalles()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.ventas = res.data || [];
          this.isLoading = false;
        },
        error: (err) => {
          this.error = 'Error al cargar las ventas';
          console.error(err);
          // En entornos de desarrollo, usar datos de ejemplo si la API falla
          this.ventas = this.MOCK_VENTAS;
          this.isLoading = false;
        }
      });
  }
}
