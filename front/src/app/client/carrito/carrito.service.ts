import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';

export interface CartItem {
  productoId: number;
  inventarioId?: number; // ID del inventario (variante específica)
  nombre: string;
  precio: number;
  imagen?: string;
  color: string;
  talla: string;
  cantidad: number;
}

@Injectable({ providedIn: 'root' })
export class CarritoService {
  private storageKey = 'cart';
  private apiBase = 'http://localhost:5000/api/product';

  private _cart$ = new BehaviorSubject<CartItem[]>(this.loadFromStorage());

  constructor(private http: HttpClient) {}

  // Inicialización que puede invocarse desde ngOnInit de componentes
  init() {
    this._cart$.next(this.loadFromStorage());
  }

  private loadFromStorage(): CartItem[] {
    try {
      const raw = localStorage.getItem(this.storageKey);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error('Error leyendo carrito desde localStorage', e);
      return [];
    }
  }

  private saveToStorage(items: CartItem[]) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(items));
      this._cart$.next(items);
    } catch (e) {
      console.error('Error guardando carrito en localStorage', e);
    }
  }

  get cart$(): Observable<CartItem[]> {
    return this._cart$.asObservable();
  }

  getCartSnapshot(): CartItem[] {
    return this._cart$.getValue();
  }

  clearCart() {
    this.saveToStorage([]);
  }

  removeItem(indexOrPredicate: number | ((i: CartItem) => boolean)) {
    const list = this.getCartSnapshot();
    const newList = typeof indexOrPredicate === 'number'
      ? list.filter((_, idx) => idx !== indexOrPredicate)
      : list.filter(i => !indexOrPredicate(i));
    this.saveToStorage(newList);
  }

  // Incrementa la cantidad de una variante en delta (positivo/negativo).
  // Para aumentos utiliza la validación de stock mediante addToCart.
  increaseQuantity(productoId: number, color: string, talla: string, delta = 1) {
    if (delta <= 0) return;
    const snapshot = this.getCartSnapshot();
    const idx = snapshot.findIndex(ci => ci.productoId === productoId && ci.color === color && ci.talla === talla);
    if (idx > -1) {
      const item = snapshot[idx];
      // Usar addToCart con cantidad=delta para validar stock y sumar
      this.addToCart({ ...item, cantidad: delta }).subscribe(resp => {
        // no-op: addToCart ya actualiza el storage si success
      });
    }
  }

  decreaseQuantity(productoId: number, color: string, talla: string, delta = 1) {
    if (delta <= 0) return;
    const snapshot = this.getCartSnapshot();
    const idx = snapshot.findIndex(ci => ci.productoId === productoId && ci.color === color && ci.talla === talla);
    if (idx > -1) {
      const item = { ...snapshot[idx] };
      item.cantidad = item.cantidad - delta;
      if (item.cantidad <= 0) {
        // eliminar
        this.removeItem(i => i.productoId === productoId && i.color === color && i.talla === talla);
      } else {
        // reemplazar
        const newList = snapshot.slice();
        newList[idx] = item;
        this.saveToStorage(newList);
      }
    }
  }

  // Establece cantidad exacta (sin validar stock). Úsalo con precaución.
  setQuantity(productoId: number, color: string, talla: string, cantidad: number) {
    const snapshot = this.getCartSnapshot();
    const idx = snapshot.findIndex(ci => ci.productoId === productoId && ci.color === color && ci.talla === talla);
    if (idx > -1) {
      if (cantidad <= 0) {
        this.removeItem(i => i.productoId === productoId && i.color === color && i.talla === talla);
      } else {
        const newList = snapshot.slice();
        newList[idx] = { ...newList[idx], cantidad };
        this.saveToStorage(newList);
      }
    }
  }

  // Agrega al carrito validando stock contra la API de inventario.
  // Devuelve observable con { success: boolean, message?: string }
  addToCart(item: CartItem): Observable<{ success: boolean; message?: string }> {
    // Primero consultamos variantes del producto para encontrar la combinación
    return this.http.get<{ success: boolean; data?: any[]; message?: string }>(`${this.apiBase}/${item.productoId}/inventory`).pipe(
      map(resp => {
        if (!resp || resp.success === false) {
          return { success: false, message: (resp && resp.message) || 'Error validando inventario' };
        }
        const variantes = resp.data || [];
        const variante = variantes.find((v: any) => v.color === item.color && v.talla === item.talla);
        if (!variante) return { success: false, message: 'No existe variante seleccionada' };

        const disponible = Number(variante.cantidad || 0);
        // Obtener el inventario_id de la variante (campo 'id' en la respuesta)
        const inventarioId = Number(variante.id || variante[0]);
        
        // contamos cantidad ya en carrito para esa variante
        const current = this.getCartSnapshot();
        const existingQty = current
          .filter(ci => ci.productoId === item.productoId && ci.color === item.color && ci.talla === item.talla)
          .reduce((s, x) => s + x.cantidad, 0);

        if (existingQty + item.cantidad > disponible) {
          return { success: false, message: `Stock insuficiente. Disponible: ${disponible}, en carrito: ${existingQty}` };
        }

        // agregar o sumar a item existente (guardando inventarioId)
        const foundIdx = current.findIndex(ci => ci.productoId === item.productoId && ci.color === item.color && ci.talla === item.talla);
        if (foundIdx > -1) {
          current[foundIdx].cantidad += item.cantidad;
          current[foundIdx].inventarioId = inventarioId; // Actualizar inventarioId
        } else {
          current.push({ ...item, inventarioId }); // Agregar con inventarioId
        }
        this.saveToStorage(current);
        return { success: true };
      }),
      catchError(err => {
        console.error('Error en addToCart', err);
        return of({ success: false, message: 'Error conectando al servidor' });
      })
    );
  }

  // Validar todo el carrito en backend (devuelve issues si hay)
  validateCartServer(cart: CartItem[]) {
    return this.http.post<{ success: boolean; issues?: any[] }>('http://localhost:5000/api/cart/validate', { cart });
  }
}
