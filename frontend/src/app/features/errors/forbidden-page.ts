import { Component, computed, inject } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';
import { AppIcon } from '../../shared/ui/app-icon/app-icon';

@Component({
  selector: 'app-forbidden-page',
  imports: [AppIcon],
  templateUrl: './forbidden-page.html',
})
export class ForbiddenPage {
  private readonly auth = inject(AuthService);

  readonly user = this.auth.user;
  readonly roleLabel = computed(() => {
    switch (this.user()?.role) {
      case 'ADMIN':
        return 'Administrator';
      case 'SISWA':
        return 'Siswa';
      default:
        return '';
    }
  });

  logout(): void {
    this.auth.logout();
  }
}
