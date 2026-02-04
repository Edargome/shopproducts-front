import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  template: `
  <nav *ngIf="pages > 1" aria-label="Pagination" class="d-flex justify-content-center">
    <ul class="pagination">
      <li class="page-item" [class.disabled]="page <= 1">
        <button class="page-link" (click)="go(page-1)">Anterior</button>
      </li>

      <li class="page-item disabled">
        <span class="page-link">Página {{page}} de {{pages}}</span>
      </li>

      <li class="page-item" [class.disabled]="page >= pages">
        <button class="page-link" (click)="go(page+1)">Siguiente</button>
      </li>
    </ul>
  </nav>
  `,
})
export class PaginationComponent {
  @Input() page = 1;
  @Input() pages = 1;
  @Output() pageChange = new EventEmitter<number>();

  go(p: number) {
    if (p < 1 || p > this.pages) return;
    this.pageChange.emit(p);
  }
}
