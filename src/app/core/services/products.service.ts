import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Product {
  id: string;
  sku: string;
  name: string;
  description?: string | null;
  price: number;
  stock: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface PagedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private readonly baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  list(page = 1, limit = 20): Observable<PagedResponse<Product>> {
    const params = new HttpParams().set('page', page).set('limit', limit);
    return this.http.get<PagedResponse<Product>>(`${this.baseUrl}/products`, { params });
  }

  search(q: string, page = 1, limit = 20): Observable<PagedResponse<Product>> {
    const params = new HttpParams().set('q', q).set('page', page).set('limit', limit);
    return this.http.get<PagedResponse<Product>>(`${this.baseUrl}/products/search`, { params });
  }

  findById(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.baseUrl}/products/${id}`);
  }

  create(payload: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) {
    return this.http.post<Product>(`${this.baseUrl}/products`, payload);
  }

  update(id: string, payload: Partial<Omit<Product, 'id'>>) {
    return this.http.patch<Product>(`${this.baseUrl}/products/${id}`, payload);
  }

  decrementStock(id: string, qty: number) {
    return this.http.post<Product>(`${this.baseUrl}/products/${id}/decrement-stock`, { qty });
  }

  adjustStock(id: string, delta: number) {
    return this.http.post<Product>(`${this.baseUrl}/products/${id}/adjust-stock`, { delta });
  }
}
