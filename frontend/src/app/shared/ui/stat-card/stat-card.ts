import { Component, computed, input } from '@angular/core';
import { formatNumber, formatRupiah } from '../../util/format';
import { AppIcon } from '../app-icon/app-icon';

export type StatTone = 'neutral' | 'pay' | 'attention';
export type StatSize = 'default' | 'large';

@Component({
  selector: 'app-stat-card',
  imports: [AppIcon],
  template: `
    <article class="flex h-full flex-col rounded-card border" [class]="containerClass()">
      <div class="flex items-start justify-between gap-3">
        <p class="text-[13px] font-medium leading-snug" [class]="labelClass()">
          {{ label() }}
        </p>
        <app-icon [name]="icon()" [size]="iconSize()" [iconClass]="iconClass()" />
      </div>
      <p
        class="mt-3 font-bold leading-none text-ink-900 tabular-money"
        [class]="valueClass()"
      >
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
  readonly size = input<StatSize>('default');
  readonly hint = input<string | null>(null);

  readonly valueText = computed(() =>
    this.format() === 'currency' ? formatRupiah(this.value()) : formatNumber(this.value()),
  );

  readonly iconSize = computed(() => (this.size() === 'large' ? 20 : 18));

  readonly valueClass = computed(() =>
    this.size() === 'large'
      ? 'text-[26px] sm:text-[30px]'
      : 'text-[26px]',
  );

  readonly containerClass = computed(() => {
    const pad = this.size() === 'large' ? 'p-6' : 'p-5';
    switch (this.tone()) {
      case 'pay':
        return `border-line-200 bg-surface ${pad}`;
      case 'attention':
        return `border-amber-700/25 bg-amber-50 ${pad}`;
      default:
        return `border-line-200 bg-surface ${pad}`;
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
