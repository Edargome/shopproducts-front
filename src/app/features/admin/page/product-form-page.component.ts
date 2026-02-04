import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ProductsApiService } from '../../../core/services/products-api.service';
import { friendlyHttpError } from '../../../core/utils/http-error.util';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
  <div style="max-width: 720px;">
    <div class="d-flex justify-content-between align-items-center">
      <h3 class="m-0">{{ isEdit ? 'Editar producto' : 'Nuevo producto' }}</h3>
      <a class="btn btn-outline-secondary" routerLink="/admin/products">Volver</a>
    </div>

    <div class="alert alert-danger mt-3" *ngIf="errorMsg">{{ errorMsg }}</div>

    <form class="mt-3" [formGroup]="form" (ngSubmit)="save()">
      <div class="row g-3">
        <div class="col-md-4" *ngIf="!isEdit">
          <label class="form-label">SKU</label>
          <input class="form-control" formControlName="sku" />
          <div class="text-danger small" *ngIf="form.get('sku')?.touched && form.get('sku')?.invalid">
            SKU es requerido
          </div>
        </div>

        <div class="col-md-8">
          <label class="form-label">Nombre</label>
          <input class="form-control" formControlName="name" />
          <div class="text-danger small" *ngIf="form.get('name')?.touched && form.get('name')?.invalid">
            Nombre es requerido
          </div>
        </div>

        <div class="col-12">
          <label class="form-label">Descripción</label>
          <textarea class="form-control" formControlName="description" rows="3"></textarea>
        </div>

        <div class="col-md-6">
          <label class="form-label">Precio</label>
          <input type="number" class="form-control" formControlName="price" />
        </div>

        <div class="col-md-6" *ngIf="!isEdit">
          <label class="form-label">Stock</label>
          <input type="number" class="form-control" formControlName="stock" />
        </div>

        <div class="col-12" *ngIf="isEdit" class="text-muted small">
          Nota: El stock se ajusta desde el botón "Ajustar" en la tabla (endpoint /adjust-stock).
        </div>
      </div>

      <div class="mt-3 d-flex gap-2">
        <button class="btn btn-primary" [disabled]="loading || form.invalid">
          {{ loading ? 'Guardando...' : 'Guardar' }}
        </button>
        <a class="btn btn-outline-secondary" routerLink="/admin/products">Cancelar</a>
      </div>
    </form>
  </div>
  `,
})
export class ProductFormPageComponent implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(ProductsApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  loading = false;
  errorMsg = '';

  id: string | null = null;
  isEdit = false;

  form = this.fb.group({
    sku: ['', [Validators.required, Validators.minLength(2)]],
    name: ['', [Validators.required, Validators.minLength(2)]],
    description: [''],
    price: [0, [Validators.required, Validators.min(0)]],
    stock: [0, [Validators.required, Validators.min(0)]],
  });

  async ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!this.id;

    if (this.isEdit && this.id) {
      this.loading = true;
      try {
        const p = await firstValueFrom(this.api.findById(this.id));
        this.form.patchValue({
          sku: p.sku,
          name: p.name,
          description: p.description ?? '',
          price: p.price,
          stock: p.stock,
        });

        this.form.get('sku')?.disable();
        this.form.get('stock')?.disable();
      } catch (err) {
        this.errorMsg = friendlyHttpError(err);
      } finally {
        this.loading = false;
      }
    }
  }

  async save() {
    this.errorMsg = '';
    this.loading = true;

    try {
      if (!this.isEdit) {
        const payload = this.form.getRawValue();
        await firstValueFrom(
          this.api.create({
            sku: payload.sku!,
            name: payload.name!,
            description: payload.description ?? null,
            price: Number(payload.price),
            stock: Number(payload.stock),
          }),
        );
      } else if (this.id) {
        const payload = this.form.getRawValue();
        await firstValueFrom(
          this.api.update(this.id, {
            name: payload.name ?? undefined,
            description: payload.description ?? null,
            price: Number(payload.price),
          }),
        );
      }

      this.router.navigate(['/admin/products']);
    } catch (err) {
      this.errorMsg = friendlyHttpError(err);
    } finally {
      this.loading = false;
    }
  }
}
