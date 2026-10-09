import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { AppIcon } from '../../shared/ui/app-icon/app-icon';
import { STUDENT_NAV_ITEMS } from './student-nav';

@Component({
  selector: 'app-student-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, AppIcon],
  styleUrl: './student-layout.css',
  templateUrl: './student-layout.html',
})
export class StudentLayout {
  private readonly auth = inject(AuthService);

  readonly navItems = STUDENT_NAV_ITEMS;
  readonly username = computed(() => this.auth.user()?.username ?? '');

  logout(): void {
    this.auth.logout();
  }
}
