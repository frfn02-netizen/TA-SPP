import { TestBed } from '@angular/core/testing';
import { CanActivateFn, provideRouter, UrlTree } from '@angular/router';
import { AppUser } from '../models/user.model';
import { adminGuard } from './admin.guard';
import { authGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { guestGuard } from './guest.guard';

interface FakeAuth {
  isAuthenticated: () => boolean;
  isAdmin: () => boolean;
  user: () => AppUser | null;
}

const anonymous: FakeAuth = {
  isAuthenticated: () => false,
  isAdmin: () => false,
  user: () => null,
};

const admin: FakeAuth = {
  isAuthenticated: () => true,
  isAdmin: () => true,
  user: () => ({ id: 1, username: 'admin', role: 'ADMIN' }),
};

const student: FakeAuth = {
  isAuthenticated: () => true,
  isAdmin: () => false,
  user: () => ({ id: 2, username: '20260001', role: 'SISWA' }),
};

function runGuard(guard: CanActivateFn, auth: FakeAuth): unknown {
  TestBed.configureTestingModule({
    providers: [provideRouter([]), { provide: AuthService, useValue: auth }],
  });
  return TestBed.runInInjectionContext(() => guard({} as never, {} as never));
}

function urlOf(result: unknown): string | null {
  return result instanceof UrlTree ? result.toString() : null;
}

describe('route guards', () => {
  it('authGuard sends anonymous users to /login', () => {
    expect(urlOf(runGuard(authGuard, anonymous))).toBe('/login');
  });

  it('authGuard allows an authenticated admin', () => {
    expect(runGuard(authGuard, admin)).toBe(true);
  });

  it('adminGuard allows an authenticated admin', () => {
    expect(runGuard(adminGuard, admin)).toBe(true);
  });

  it('adminGuard sends an authenticated student to /403', () => {
    expect(urlOf(runGuard(adminGuard, student))).toBe('/403');
  });

  it('adminGuard sends anonymous users to /login', () => {
    expect(urlOf(runGuard(adminGuard, anonymous))).toBe('/login');
  });

  it('guestGuard sends an authenticated admin to the dashboard', () => {
    expect(urlOf(runGuard(guestGuard, admin))).toBe('/admin/dashboard');
  });

  it('guestGuard sends an authenticated student to /403', () => {
    expect(urlOf(runGuard(guestGuard, student))).toBe('/403');
  });

  it('guestGuard allows anonymous users to see the login page', () => {
    expect(runGuard(guestGuard, anonymous)).toBe(true);
  });
});
