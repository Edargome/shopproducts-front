import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CatalogStore } from '../../../state/catalog.store';
import { AuthStore } from '../../../state/auth.store';
import { Product } from '../../../core/models/product.model';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { QtyModalComponent } from '../../../shared/components/qty-modal/qty-modal.component';

@Component({
  selector: 'app-catalog-page',
  standalone: true,
  imports: [CommonModule, FormsModule, ProductCardComponent, PaginationComponent, QtyModalComponent],
  template: `
  <div class="container py-4">
    <div class="d-flex flex-wrap gap-2 justify-content-between align-items-center">
      <h3 class="m-0">Catálogo</h3>

      <div class="d-flex gap-2">
        <input class="form-control" style="min-width: 260px"
          placeholder="Buscar por SKU o nombre..."
          [(ngModel)]="q" (keyup.enter)="search()"/>

        <button class="btn btn-outline-primary" (click)="search()">Buscar</button>
        <button class="btn btn-outline-secondary" (click)="clear()">Limpiar</button>
      </div>
    </div>

    <div class="alert alert-danger mt-3" *ngIf="store.error()">{{ store.error() }}</div>
    <div class="alert alert-success mt-3" *ngIf="store.toast()">{{ store.toast() }}</div>

    <div class="mt-3" *ngIf="store.loading()">Cargando...</div>

    <div class="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-3 mt-1">
      <div class="col" *ngFor="let p of store.data().items">
        <app-product-card [product]="p" (buy)="onBuy(p)"></app-product-card>
      </div>
    </div>

    <div class="mt-3">
      <app-pagination
        [page]="store.data().page"
        [pages]="store.data().pages"
        (pageChange)="goToPage($event)">
      </app-pagination>
    </div>
  </div>

  <app-qty-modal
    [open]="qtyOpen"
    title="Comprar producto"
    [hint]="selected ? ('Stock disponible: ' + selected.stock) : ''"
    (close)="closeQty()"
    (confirm)="confirmBuy($event)">
  </app-qty-modal>
  `,
})
export class CatalogPageComponent implements OnInit {
  q = '';
  qtyOpen = false;
  selected: Product | null = null;

  constructor(
    public store: CatalogStore,
    public auth: AuthStore,
    private router: Router,
  ) {}

  ngOnInit() {
    this.store.load(1, 12);
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

  onBuy(p: Product) {
    if (!this.auth.isAuthenticated()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/catalog' } });
      return;
    }
    this.selected = p;
    this.qtyOpen = true;
  }

  closeQty() {
    this.qtyOpen = false;
    this.selected = null;
  }

  confirmBuy(qty: number) {
    if (!this.selected) return;
    this.qtyOpen = false;
    this.store.purchase(this.selected.id, qty);
  }
}
