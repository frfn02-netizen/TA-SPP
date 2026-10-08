import { Component, input } from '@angular/core';

@Component({
  selector: 'app-page-header',
  template: `
    <div class="flex flex-col gap-1">
      <h1 class="text-[26px] font-bold tracking-tight text-navy-900 sm:text-[30px]">
        {{ title() }}
      </h1>
      @if (description()) {
        <p class="max-w-2xl text-sm text-ink-600 sm:text-[15px]">
          {{ description() }}
        </p>
      }
    </div>
  `,
})
export class PageHeader {
  readonly title = input.required<string>();
  readonly description = input<string | null>(null);
}
