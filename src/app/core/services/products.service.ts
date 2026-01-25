import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

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

export interface CreateProductDto {
  sku: string;
  name: string;
  description?: string | null;
  price: number;
  stock: number;
}

export interface UpdateProductDto {
  sku?: string;
  name?: string;
  description?: string | null;
  price?: number;
  stock?: number;
}

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private readonly baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  list(page = 1, limit = 20) {
    const params = new HttpParams().set('page', page).set('limit', limit);
    return this.http
      .get<PagedResponse<any>>(`${this.baseUrl}/products`, { params })
      .pipe(map((res) => this.normalizePaged(res)));
  }

  search(q: string, page = 1, limit = 20) {
    const params = new HttpParams().set('q', q).set('page', page).set('limit', limit);
    return this.http
      .get<PagedResponse<any>>(`${this.baseUrl}/products/search`, { params })
      .pipe(map((res) => this.normalizePaged(res)));
  }

  findById(id: string) {
    return this.http
      .get<any>(`${this.baseUrl}/products/${id}`)
      .pipe(map((p) => this.normalizeProduct(p)));
  }

  create(payload: CreateProductDto) {
    return this.http
      .post<any>(`${this.baseUrl}/products`, payload)
      .pipe(map((p) => this.normalizeProduct(p)));
  }

  update(id: string, payload: UpdateProductDto) {
    return this.http
      .patch<any>(`${this.baseUrl}/products/${id}`, payload)
      .pipe(map((p) => this.normalizeProduct(p)));
  }

  decrementStock(id: string, qty: number) {
    return this.http
      .post<any>(`${this.baseUrl}/products/${id}/decrement-stock`, { qty })
      .pipe(map((p) => this.normalizeProduct(p)));
  }

  adjustStock(id: string, delta: number) {
    return this.http
      .post<any>(`${this.baseUrl}/products/${id}/adjust-stock`, { delta })
      .pipe(map((p) => this.normalizeProduct(p)));
  }
  private normalizeProduct(p: any): Product {
    return {
      id: p.id ?? p._id,
      sku: p.sku,
      name: p.name,
      description: p.description ?? null,
      price: p.price,
      stock: p.stock,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    };
  }

  private normalizePaged(res: any): PagedResponse<Product> {
    return {
      items: (res.items ?? []).map((p: any) => this.normalizeProduct(p)),
      total: res.total ?? 0,
      page: res.page ?? 1,
      limit: res.limit ?? 20,
      pages: res.pages ?? Math.max(1, Math.ceil((res.total ?? 0) / (res.limit ?? 20))),
    };
  }
}
