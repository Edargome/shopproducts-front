import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import {
  PagedResponse,
  Product,
  ProductsService,
} from '../../../../core/services/products.service';

import { ProductsTableComponent } from '../../components/products-table/products-table.component';
import { StockModalComponent } from '../../components/stock-modal/stock-modal.component';

@Component({
  selector: 'app-products-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ProductsTableComponent, StockModalComponent],
  templateUrl: './products-list.component.html',
})
export class ProductsListComponent implements OnInit {
  q = '';
  page = 1;
  limit = 20;

  loading = false;
  errorMsg = '';

  data: PagedResponse<Product> = {
    items: [],
    total: 0,
    page: 1,
    limit: 20,
    pages: 1,
  };

  stockOpen = false;
  selectedProduct: Product | null = null;

  constructor(
    private readonly products: ProductsService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  onSearch(): void {
    this.page = 1;
    this.load();
  }

  onClear(): void {
    this.q = '';
    this.page = 1;
    this.load();
  }

  onLimitChange(): void {
    this.page = 1;
    this.load();
  }

  goToPage(p: number): void {
    this.page = p;
    this.load();
  }

  private load(): void {
    this.loading = true;
    this.errorMsg = '';

    const term = this.q.trim();
    const req$ = term
      ? this.products.search(term, this.page, this.limit)
      : this.products.list(this.page, this.limit);

    req$.subscribe({
      next: (res) => {
        this.data = res;
        this.page = res.page;
        this.limit = res.limit;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        const status = err?.status;
        if (status === 0) this.errorMsg = 'Cannot connect to API (check CORS / server running).';
        else this.errorMsg = err?.error?.message ?? 'Unexpected error';
      },
    });
  }

  onEdit(p: Product): void {
    this.router.navigate(['/products', p.id, 'edit']);
  }

  onAdjustStock(p: Product): void {
    this.selectedProduct = p;
    this.stockOpen = true;
  }

  onDecrementStock(p: Product): void {
    this.selectedProduct = p;
    this.stockOpen = true;
  }

  onCloseModal(): void {
    this.stockOpen = false;
    this.selectedProduct = null;
  }

  onProductUpdated(updated: Product): void {
    const idx = this.data.items.findIndex((x) => x.id === updated.id);
    if (idx >= 0) {
      this.data = {
        ...this.data,
        items: this.data.items.map((x) => (x.id === updated.id ? updated : x)),
      };
    }
  }
}
