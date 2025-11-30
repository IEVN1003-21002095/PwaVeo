import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Product } from '../models/product.model';

interface ApiResponse { success: boolean; data?: any; message?: string; }

@Injectable({ providedIn: 'root' })
export default class GestionCatalogoService {

  private apiUrl = 'http://127.0.0.1:5000/api/product';
  private _refresh$ = new Subject<void>();

  constructor(private http: HttpClient) {}

  get refresh$() { return this._refresh$.asObservable(); }

  // ===================== PRODUCTOS =====================
  getProducts(): Observable<Product[]> {
    return this.http.get<ApiResponse>(`${this.apiUrl}/list`).pipe(
      map(res => (res.success ? res.data : []) as Product[])
    );
  }

  getProductById(id: number): Observable<Product | undefined> {
    return this.getProducts().pipe(
      map(products => products.find(p => p.id === id))
    );
  }

  agregarProducto(producto: Product): Observable<ApiResponse> {
    const payload = {
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      categoria: producto.categoria,
      costo: Number(producto.costo),
      precio: Number(producto.precio),
      activo: Number(producto.activo),
      imagen: producto.imagen ?? "",
      proveedor_id: Number(producto.proveedor_id) || 1
    };
    return this.http.post<ApiResponse>(`${this.apiUrl}/create`, payload)
      .pipe(tap(() => this._refresh$.next()));
  }

  editarProducto(producto: Product): Observable<ApiResponse> {
    const payload = {
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      categoria: producto.categoria,
      costo: Number(producto.costo),
      precio: Number(producto.precio),
      activo: Number(producto.activo),
      imagen: producto.imagen ?? "",
      proveedor_id: Number(producto.proveedor_id) || 1
    };
    return this.http.put<ApiResponse>(
      `${this.apiUrl}/${producto.id}/update`,
      payload
    ).pipe(tap(() => this._refresh$.next()));
  }

  eliminarProducto(id: number): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.apiUrl}/${id}/delete`)
      .pipe(tap(() => this._refresh$.next()));
  }

  // ===================== VARIANTES =====================
  getVariants(productId: number): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.apiUrl}/${productId}/inventory`);
  }

  agregarVariante(data: any): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.apiUrl}/inventory/add`, data)
      .pipe(tap(() => this._refresh$.next()));
  }

  editarVariante(inventoryId: number, data: any): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(`${this.apiUrl}/inventory/${inventoryId}/update`, data)
      .pipe(tap(() => this._refresh$.next()));
  }

  eliminarVariante(inventoryId: number): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.apiUrl}/inventory/${inventoryId}/delete`)
      .pipe(tap(() => this._refresh$.next()));
  }
}
