import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../../core/models/product.model';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div class="card h-100 shadow-sm">
    <div class="card-body d-flex flex-column">
      <div class="d-flex justify-content-between align-items-start">
        <div>
          <h5 class="card-title mb-1">{{ product.name }}</h5>
          <small class="text-muted">SKU: {{ product.sku }}</small>
        </div>
        <span class="badge text-bg-secondary">Stock: {{ product.stock }}</span>
      </div>

      <p class="card-text mt-2" *ngIf="product.description">{{ product.description }}</p>

      <div class="mt-auto d-flex justify-content-between align-items-center">
        <strong>{{ product.price | currency }}</strong>

        <button class="btn btn-primary btn-sm"
          [disabled]="product.stock <= 0"
          (click)="buy.emit(product)">
          Comprar
        </button>
      </div>

      <div *ngIf="product.stock <= 0" class="mt-2 text-danger small">
        Sin stock
      </div>
    </div>
  </div>
  `,
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;
  @Output() buy = new EventEmitter<Product>();
}
