import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { Producto } from '../models/catalogo.model';

@Injectable({
  providedIn: 'root'
})
export class CatalogoCService {
  private apiUrl = 'http://localhost:5000/api/product';

  constructor(private http: HttpClient) {}

  getProductos(): Observable<Producto[]> {
    return this.http.get<{ success: boolean; data: any[] }>(`${this.apiUrl}/list`).pipe(
      map(res => {
        if (res.success && res.data) {
          return res.data.filter(p => p.activo === 1);
        }
        return [];
      }),
      catchError(err => {
        console.error('Error cargando productos:', err);
        return of([]);
      })
    );
  }

  getProductoPorId(id: number): Observable<Producto | undefined> {
    return this.http.get<{ success: boolean; data: Producto }>(`${this.apiUrl}/detail/${id}`).pipe(
      map(res => (res.success ? res.data : undefined)),
      catchError(err => {
        console.error('Error cargando producto:', err);
        return of(undefined);
      })
    );
  }

  crearProducto(producto: Producto): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/create`, producto).pipe(
      catchError(err => {
        console.error('Error creando producto:', err);
        throw err;
      })
    );
  }

  actualizarProducto(id: number, producto: Producto): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/update`, producto).pipe(
      catchError(err => {
        console.error('Error actualizando producto:', err);
        throw err;
      })
    );
  }

  eliminarProducto(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}/delete`).pipe(
      catchError(err => {
        console.error('Error eliminando producto:', err);
        throw err;
      })
    );
  }
}
