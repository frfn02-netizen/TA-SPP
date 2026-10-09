import { Component, computed, input, output } from '@angular/core';
import { AppIcon } from '../app-icon/app-icon';

export type AlertTone = 'success' | 'error' | 'info';

@Component({
  selector: 'app-inline-alert',
  imports: [AppIcon],
  template: `
    <div
      class="flex items-start gap-2 rounded-control border px-3 py-2.5 text-sm"
      [class]="toneClass()"
      [attr.role]="tone() === 'error' ? 'alert' : 'status'"
    >
      <app-icon [name]="iconName()" [size]="16" iconClass="mt-0.5" />
      <span class="min-w-0 flex-1">{{ message() }}</span>
      @if (dismissible()) {
        <button
          type="button"
          class="-mr-1 -mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-control transition-colors hover:bg-black/5"
          (click)="dismissed.emit()"
          aria-label="Tutup pesan"
        >
          <app-icon name="X" [size]="16" />
        </button>
      }
    </div>
  `,
})
export class InlineAlert {
  readonly tone = input<AlertTone>('success');
  readonly message = input.required<string>();
  readonly dismissible = input(false);
  readonly dismissed = output<void>();

  readonly toneClass = computed(() => {
    switch (this.tone()) {
      case 'error':
        return 'border-red-700/20 bg-red-50 text-red-700';
      case 'info':
        return 'border-line-200 bg-canvas text-ink-700';
      default:
        return 'border-green-700/20 bg-green-50 text-green-700';
    }
  });

  readonly iconName = computed(() => {
    switch (this.tone()) {
      case 'error':
        return 'TriangleAlert';
      case 'info':
        return 'Inbox';
      default:
        return 'CircleCheck';
    }
  });
}
