import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { vi } from 'vitest';
import { API_BASE_URL } from '../config/api.config';
import { AppUser } from '../models/user.model';
import { AuthService } from './auth.service';

const adminUser: AppUser = { id: 1, username: 'admin', role: 'ADMIN' };
const studentUser: AppUser = { id: 2, username: '20260001', role: 'SISWA' };

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let router: Router;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: '/api' },
      ],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('starts unauthenticated without a stored session', () => {
    expect(service.isAuthenticated()).toBe(false);
    expect(service.isAdmin()).toBe(false);
    expect(service.user()).toBeNull();
  });

  it('stores the session after a successful admin login', () => {
    let received: AppUser | undefined;

    service.login({ username: 'admin', password: 'admin123' }).subscribe((user) => {
      received = user;
    });

    const request = httpMock.expectOne('/api/auth/login');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      username: 'admin',
      password: 'admin123',
    });

    request.flush({
      success: true,
      message: 'Login berhasil',
      data: { token: 'jwt-token', user: adminUser },
    });

    expect(received).toEqual(adminUser);
    expect(service.isAuthenticated()).toBe(true);
    expect(service.isAdmin()).toBe(true);
    expect(localStorage.getItem('sppqr.token')).toBe('jwt-token');
  });

  it('clears the local session on logout and returns to login', () => {
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    service.login({ username: 'admin', password: 'admin123' }).subscribe();
    httpMock
      .expectOne('/api/auth/login')
      .flush({
        success: true,
        message: 'Login berhasil',
        data: { token: 'jwt-token', user: adminUser },
      });

    service.logout();

    expect(service.isAuthenticated()).toBe(false);
    expect(service.user()).toBeNull();
    expect(localStorage.getItem('sppqr.token')).toBeNull();
    expect(navigate).toHaveBeenCalledWith(['/login']);
  });

  it('identifies a student session as not admin', () => {
    service.login({ username: '20260001', password: '20260001' }).subscribe();
    httpMock
      .expectOne('/api/auth/login')
      .flush({
        success: true,
        message: 'Login berhasil',
        data: { token: 'student-token', user: studentUser },
      });

    expect(service.isAuthenticated()).toBe(true);
    expect(service.isAdmin()).toBe(false);
  });

  it('restores the session from GET /auth/me when a token is stored', () => {
    service.login({ username: 'admin', password: 'admin123' }).subscribe();
    httpMock
      .expectOne('/api/auth/login')
      .flush({
        success: true,
        message: 'Login berhasil',
        data: { token: 'jwt-token', user: adminUser },
      });

    let done = false;
    service.restoreSession().subscribe(() => {
      done = true;
    });

    const request = httpMock.expectOne('/api/auth/me');
    expect(request.request.method).toBe('GET');
    request.flush({ success: true, data: adminUser });

    expect(done).toBe(true);
    expect(service.user()).toEqual(adminUser);
  });
});
