import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Producto } from '../models/catalogo.model';
@Injectable({
  providedIn: 'root'
})
export class CatalogoService {

  private baseUrl = 'http://localhost:5000/api/productos';

  constructor(private http: HttpClient) { }

  getProductos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(this.baseUrl);
  }

  getProductoDetalle(productId: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.baseUrl}/${productId}`);
  }
}
