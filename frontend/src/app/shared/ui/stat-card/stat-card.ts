import { Component, computed, input } from '@angular/core';
import { formatNumber, formatRupiah } from '../../util/format';
import { AppIcon } from '../app-icon/app-icon';

export type StatTone = 'neutral' | 'pay' | 'attention';

@Component({
  selector: 'app-stat-card',
  imports: [AppIcon],
  template: `
    <article class="flex h-full flex-col rounded-card border p-5" [class]="containerClass()">
      <div class="flex items-start justify-between gap-3">
        <p class="text-[13px] font-medium leading-snug" [class]="labelClass()">
          {{ label() }}
        </p>
        <app-icon [name]="icon()" [size]="18" [iconClass]="iconClass()" />
      </div>
      <p class="mt-3 text-[26px] font-bold leading-none text-ink-900 tabular-money">
        {{ valueText() }}
      </p>
      @if (hint()) {
        <p class="mt-2 text-xs font-medium" [class]="hintClass()">{{ hint() }}</p>
      }
    </article>
  `,
})
export class StatCard {
  readonly label = input.required<string>();
  readonly value = input.required<number>();
  readonly icon = input.required<string>();
  readonly format = input<'number' | 'currency'>('number');
  readonly tone = input<StatTone>('neutral');
  readonly hint = input<string | null>(null);

  readonly valueText = computed(() =>
    this.format() === 'currency' ? formatRupiah(this.value()) : formatNumber(this.value()),
  );

  readonly containerClass = computed(() => {
    switch (this.tone()) {
      case 'pay':
        return 'border-line-200 bg-surface';
      case 'attention':
        return 'border-amber-700/25 bg-amber-50';
      default:
        return 'border-line-200 bg-surface';
    }
  });

  readonly labelClass = computed(() =>
    this.tone() === 'attention' ? 'text-amber-800' : 'text-ink-600',
  );

  readonly iconClass = computed(() => {
    switch (this.tone()) {
      case 'pay':
        return 'text-green-700';
      case 'attention':
        return 'text-amber-700';
      default:
        return 'text-ink-600';
    }
  });

  readonly hintClass = computed(() =>
    this.tone() === 'attention' ? 'text-amber-800' : 'text-ink-600',
  );
}
