import { Component, input, output } from '@angular/core';
import { AppIcon } from '../app-icon/app-icon';

@Component({
  selector: 'app-state-panel',
  imports: [AppIcon],
  template: `
    <div
      class="flex flex-col items-center justify-center rounded-card border border-line-200 bg-surface px-6 py-12 text-center"
      role="status"
    >
      <app-icon
        [name]="icon()"
        [size]="28"
        [strokeWidth]="1.5"
        iconClass="text-ink-600"
      />
      <h2 class="mt-4 text-base font-semibold text-ink-900">{{ title() }}</h2>
      <p class="mt-1 max-w-md text-sm text-ink-600">{{ message() }}</p>
      @if (actionLabel()) {
        <button
          type="button"
          (click)="action.emit()"
          class="mt-5 inline-flex h-10 items-center gap-2 rounded-control bg-navy-900 px-4 text-sm font-medium text-white transition-colors hover:bg-navy-800"
        >
          @if (actionIcon(); as icon) {
            <app-icon [name]="icon" [size]="16" />
          }
          {{ actionLabel() }}
        </button>
      }
    </div>
  `,
})
export class StatePanel {
  readonly icon = input<string>('TriangleAlert');
  readonly title = input.required<string>();
  readonly message = input.required<string>();
  readonly actionLabel = input<string | null>(null);
  readonly actionIcon = input<string | null>(null);
  readonly action = output<void>();
}
