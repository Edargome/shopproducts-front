import { Injectable, computed, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Product } from '../core/models/product.model';
import { PagedResponse } from '../core/models/paged-response.model';
import { ProductsApiService } from '../core/services/products-api.service';
import { friendlyHttpError } from '../core/utils/http-error.util';

@Injectable({ providedIn: 'root' })
export class CatalogStore {
  private _q = signal('');
  private _page = signal(1);
  private _limit = signal(12);

  private _data = signal<PagedResponse<Product>>({
    items: [],
    total: 0,
    page: 1,
    limit: 12,
    pages: 1,
  });

  private _loading = signal(false);
  private _error = signal('');
  private _toast = signal('');

  q = computed(() => this._q());
  page = computed(() => this._page());
  limit = computed(() => this._limit());
  data = computed(() => this._data());
  loading = computed(() => this._loading());
  error = computed(() => this._error());
  toast = computed(() => this._toast());

  constructor(private api: ProductsApiService) {}

  setQuery(q: string) {
    this._q.set(q);
  }

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

  async purchase(productId: string, qty: number) {
    this._loading.set(true);
    this._error.set('');
    this._toast.set('');

    try {
      const updated = await firstValueFrom(this.api.purchase(productId, qty));
      // actualiza card local si está visible
      const current = this._data();
      this._data.set({
        ...current,
        items: current.items.map((p) => (p.id === updated.id ? updated : p)),
      });
      this._loading.set(false);
      this._toast.set('Compra realizada ✅ (stock actualizado)');
    } catch (err) {
      this._loading.set(false);
      this._error.set(friendlyHttpError(err));
    }
  }
}
