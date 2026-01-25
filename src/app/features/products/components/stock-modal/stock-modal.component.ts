import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Product, ProductsService } from '../../../../core/services/products.service';

@Component({
  selector: 'app-stock-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './stock-modal.component.html',
})
export class StockModalComponent {
  @Input({ required: true }) product!: Product | null;
  @Input({ required: true }) open = false;

  @Output() close = new EventEmitter<void>();
  @Output() updated = new EventEmitter<Product>(); // emite el producto actualizado

  loading = false;
  alertMsg = '';
  alertType: 'success' | 'danger' | 'warning' | 'info' = 'info';

  form!: FormGroup;

  constructor(
    private readonly fb: FormBuilder,
    private readonly productsApi: ProductsService,
  ) {
    this.form = this.fb.group({
      delta: [0, [Validators.required]],
      qty: [1, [Validators.required, Validators.min(1)]],
    });
  }

  onClose() {
    this.alertMsg = '';
    this.form.reset({ delta: 0, qty: 1 });
    this.close.emit();
  }

  adjust() {
    if (!this.product) return;
    const delta = Number(this.form.value.delta);
    if (Number.isNaN(delta)) {
      this.setAlert('warning', 'Debe ingresar un valor numérico para ajustar el stock');
      return;
    }

    this.loading = true;
    this.clearAlert();

    this.productsApi.adjustStock(this.product.id, delta).subscribe({
      next: (p) => {
        this.loading = false;
        this.setAlert('success', `Stock se ajustó por ${delta}. Nuevo stock: ${p.stock}`);
        this.updated.emit(p);
      },
      error: (err) => {
        this.loading = false;
        this.handleHttpError(err);
      },
    });
  }

  decrement() {
    if (!this.product) return;
    const qty = Number(this.form.value.qty);
    if (Number.isNaN(qty) || qty < 1) {
      this.setAlert('warning', 'La cantidad debe ser mayor o igual a 1');
      return;
    }

    this.loading = true;
    this.clearAlert();

    this.productsApi.decrementStock(this.product.id, qty).subscribe({
      next: (p) => {
        this.loading = false;
        this.setAlert('success', `Stock disminuido por ${qty}. Nuevo stock: ${p.stock}`);
        this.updated.emit(p);
      },
      error: (err) => {
        this.loading = false;
        this.handleHttpError(err);
      },
    });
  }

  private setAlert(type: typeof this.alertType, msg: string) {
    this.alertType = type;
    this.alertMsg = msg;
  }

  private clearAlert() {
    this.alertMsg = '';
  }

  private handleHttpError(err: any) {
    const status = err?.status;
    const msg = err?.error?.message ?? 'Unexpected error';

    if (status === 409) return this.setAlert('danger', msg);
    if (status === 404) return this.setAlert('danger', 'Producto no encontrado');
    if (status === 400) return this.setAlert('warning', msg);
    if (status === 0) return this.setAlert('danger', 'No se puede conectar a la API (verifique el backend/CORS).');

    return this.setAlert('danger', msg);
  }
}
