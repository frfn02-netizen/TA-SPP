import { Component, input } from '@angular/core';
import {
  Banknote,
  CircleCheck,
  Clock,
  CreditCard,
  Eye,
  EyeOff,
  GraduationCap,
  Inbox,
  LayoutDashboard,
  Lock,
  LogOut,
  LucideAngularModule,
  LucideIcons,
  Menu,
  ReceiptText,
  RefreshCw,
  ShieldX,
  TriangleAlert,
  User,
  X,
} from 'lucide-angular';

export const APP_ICONS: LucideIcons = {
  Banknote,
  CircleCheck,
  Clock,
  CreditCard,
  Eye,
  EyeOff,
  GraduationCap,
  Inbox,
  LayoutDashboard,
  Lock,
  LogOut,
  Menu,
  ReceiptText,
  RefreshCw,
  ShieldX,
  TriangleAlert,
  User,
  X,
};

@Component({
  selector: 'app-icon',
  imports: [LucideAngularModule],
  template: `
    <span class="inline-flex shrink-0" [class]="iconClass()" aria-hidden="true">
      <lucide-icon [name]="name()" [size]="size()" [strokeWidth]="strokeWidth()" />
    </span>
  `,
})
export class AppIcon {
  readonly name = input.required<string>();
  readonly size = input<number>(18);
  readonly strokeWidth = input<number>(1.75);
  readonly iconClass = input<string>('');
}
