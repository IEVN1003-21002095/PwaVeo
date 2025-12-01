import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface Variante {
  id: number;
  producto_id: number;
  color_id: number;
  color: string;
  talla_id: number;
  talla: string;
  cantidad: number;
  ubicacion: string;
}

export interface Producto {
  id: number;
  nombre: string;
}

export interface Color {
  id: number;
  nombre: string;
}

export interface Talla {
  id: number;
  nombre: string;
}

@Injectable({
  providedIn: 'root'
})
export default class GestionInventarioService {

  private apiUrl = 'http://localhost:5000/api/product';
  private refresh$ = new BehaviorSubject<void>(undefined);

  constructor(private http: HttpClient) {}

  getRefresh(): Observable<void> {
    return this.refresh$.asObservable();
  }

  triggerRefresh(): void {
    this.refresh$.next();
  }

  getVariantsByProduct(producto_id: number): Observable<Variante[]> {
    return this.http.get<{ success: boolean, data: Variante[] }>(`${this.apiUrl}/${producto_id}/inventory`)
      .pipe(
        map(response => response.data),
        catchError(err => {
          console.error('Error cargando variantes', err);
          return of([]); 
        })
      );
  }

  getInventory(id: number): Observable<Variante> {
    return this.http.get<{ success: boolean, data: Variante }>(`${this.apiUrl}/inventory/${id}`)
      .pipe(
        map(response => response.data),
        catchError(err => {
          console.error('Error cargando variante', err);
          return of({} as Variante);
        })
      );
  }

  getProductById(id: number): Observable<Producto> {
    return of({ id, nombre: `Producto #${id}` });
  }

  getColors(): Observable<Color[]> {
    return of([
      { id: 1, nombre: 'Negro' },
      { id: 2, nombre: 'Blanco' }
    ]);
  }

  getSizes(): Observable<Talla[]> {
    return of([
      { id: 1, nombre: 'S' },
      { id: 2, nombre: 'M' },
      { id: 3, nombre: 'L' },
      { id: 4, nombre: 'XL' }
    ]);
  }

  addVariant(regVariante: Variante): Observable<any> {
    return this.http.post(`${this.apiUrl}/inventory/add`, regVariante);
  }

  updateVariant(id: number, regVariante: Variante): Observable<any> {
    return this.http.put(`${this.apiUrl}/inventory/${id}/update`, regVariante);
  }

  deleteVariant(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/inventory/${id}/delete`);
  }
}
