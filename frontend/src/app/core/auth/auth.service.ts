import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { ApiResponse } from '../models/api-response.model';
import { AppUser, LoginCredentials, LoginResult } from '../models/user.model';

const TOKEN_KEY = 'sppqr.token';
const USER_KEY = 'sppqr.user';

function readStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

function readStoredUser(): AppUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as AppUser;
    if (parsed && typeof parsed.id === 'number' && typeof parsed.username === 'string') {
      return parsed;
    }
  } catch {
    return null;
  }

  return null;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);
  private readonly router = inject(Router);

  private readonly tokenState = signal<string | null>(this.readInitialToken());
  private readonly userState = signal<AppUser | null>(this.readInitialUser());

  readonly user = this.userState.asReadonly();
  readonly isAuthenticated = computed(
    () => this.tokenState() !== null && this.userState() !== null,
  );
  readonly isAdmin = computed(() => this.userState()?.role === 'ADMIN');
  readonly isStudent = computed(() => this.userState()?.role === 'SISWA');

  get token(): string | null {
    return this.tokenState();
  }

  login(credentials: LoginCredentials): Observable<AppUser> {
    return this.http
      .post<ApiResponse<LoginResult>>(`${this.apiBaseUrl}/auth/login`, credentials)
      .pipe(
        map((response) => response.data),
        tap((result) => this.setSession(result)),
        map((result) => result.user),
      );
  }

  restoreSession(): Observable<void> {
    if (!this.tokenState()) {
      return of(void 0);
    }

    return this.http
      .get<ApiResponse<AppUser>>(`${this.apiBaseUrl}/auth/me`)
      .pipe(
        tap((response) => this.userState.set(response.data)),
        map(() => void 0),
        catchError(() => {
          this.clearSession();
          return of(void 0);
        }),
      );
  }

  logout(): void {
    this.clearSession();
    void this.router.navigate(['/login']);
  }

  clearSession(): void {
    this.tokenState.set(null);
    this.userState.set(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  private readInitialToken(): string | null {
    try {
      return readStoredToken();
    } catch {
      return null;
    }
  }

  private readInitialUser(): AppUser | null {
    try {
      return readStoredUser();
    } catch {
      return null;
    }
  }

  private setSession(result: LoginResult): void {
    this.tokenState.set(result.token);
    this.userState.set(result.user);
    localStorage.setItem(TOKEN_KEY, result.token);
    localStorage.setItem(USER_KEY, JSON.stringify(result.user));
  }
}
