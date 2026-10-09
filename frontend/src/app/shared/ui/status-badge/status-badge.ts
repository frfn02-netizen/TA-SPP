import { Component, computed, input } from '@angular/core';
import { StatusTone } from '../../util/status';

@Component({
  selector: 'app-status-badge',
  template: `
    <span
      class="inline-flex items-center rounded-[4px] px-2 py-1 text-xs font-medium"
      [class]="toneClass()"
    >
      {{ label() }}
    </span>
  `,
})
export class StatusBadge {
  readonly label = input.required<string>();
  readonly tone = input<StatusTone>('neutral');

  readonly toneClass = computed(() => {
    switch (this.tone()) {
      case 'paid':
        return 'bg-green-50 text-green-700';
      case 'outstanding':
        return 'bg-amber-50 text-amber-800';
      case 'danger':
        return 'bg-red-50 text-red-700';
      default:
        return 'bg-slate-50 text-ink-700';
    }
  });
}
