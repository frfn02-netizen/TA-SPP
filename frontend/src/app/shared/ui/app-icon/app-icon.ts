import { Component, input } from '@angular/core';
import {
  ArrowLeft,
  Banknote,
  CalendarRange,
  CircleCheck,
  Clock,
  CreditCard,
  Eye,
  EyeOff,
  Filter,
  GraduationCap,
  History,
  Inbox,
  LayoutDashboard,
  Lock,
  LogOut,
  LucideAngularModule,
  LucideIcons,
  Menu,
  Pencil,
  Plus,
  ReceiptText,
  RefreshCw,
  School,
  Search,
  ShieldX,
  Trash2,
  TriangleAlert,
  User,
  Users,
  X,
} from 'lucide-angular';

export const APP_ICONS: LucideIcons = {
  ArrowLeft,
  Banknote,
  CalendarRange,
  CircleCheck,
  Clock,
  CreditCard,
  Eye,
  EyeOff,
  Filter,
  GraduationCap,
  History,
  Inbox,
  LayoutDashboard,
  Lock,
  LogOut,
  Menu,
  Pencil,
  Plus,
  ReceiptText,
  RefreshCw,
  School,
  Search,
  ShieldX,
  Trash2,
  TriangleAlert,
  User,
  Users,
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
