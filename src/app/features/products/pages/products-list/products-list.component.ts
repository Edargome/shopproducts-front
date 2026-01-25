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

@Component({
  selector: 'app-products-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ProductsTableComponent],
  templateUrl: './products-list.component.html',
})
export class ProductsListComponent implements OnInit {
  // UI state
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
        // Aseguramos page/limit por si backend no los retorna
        this.data = {
          ...res,
          page: res.page ?? this.page,
          limit: res.limit ?? this.limit,
          pages: res.pages ?? Math.max(1, Math.ceil((res.total ?? 0) / this.limit)),
        };
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

  // Actions from table
  onEdit(p: Product): void {
    this.router.navigate(['/products', p.id, 'edit']);
  }

  onAdjustStock(p: Product): void {
    // por ahora: navegamos a edit (luego lo cambiamos a modal)
    this.router.navigate(['/products', p.id, 'edit'], { queryParams: { tab: 'stock' } });
  }

  onDecrementStock(p: Product): void {
    this.router.navigate(['/products', p.id, 'edit'], { queryParams: { tab: 'stock' } });
  }
}
