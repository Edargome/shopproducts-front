import { Injectable, computed, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AuthApiService } from '../core/services/auth-api.service';
import { Actor } from '../core/models/actor.model';
import { friendlyHttpError } from '../core/utils/http-error.util';

const TOKEN_KEY = 'shopproduct_token';

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private _token = signal<string | null>(localStorage.getItem(TOKEN_KEY));
  private _actor = signal<Actor | null>(null);
  private _loading = signal(false);
  private _error = signal('');

  token = computed(() => this._token());
  actor = computed(() => this._actor());
  isAuthenticated = computed(() => !!this._token());
  isAdmin = computed(() => this._actor()?.role === 'ADMIN');
  loading = computed(() => this._loading());
  error = computed(() => this._error());

  constructor(private api: AuthApiService) {
    // si hay token guardado, intenta cargar /me
    if (this._token()) this.refreshMe();
  }

  async login(email: string, password: string): Promise<boolean> {
    this._loading.set(true);
    this._error.set('');

    try {
      const res = await firstValueFrom(this.api.login(email, password));
      this._token.set(res.accessToken);
      localStorage.setItem(TOKEN_KEY, res.accessToken);

      await this.refreshMe();
      this._loading.set(false);
      return true;
    } catch (err) {
      this._loading.set(false);
      this._error.set(friendlyHttpError(err));
      return false;
    }
  }

  logout() {
    this._token.set(null);
    this._actor.set(null);
    localStorage.removeItem(TOKEN_KEY);
  }

  async refreshMe() {
    try {
      const actor = await firstValueFrom(this.api.me());
      this._actor.set(actor);
    } catch {
      // token inválido
      this.logout();
    }
  }
}
