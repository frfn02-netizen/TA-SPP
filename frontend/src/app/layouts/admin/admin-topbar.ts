import { Component, input, output } from '@angular/core';
import { AppIcon } from '../../shared/ui/app-icon/app-icon';

@Component({
  selector: 'app-admin-topbar',
  imports: [AppIcon],
  templateUrl: './admin-topbar.html',
})
export class AdminTopbar {
  readonly pageTitle = input.required<string>();
  readonly username = input.required<string>();
  readonly roleLabel = input.required<string>();
  readonly menuOpen = input(false);
  readonly menuToggle = output<void>();
  readonly logout = output<void>();
}
