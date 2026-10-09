import { Component, input, output } from '@angular/core';
import { AppIcon } from '../app-icon/app-icon';
import { Modal } from '../modal/modal';

export type ConfirmTone = 'danger' | 'default';

@Component({
  selector: 'app-confirm-dialog',
  imports: [Modal, AppIcon],
  template: `
    <app-modal
      [open]="open()"
      [title]="title()"
      size="sm"
      (closed)="closed.emit()"
    >
      <div class="flex items-start gap-3">
        <span
          class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
          [class]="
            tone() === 'danger'
              ? 'bg-red-50 text-red-700'
              : 'bg-green-50 text-green-700'
          "
        >
          <app-icon
            [name]="tone() === 'danger' ? 'TriangleAlert' : 'CircleCheck'"
            [size]="18"
          />
        </span>
        <p class="text-sm leading-relaxed text-ink-700">{{ message() }}</p>
      </div>

      <div
        modalFooter
        class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"
      >
        <button
          type="button"
          class="inline-flex h-11 items-center justify-center rounded-control border border-line-300 bg-surface px-4 text-sm font-medium text-ink-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          [disabled]="busy()"
          (click)="closed.emit()"
        >
          Batal
        </button>
        <button
          type="button"
          class="inline-flex h-11 items-center justify-center rounded-control border px-4 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60"
          [class]="
            tone() === 'danger'
              ? 'border-red-700/20 bg-red-50 text-red-700 hover:bg-red-700/10'
              : 'border-green-700/20 bg-green-50 text-green-700 hover:bg-green-700/10'
          "
          [disabled]="busy()"
          (click)="confirmed.emit()"
        >
          {{ busy() ? 'Memproses...' : confirmLabel() }}
        </button>
      </div>
    </app-modal>
  `,
})
export class ConfirmDialog {
  readonly open = input(false);
  readonly title = input('Konfirmasi');
  readonly message = input.required<string>();
  readonly confirmLabel = input('Hapus');
  readonly tone = input<ConfirmTone>('danger');
  readonly busy = input(false);
  readonly confirmed = output<void>();
  readonly closed = output<void>();
}
