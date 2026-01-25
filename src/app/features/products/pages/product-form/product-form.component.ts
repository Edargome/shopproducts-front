import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product-form.component.html',
})
export class ProductFormComponent {}
