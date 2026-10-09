import { Component, computed, input } from '@angular/core';
import { formatNumber } from '../../util/format';

export interface BarChartBar {
  label: string;
  value: number;
  barClass: string;
}

function chooseScale(maxValue: number): number {
  if (!Number.isFinite(maxValue) || maxValue <= 0) {
    return 0;
  }

  const magnitude = 10 ** Math.floor(Math.log10(maxValue));
  const candidates = [1, 2, 4, 5, 10].map((factor) => factor * magnitude);
  const rough = candidates.find((value) => value >= maxValue) ?? 10 * magnitude;

  return Math.ceil(rough / 4) * 4;
}

@Component({
  selector: 'app-bar-chart',
  template: `
    @if (scale() > 0) {
      <div
        class="w-full"
        role="img"
        [attr.aria-label]="ariaLabel()"
      >
        <div class="flex gap-3">
          <div class="flex flex-col" aria-hidden="true">
            <div class="h-6"></div>
            <div
              class="flex h-56 flex-col justify-between text-right text-[11px] leading-none tabular-money text-ink-600"
            >
              @for (tick of ticks(); track tick) {
                <span>{{ formatNumber(tick) }}</span>
              }
            </div>
          </div>

          <div class="min-w-0 flex-1">
            <div class="flex h-6 justify-center gap-8 px-4">
              @for (bar of bars(); track bar.label) {
                <span
                  class="w-[72px] text-center text-sm font-semibold tabular-money text-ink-900 sm:w-24"
                >
                  {{ formatNumber(bar.value) }}
                </span>
              }
            </div>

            <div class="relative h-56">
              @for (tick of ticks(); track tick) {
                <div
                  class="absolute inset-x-0 border-t"
                  [class]="tick === 0 ? 'border-line-300' : 'border-line-200'"
                  [style.bottom.%]="bottomPercent(tick)"
                ></div>
              }

              <div class="absolute inset-0 flex items-end justify-center gap-8 px-4">
                @for (bar of bars(); track bar.label) {
                  <div class="flex h-full w-[72px] items-end sm:w-24">
                    <div
                      class="w-full rounded-t-[4px]"
                      [class]="bar.barClass"
                      [style.height.%]="heightPercent(bar.value)"
                    ></div>
                  </div>
                }
              </div>
            </div>

            <div class="mt-2 flex justify-center gap-8 px-4">
              @for (bar of bars(); track bar.label) {
                <span
                  class="w-[72px] text-center text-[13px] font-medium text-ink-700 sm:w-24"
                >
                  {{ bar.label }}
                </span>
              }
            </div>
          </div>
        </div>
      </div>
    }
  `,
})
export class BarChart {
  readonly bars = input.required<BarChartBar[]>();
  readonly ariaLabel = input.required<string>();

  readonly scale = computed(() =>
    chooseScale(Math.max(0, ...this.bars().map((bar) => bar.value))),
  );

  readonly ticks = computed(() => {
    const scale = this.scale();
    if (scale === 0) {
      return [];
    }
    return [scale, scale * 0.75, scale * 0.5, scale * 0.25, 0];
  });

  protected readonly formatNumber = formatNumber;

  protected heightPercent(value: number): number {
    const scale = this.scale();
    return scale === 0 ? 0 : (value / scale) * 100;
  }

  protected bottomPercent(tick: number): number {
    const scale = this.scale();
    return scale === 0 ? 0 : (tick / scale) * 100;
  }
}
