import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Inventario } from '../models/inventario.model';

export type { Inventario } from '../models/inventario.model';

@Injectable({
  providedIn: 'root'
})
export class InventarioService {

  private alertasStock$ = new BehaviorSubject<string[]>([]);

  private _inventario: Inventario[] = [
    {
      id: 101,
      sku_base: 'BASE-PL-150',
      descripcion_generica: 'Playera Base 150 gr',
      color: 'Blanco',
      talla: 'M',
      gramaje: 150,
      costo_adquisicion: 120,
      stock_minimo: 10,
      cantidad_actual: 50,
      proveedor_principal: 'Textiles Omega'
    },
    {
      id: 102,
      sku_base: 'BASE-PL-200',
      descripcion_generica: 'Playera Base 200 gr',
      color: 'Negro',
      talla: 'L',
      gramaje: 200,
      costo_adquisicion: 130,
      stock_minimo: 5,
      cantidad_actual: 40,
      proveedor_principal: 'Textiles Alfa'
    }
  ];

  private inventario$ = new BehaviorSubject<Inventario[]>([...this._inventario]);

  constructor() {}

  private evaluarAlertas(item: Inventario) {
    const alertas: string[] = [];

    if (item.cantidad_actual < item.stock_minimo) {
      alertas.push(
        `Stock BAJO: ${item.descripcion_generica} - ${item.color} talla ${item.talla} (${item.cantidad_actual})`
      );
    }

    this.alertasStock$.next(alertas);
  }

  obtenerAlertas(): Observable<string[]> {
    return this.alertasStock$.asObservable();
  }

  getInventarioObservable(): Observable<Inventario[]> {
    return this.inventario$.asObservable();
  }

  setInventario(list: Inventario[]) {
    this._inventario = [...list];
    this.inventario$.next([...this._inventario]);
  }

  obtenerPorId(id: number): Inventario | undefined {
    return this._inventario.find(i => i.id === id);
  }

  getInventarioPorId(id: number): Inventario | undefined {
    return this.obtenerPorId(id);
  }

  actualizarCantidad(id: number, cantidad: number) {
    const item = this._inventario.find(i => i.id === id);
    if (!item) return;

    item.cantidad_actual = cantidad;
    this.evaluarAlertas(item);
    this.inventario$.next([...this._inventario]);
  }

  agregar(item: Inventario) {
    item.id = Math.max(...this._inventario.map(i => i.id), 0) + 1;
    this._inventario.push(item);
    this.evaluarAlertas(item);
    this.inventario$.next([...this._inventario]);
  }

  eliminar(id: number) {
    this._inventario = this._inventario.filter(i => i.id !== id);
    this.inventario$.next([...this._inventario]);
  }

  obtenerTodo(): Inventario[] {
    return [...this._inventario];
  }

  actualizar(id: number, item: Inventario) {
    const index = this._inventario.findIndex(i => i.id === id);
    if (index !== -1) {
      this._inventario[index] = { ...item, id };
      this.evaluarAlertas(this._inventario[index]);
      this.inventario$.next([...this._inventario]);
    }
  }

  eliminarProducto(id: number) {
    this.eliminar(id);
  }
}
