import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AdminProductsStore } from '../../../state/admin-products.store';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { QtyModalComponent } from '../../../shared/components/qty-modal/qty-modal.component';
import { Product } from '../../../core/models/product.model';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, PaginationComponent, QtyModalComponent],
  template: `
  <div class="container py-4">
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-2">
      <h3 class="m-0">Administración de productos</h3>
      <a class="btn btn-primary" routerLink="/admin/products/new">Nuevo producto</a>
    </div>

    <div class="d-flex flex-wrap gap-2 mt-3">
      <input class="form-control" style="min-width: 260px"
        placeholder="Buscar..."
        [(ngModel)]="q" (keyup.enter)="search()" />
      <button class="btn btn-outline-primary" (click)="search()">Buscar</button>
      <button class="btn btn-outline-secondary" (click)="clear()">Limpiar</button>
    </div>

    <div class="alert alert-danger mt-3" *ngIf="store.error()">{{ store.error() }}</div>
    <div class="alert alert-success mt-3" *ngIf="store.toast()">{{ store.toast() }}</div>
    <div class="mt-3" *ngIf="store.loading()">Cargando...</div>

    <div class="table-responsive mt-3">
      <table class="table table-hover align-middle">
        <thead>
          <tr>
            <th>SKU</th>
            <th>Nombre</th>
            <th class="text-end">Precio</th>
            <th class="text-end">Stock</th>
            <th style="width: 220px"></th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let p of store.data().items">
            <td>{{ p.sku }}</td>
            <td>{{ p.name }}</td>
            <td class="text-end">{{ p.price | currency }}</td>
            <td class="text-end">{{ p.stock }}</td>
            <td class="text-end">
              <button class="btn btn-sm btn-outline-secondary me-2" (click)="openAdjust(p)">Ajustar</button>
              <button class="btn btn-sm btn-outline-primary me-2" (click)="edit(p)">Editar</button>
              <button class="btn btn-sm btn-outline-danger" (click)="remove(p)">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <app-pagination
      [page]="store.data().page"
      [pages]="store.data().pages"
      (pageChange)="goToPage($event)">
    </app-pagination>
  </div>

  <app-qty-modal
    [open]="adjustOpen"
    title="Ajustar stock (delta)"
    hint="Usa positivo para aumentar, negativo para disminuir. Ej: -2"
    (close)="closeAdjust()"
    (confirm)="confirmAdjust($event)">
  </app-qty-modal>
  `,
})
export class AdminProductsPageComponent implements OnInit {
  q = '';
  adjustOpen = false;
  selected: Product | null = null;

  constructor(
    public store: AdminProductsStore,
    private router: Router,
  ) {}

  ngOnInit() {
    this.store.load(1, 20);
  }

  search() {
    this.store.setQuery(this.q);
    this.store.load(1, this.store.limit());
  }

  clear() {
    this.q = '';
    this.store.setQuery('');
    this.store.load(1, this.store.limit());
  }

  goToPage(p: number) {
    this.store.load(p, this.store.limit());
  }

  edit(p: Product) {
    this.router.navigate(['/admin/products', p.id, 'edit']);
  }

  remove(p: Product) {
    const ok = confirm(`¿Eliminar "${p.name}"?`);
    if (!ok) return;
    this.store.remove(p.id);
  }

  openAdjust(p: Product) {
    this.selected = p;
    this.adjustOpen = true;
  }

  closeAdjust() {
    this.adjustOpen = false;
    this.selected = null;
  }

  confirmAdjust(delta: number) {
    if (!this.selected) return;
    this.adjustOpen = false;
    this.store.adjustDelta(this.selected.id, Number(delta));
  }
}
