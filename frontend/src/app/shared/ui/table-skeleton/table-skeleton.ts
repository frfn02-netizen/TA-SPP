import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-table-skeleton',
  template: `
    <div class="rounded-card border border-line-200 bg-surface" aria-hidden="true">
      <div class="hidden md:block">
        @for (row of rowsArray(); track row) {
          <div
            class="flex items-center gap-4 border-b border-line-200 px-5 py-4 last:border-0"
          >
            <div class="h-4 flex-1 animate-pulse rounded bg-slate-50"></div>
            <div class="h-4 w-40 animate-pulse rounded bg-slate-50"></div>
            <div class="h-4 w-24 animate-pulse rounded bg-slate-50"></div>
            <div class="h-8 w-20 animate-pulse rounded-control bg-slate-50"></div>
          </div>
        }
      </div>

      <div class="md:hidden">
        @for (row of rowsArray(); track row) {
          <div class="border-b border-line-200 px-4 py-4 last:border-0">
            <div class="h-4 w-40 animate-pulse rounded bg-slate-50"></div>
            <div class="mt-2 h-3 w-28 animate-pulse rounded bg-slate-50"></div>
            <div class="mt-4 h-9 w-full animate-pulse rounded-control bg-slate-50"></div>
          </div>
        }
      </div>
    </div>
    <p class="sr-only" role="status">Memuat data.</p>
  `,
})
export class TableSkeleton {
  readonly rows = input<number>(5);
  readonly rowsArray = computed(() =>
    Array.from({ length: this.rows() }, (_, index) => index),
  );
}
