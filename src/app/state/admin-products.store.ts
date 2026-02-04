import { Injectable, computed, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ProductsApiService, CreateProductDto, UpdateProductDto } from '../core/services/products-api.service';
import { Product } from '../core/models/product.model';
import { PagedResponse } from '../core/models/paged-response.model';
import { friendlyHttpError } from '../core/utils/http-error.util';

@Injectable({ providedIn: 'root' })
export class AdminProductsStore {
  private _page = signal(1);
  private _limit = signal(20);
  private _q = signal('');

  private _data = signal<PagedResponse<Product>>({
    items: [],
    total: 0,
    page: 1,
    limit: 20,
    pages: 1,
  });

  private _loading = signal(false);
  private _error = signal('');
  private _toast = signal('');

  page = computed(() => this._page());
  limit = computed(() => this._limit());
  q = computed(() => this._q());
  data = computed(() => this._data());
  loading = computed(() => this._loading());
  error = computed(() => this._error());
  toast = computed(() => this._toast());

  constructor(private api: ProductsApiService) {}

  setQuery(q: string) { this._q.set(q); }

  async load(page = this._page(), limit = this._limit()) {
    this._loading.set(true);
    this._error.set('');
    this._toast.set('');

    try {
      const term = this._q().trim();
      const res = term
        ? await firstValueFrom(this.api.search(term, page, limit))
        : await firstValueFrom(this.api.list(page, limit));

      this._data.set(res);
      this._page.set(res.page);
      this._limit.set(res.limit);
      this._loading.set(false);
    } catch (err) {
      this._loading.set(false);
      this._error.set(friendlyHttpError(err));
    }
  }

  async create(payload: CreateProductDto) {
    this._loading.set(true);
    this._error.set('');
    this._toast.set('');
    try {
      await firstValueFrom(this.api.create(payload));
      this._loading.set(false);
      this._toast.set('Producto creado ✅');
      await this.load(1, this._limit());
    } catch (err) {
      this._loading.set(false);
      this._error.set(friendlyHttpError(err));
    }
  }

  async update(id: string, payload: UpdateProductDto) {
    this._loading.set(true);
    this._error.set('');
    this._toast.set('');
    try {
      const updated = await firstValueFrom(this.api.update(id, payload));
      const current = this._data();
      this._data.set({
        ...current,
        items: current.items.map((p) => (p.id === updated.id ? updated : p)),
      });
      this._loading.set(false);
      this._toast.set('Producto actualizado ✅');
    } catch (err) {
      this._loading.set(false);
      this._error.set(friendlyHttpError(err));
    }
  }

  async remove(id: string) {
    this._loading.set(true);
    this._error.set('');
    this._toast.set('');
    try {
      await firstValueFrom(this.api.delete(id));
      this._loading.set(false);
      this._toast.set('Producto eliminado ✅');
      // recarga para recalcular páginas
      await this.load(this._page(), this._limit());
    } catch (err) {
      this._loading.set(false);
      this._error.set(friendlyHttpError(err));
    }
  }

  async adjustDelta(id: string, delta: number) {
    this._loading.set(true);
    this._error.set('');
    this._toast.set('');
    try {
      const updated = await firstValueFrom(this.api.adjustStockDelta(id, delta));
      const current = this._data();
      this._data.set({
        ...current,
        items: current.items.map((p) => (p.id === updated.id ? updated : p)),
      });
      this._loading.set(false);
      this._toast.set('Stock ajustado ✅');
    } catch (err) {
      this._loading.set(false);
      this._error.set(friendlyHttpError(err));
    }
  }
}
