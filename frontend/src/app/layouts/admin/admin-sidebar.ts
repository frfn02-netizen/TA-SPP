import { Component, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AppIcon } from '../../shared/ui/app-icon/app-icon';
import { ADMIN_NAV_GROUPS } from './admin-nav';

@Component({
  selector: 'app-admin-sidebar',
  imports: [RouterLink, RouterLinkActive, AppIcon],
  styleUrl: './admin-sidebar.css',
  templateUrl: './admin-sidebar.html',
})
export class AdminSidebar {
  readonly open = input(false);
  readonly close = output<void>();
  readonly navGroups = ADMIN_NAV_GROUPS;
}
