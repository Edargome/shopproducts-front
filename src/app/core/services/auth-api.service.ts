import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { API_BASE_URL } from '../tokens/api-base-url.token';
import { Actor } from '../models/actor.model';

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  constructor(
    private http: HttpClient,
    @Inject(API_BASE_URL) private baseUrl: string,
  ) {}

  login(email: string, password: string) {
    return this.http.post<{ accessToken: string }>(`${this.baseUrl}/auth/login`, { email, password });
  }

  me() {
    return this.http.get<Actor>(`${this.baseUrl}/auth/me`);
  }
}
