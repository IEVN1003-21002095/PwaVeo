import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Product } from '../models/product.model';

interface ApiResponse { success: boolean; data?: any; message?: string; image_id?: number; }

export interface ProductImage {
  id: number;
  producto_id: number;
  es_principal: number;
  color_id?: number;
  color_nombre?: string;
  imagen_data: string; // Base64
  creado_en: string;
}

export interface AddImageRequest {
  producto_id: number;
  imagen_data: string;
  es_principal?: number;
  color_id?: number;
}

@Injectable({ providedIn: 'root' })
export default class GestionCatalogoService {

  private apiUrl = 'http://localhost:5000/api/product';
  private _refresh$ = new Subject<void>();

  constructor(private http: HttpClient) {}

  get refresh$() { return this._refresh$.asObservable(); }

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

  // ==================== GESTIÓN DE IMÁGENES ====================
  
  getProductImages(productId: number): Observable<ProductImage[]> {
    return this.http.get<ApiResponse>(`${this.apiUrl}/${productId}/images`).pipe(
      map(res => (res.success ? res.data : []) as ProductImage[])
    );
  }

  addProductImage(request: AddImageRequest): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.apiUrl}/images/add`, request)
      .pipe(tap(() => this._refresh$.next()));
  }

  updateProductImage(imageId: number, data: Partial<AddImageRequest>): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(`${this.apiUrl}/images/${imageId}/update`, data)
      .pipe(tap(() => this._refresh$.next()));
  }

  deleteProductImage(imageId: number): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.apiUrl}/images/${imageId}/delete`)
      .pipe(tap(() => this._refresh$.next()));
  }

  setPrincipalImage(imageId: number): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(`${this.apiUrl}/images/${imageId}/set-principal`, {})
      .pipe(tap(() => this._refresh$.next()));
  }

}