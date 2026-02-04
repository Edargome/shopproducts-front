import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthStore } from '../../../state/auth.store';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
  <div class="container py-4" style="max-width: 520px;">
    <h3>Iniciar sesión</h3>

    <div class="alert alert-danger mt-3" *ngIf="auth.error()">
      {{ auth.error() }}
    </div>

    <form class="mt-3" (ngSubmit)="onSubmit()">
      <div class="mb-3">
        <label class="form-label">Email</label>
        <input class="form-control" [(ngModel)]="email" name="email" required />
      </div>

      <div class="mb-3">
        <label class="form-label">Password</label>
        <input class="form-control" [(ngModel)]="password" name="password" type="password" required />
      </div>

      <button class="btn btn-primary" [disabled]="auth.loading()">
        {{ auth.loading() ? 'Ingresando...' : 'Entrar' }}
      </button>
    </form>

    <div class="text-muted small mt-3">
      Tip: Usa un usuario con rol ADMIN para entrar al panel admin.
    </div>
  </div>
  `,
})
export class LoginPageComponent {
  email = '';
  password = '';

  constructor(
    public auth: AuthStore,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  async onSubmit() {
    const ok = await this.auth.login(this.email, this.password);
    if (!ok) return;

    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/catalog';
    this.router.navigateByUrl(returnUrl);
  }
}
