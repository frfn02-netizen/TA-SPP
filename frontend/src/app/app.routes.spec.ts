import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { LUCIDE_ICONS, LucideIconProvider } from 'lucide-angular';
import { of } from 'rxjs';
import { routes } from './app.routes';
import { AuthService } from './core/auth/auth.service';
import { DashboardService } from './core/dashboard/dashboard.service';
import { KelasService } from './core/kelas/kelas.service';
import { AppUser } from './core/models/user.model';
import { SiswaService } from './core/siswa/siswa.service';
import { TagihanService } from './core/tagihan/tagihan.service';
import { TransaksiService } from './core/transaksi/transaksi.service';
import { APP_ICONS } from './shared/ui/app-icon/app-icon';

const adminUser: AppUser = { id: 1, username: 'admin', role: 'ADMIN' };

function authFake(role: 'ADMIN' | 'SISWA' | null) {
  const user =
    role === 'ADMIN'
      ? adminUser
      : role === 'SISWA'
        ? ({ id: 2, username: '20260001', role: 'SISWA' } as AppUser)
        : null;

  return {
    isAuthenticated: () => user !== null,
    isAdmin: () => role === 'ADMIN',
    isStudent: () => role === 'SISWA',
    user: () => user,
    logout: () => undefined,
    login: () => of(user),
    token: user ? 'token' : null,
  };
}

function configure(role: 'ADMIN' | 'SISWA' | null): void {
  TestBed.configureTestingModule({
    providers: [
      provideRouter(routes),
      { provide: AuthService, useValue: authFake(role) },
      {
        provide: DashboardService,
        useValue: {
          getStats: () =>
            of({
              totalSiswa: 0,
              totalTagihan: 0,
              totalLunas: 0,
              totalBelumLunas: 0,
              totalTransaksi: 0,
              totalPendapatan: 0,
            }),
        },
      },
      {
        provide: SiswaService,
        useValue: {
          getList: () => of([]),
          getById: () => of(null),
          create: () => of(null),
          update: () => of(null),
          remove: () => of(null),
        },
      },
      { provide: KelasService, useValue: { getList: () => of([]) } },
      {
        provide: TagihanService,
        useValue: { getList: () => of([]), getById: () => of(null) },
      },
      {
        provide: TransaksiService,
        useValue: {
          getList: () => of([]),
          getById: () => of(null),
          create: () => of(null),
        },
      },
      {
        provide: LUCIDE_ICONS,
        multi: true,
        useValue: new LucideIconProvider(APP_ICONS),
      },
    ],
  });
}

function hostOf(harness: RouterTestingHarness): HTMLElement {
  return harness.routeNativeElement as HTMLElement;
}

describe('role-based routing', () => {
  beforeEach(() => TestBed.resetTestingModule());

  it('activates the admin siswa page for an authenticated admin', async () => {
    configure('ADMIN');
    const harness = await RouterTestingHarness.create();

    await harness.navigateByUrl('/admin/siswa');

    expect(TestBed.inject(Router).url).toBe('/admin/siswa');
    expect(hostOf(harness).querySelector('app-siswa-page')).not.toBeNull();
  });

  it('activates the student portal for an authenticated student', async () => {
    configure('SISWA');
    const harness = await RouterTestingHarness.create();

    await harness.navigateByUrl('/siswa');

    expect(TestBed.inject(Router).url).toBe('/siswa');
    expect(hostOf(harness).querySelector('app-student-dashboard-page')).not.toBeNull();
  });

  it('sends an admin away from the student portal to /admin/dashboard', async () => {
    configure('ADMIN');
    const harness = await RouterTestingHarness.create();

    await harness.navigateByUrl('/siswa');

    expect(TestBed.inject(Router).url).toBe('/admin/dashboard');
  });

  it('sends a student away from /admin to /403', async () => {
    configure('SISWA');
    const harness = await RouterTestingHarness.create();

    await harness.navigateByUrl('/admin/dashboard');

    expect(TestBed.inject(Router).url).toBe('/403');
  });

  it('redirects anonymous visitors from the student portal to /login', async () => {
    configure(null);
    const harness = await RouterTestingHarness.create();

    await harness.navigateByUrl('/siswa');

    expect(TestBed.inject(Router).url).toBe('/login');
  });
});
