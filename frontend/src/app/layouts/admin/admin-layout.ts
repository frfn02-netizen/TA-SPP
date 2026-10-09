import { Component, HostListener, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  NavigationEnd,
  Router,
  RouterOutlet,
} from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { AdminSidebar } from './admin-sidebar';
import { AdminTopbar } from './admin-topbar';
import { adminPageTitle } from './admin-nav';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, AdminSidebar, AdminTopbar],
  templateUrl: './admin-layout.html',
})
export class AdminLayout {
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);

  readonly menuOpen = signal(false);

  readonly username = computed(() => this.auth.user()?.username ?? '');
  readonly roleLabel = computed(() => {
    switch (this.auth.user()?.role) {
      case 'ADMIN':
        return 'Administrator';
      case 'SISWA':
        return 'Siswa';
      default:
        return '';
    }
  });

  readonly pageTitle = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map(() => adminPageTitle(this.router.url)),
      startWith(adminPageTitle(this.router.url)),
    ),
    { initialValue: 'Dashboard' },
  );

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeMenu();
  }

  toggleMenu(): void {
    this.menuOpen.update((value) => !value);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }

  logout(): void {
    this.auth.logout();
  }
}
