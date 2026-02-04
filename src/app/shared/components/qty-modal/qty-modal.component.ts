import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-qty-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="modal-backdrop show" *ngIf="open"></div>
  <div class="modal d-block" tabindex="-1" *ngIf="open">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{{ title }}</h5>
          <button type="button" class="btn-close" (click)="close.emit()"></button>
        </div>

        <div class="modal-body">
          <label class="form-label">Cantidad</label>
          <input type="number" class="form-control" [(ngModel)]="qty" [min]="1" />
          <div class="form-text" *ngIf="hint">{{ hint }}</div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-outline-secondary" (click)="close.emit()">Cancelar</button>
          <button class="btn btn-primary" (click)="confirm.emit(qty)">Confirmar</button>
        </div>
      </div>
    </div>
  </div>
  `,
})
export class QtyModalComponent {
  @Input() open = false;
  @Input() title = 'Confirmar';
  @Input() hint = '';
  @Output() close = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<number>();

  qty = 1;
}
