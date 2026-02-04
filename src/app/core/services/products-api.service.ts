import { HttpClient, HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { API_BASE_URL } from '../tokens/api-base-url.token';
import { Product } from '../models/product.model';
import { PagedResponse } from '../models/paged-response.model';
import { map } from 'rxjs/operators';

export interface CreateProductDto {
  sku: string;
  name: string;
  description?: string | null;
  price: number;
  stock: number;
}

export interface UpdateProductDto {
  name?: string;
  description?: string | null;
  price?: number;
}

@Injectable({ providedIn: 'root' })
export class ProductsApiService {
  constructor(
    private http: HttpClient,
    @Inject(API_BASE_URL) private baseUrl: string,
  ) {}

  list(page = 1, limit = 12) {
    const params = new HttpParams().set('page', page).set('limit', limit);
    return this.http.get<PagedResponse<any>>(`${this.baseUrl}/products`, { params })
      .pipe(map((r) => this.normalizePaged(r)));
  }

  search(q: string, page = 1, limit = 12) {
    const params = new HttpParams().set('q', q).set('page', page).set('limit', limit);
    return this.http.get<PagedResponse<any>>(`${this.baseUrl}/products/search`, { params })
      .pipe(map((r) => this.normalizePaged(r)));
  }

  findById(id: string) {
    return this.http.get<any>(`${this.baseUrl}/products/${id}`)
      .pipe(map((p) => this.normalizeProduct(p)));
  }

  create(payload: CreateProductDto) {
    return this.http.post<any>(`${this.baseUrl}/products`, payload)
      .pipe(map((p) => this.normalizeProduct(p)));
  }

  update(id: string, payload: UpdateProductDto) {
    return this.http.patch<any>(`${this.baseUrl}/products/${id}`, payload)
      .pipe(map((p) => this.normalizeProduct(p)));
  }

  delete(id: string) {
    return this.http.delete<void>(`${this.baseUrl}/products/${id}`);
  }

  adjustStockDelta(id: string, delta: number) {
    return this.http.post<any>(`${this.baseUrl}/products/${id}/adjust-stock`, { delta })
      .pipe(map((p) => this.normalizeProduct(p)));
  }

  setStock(id: string, stock: number) {
    return this.http.post<any>(`${this.baseUrl}/products/${id}/adjust-stock`, { stock })
      .pipe(map((p) => this.normalizeProduct(p)));
  }

  purchase(id: string, qty: number) {
    return this.http.post<any>(`${this.baseUrl}/products/${id}/purchase`, { qty })
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
    const items = (res.items ?? []).map((p: any) => this.normalizeProduct(p));
    const total = res.total ?? 0;
    const page = res.page ?? 1;
    const limit = res.limit ?? 12;
    const pages = res.pages ?? Math.max(1, Math.ceil(total / limit));
    return { items, total, page, limit, pages };
  }
}
