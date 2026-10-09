import { Routes } from '@angular/router';
import { adminGuard } from './core/auth/admin.guard';
import { authGuard } from './core/auth/auth.guard';
import { guestGuard } from './core/auth/guest.guard';
import { siswaGuard } from './core/auth/siswa.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'admin/dashboard' },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/login-page').then((m) => m.LoginPage),
  },
  {
    path: '403',
    loadComponent: () =>
      import('./features/errors/forbidden-page').then((m) => m.ForbiddenPage),
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layouts/admin/admin-layout').then((m) => m.AdminLayout),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./features/dashboard/dashboard-page').then(
            (m) => m.DashboardPage,
          ),
      },
      {
        path: 'siswa',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./features/siswa/siswa-page').then((m) => m.SiswaPage),
      },
      {
        path: 'kelas',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./features/kelas/kelas-page').then((m) => m.KelasPage),
      },
      {
        path: 'tahun-ajaran',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./features/tahun-ajaran/tahun-ajaran-page').then(
            (m) => m.TahunAjaranPage,
          ),
      },
      {
        path: 'tagihan',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./features/tagihan/tagihan-page').then((m) => m.TagihanPage),
      },
      {
        path: 'tagihan/massal',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./features/tagihan/tagihan-massal-page').then(
            (m) => m.TagihanMassalPage,
          ),
      },
      {
        path: 'transaksi',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./features/transaksi/transaksi-page').then(
            (m) => m.TransaksiPage,
          ),
      },
    ],
  },
  {
    path: 'siswa',
    canActivate: [siswaGuard],
    loadComponent: () =>
      import('./layouts/student/student-layout').then((m) => m.StudentLayout),
    children: [
      {
        path: '',
        loadComponent: () =>
          import(
            './features/student-portal/student-dashboard-page'
          ).then((m) => m.StudentDashboardPage),
      },
      {
        path: 'tagihan',
        loadComponent: () =>
          import(
            './features/student-portal/student-tagihan-page'
          ).then((m) => m.StudentTagihanPage),
      },
      {
        path: 'riwayat',
        loadComponent: () =>
          import(
            './features/student-portal/student-riwayat-page'
          ).then((m) => m.StudentRiwayatPage),
      },
      {
        path: 'pembayaran/:tagihanId',
        loadComponent: () =>
          import(
            './features/student-portal/student-pembayaran-page'
          ).then((m) => m.StudentPembayaranPage),
      },
    ],
  },
  {
    path: '**',
    loadComponent: () =>
      import('./features/errors/not-found-page').then((m) => m.NotFoundPage),
  },
];
