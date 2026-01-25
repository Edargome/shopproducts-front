import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../../../core/services/products.service';

@Component({
  selector: 'app-products-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './products-table.component.html',
})
export class ProductsTableComponent {
  @Input({ required: true }) items: Product[] = [];

  @Output() edit = new EventEmitter<Product>();
  @Output() adjustStock = new EventEmitter<Product>();
  @Output() decrementStock = new EventEmitter<Product>();
}

