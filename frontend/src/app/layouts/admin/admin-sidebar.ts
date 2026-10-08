import { Component, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AppIcon } from '../../shared/ui/app-icon/app-icon';

@Component({
  selector: 'app-admin-sidebar',
  imports: [RouterLink, RouterLinkActive, AppIcon],
  styleUrl: './admin-sidebar.css',
  templateUrl: './admin-sidebar.html',
})
export class AdminSidebar {
  readonly open = input(false);
  readonly close = output<void>();
}
