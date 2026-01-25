import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';

import {
  Product,
  ProductsService,
  CreateProductDto,
  UpdateProductDto,
} from '../../../../core/services/products.service';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './product-form.component.html',
})
export class ProductFormComponent implements OnInit {
  id: string | null = null;
  isEdit = false;

  loading = false;
  saving = false;

  alertMsg = '';
  alertType: 'success' | 'danger' | 'warning' | 'info' = 'info';

  stockLoading = false;

  form!: FormGroup;
  stockForm!: FormGroup;

  constructor(
    private readonly fb: FormBuilder,
    private readonly products: ProductsService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
  ) {
    this.form = this.fb.group({
      sku: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(64)]],
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(120)]],
      description: [''],
      price: [0, [Validators.required, Validators.min(0)]],
      stock: [{ value: 0, disabled: true }],
    });

    this.stockForm = this.fb.group({
      delta: [0, [Validators.required]],
      qty: [1, [Validators.required, Validators.min(1)]],
    });
  }

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!this.id;

    if (this.isEdit) {
      this.loadProduct(this.id!);
    }
  }

  private setAlert(type: typeof this.alertType, msg: string) {
    this.alertType = type;
    this.alertMsg = msg;
  }

  private clearAlert() {
    this.alertMsg = '';
  }

  private loadProduct(id: string) {
    this.loading = true;
    this.clearAlert();

    this.products.findById(id).subscribe({
      next: (p: Product) => {
        this.form.patchValue({
          sku: p.sku,
          name: p.name,
          description: p.description ?? '',
          price: p.price,
          stock: p.stock,
        });
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        if (err?.status === 404) this.setAlert('danger', 'Product not found');
        else this.setAlert('danger', err?.error?.message ?? 'Failed to load product');
      },
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.setAlert('warning', 'Please fix the form errors.');
      return;
    }

    this.saving = true;
    this.clearAlert();

    const payload = this.form.getRawValue();

    if (!this.isEdit) {
      const dto: CreateProductDto = {
        sku: payload.sku,
        name: payload.name,
        description: payload.description?.trim() ? payload.description : null,
        price: Number(payload.price),
        stock: Number(payload.stock),
      };

      this.products.create(dto).subscribe({
        next: (created) => {
          this.saving = false;
          this.setAlert('success', 'Product created successfully');
          const id = (created as any).id ?? (created as any)._id;
          this.router.navigate(['/products', id, 'edit']);
        },
        error: (err) => {
          this.saving = false;
          this.handleHttpError(err);
        },
      });

      return;
    }

    const dto: UpdateProductDto = {
      sku: payload.sku,
      name: payload.name,
      description: payload.description?.trim() ? payload.description : null,
      price: Number(payload.price),
      stock: Number(payload.stock),
    };

    this.products.update(this.id!, dto).subscribe({
      next: () => {
        this.saving = false;
        this.setAlert('success', 'Product updated successfully');
      },
      error: (err) => {
        this.saving = false;
        this.handleHttpError(err);
      },
    });
  }

  adjustStock(): void {
    if (!this.isEdit) {
      this.setAlert('warning', 'Create the product first.');
      return;
    }

    const deltaCtrl = this.stockForm.get('delta');
    if (!deltaCtrl || deltaCtrl.invalid) {
      deltaCtrl?.markAsTouched();
      this.setAlert('warning', 'Delta is required.');
      return;
    }

    const delta = Number(deltaCtrl.value);

    this.stockLoading = true;
    this.clearAlert();

    this.products.adjustStock(this.id!, delta).subscribe({
      next: (p) => {
        this.stockLoading = false;
        this.form.patchValue({ stock: p.stock });
        this.setAlert('success', `Stock adjusted by ${delta}. New stock: ${p.stock}`);
      },
      error: (err) => {
        this.stockLoading = false;
        this.handleHttpError(err);
      },
    });
  }

  decrementStock(): void {
    if (!this.isEdit) {
      this.setAlert('warning', 'Create the product first.');
      return;
    }

    const qtyCtrl = this.stockForm.get('qty');
    if (!qtyCtrl || qtyCtrl.invalid) {
      qtyCtrl?.markAsTouched();
      this.setAlert('warning', 'Qty must be >= 1.');
      return;
    }

    const qty = Number(qtyCtrl.value);

    this.stockLoading = true;
    this.clearAlert();

    this.products.decrementStock(this.id!, qty).subscribe({
      next: (p) => {
        this.stockLoading = false;
        this.form.patchValue({ stock: p.stock });
        this.setAlert('success', `Stock decremented by ${qty}. New stock: ${p.stock}`);
      },
      error: (err) => {
        this.stockLoading = false;
        this.handleHttpError(err);
      },
    });
  }

  private handleHttpError(err: any) {
    const status = err?.status;
    const msg = err?.error?.message ?? 'Unexpected error';

    if (status === 409) return this.setAlert('danger', msg);
    if (status === 404) return this.setAlert('danger', 'Product not found');
    if (status === 400) return this.setAlert('warning', msg);
    if (status === 0) return this.setAlert('danger', 'Cannot connect to API (check backend/CORS).');

    return this.setAlert('danger', msg);
  }

  back(): void {
    this.router.navigate(['/products']);
  }

  get f() {
    return this.form.controls as any;
  }
}
