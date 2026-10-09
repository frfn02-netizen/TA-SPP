import {
  Component,
  ElementRef,
  HostListener,
  computed,
  effect,
  input,
  output,
  viewChild,
} from '@angular/core';
import { AppIcon } from '../app-icon/app-icon';

export type ModalSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-modal',
  imports: [AppIcon],
  template: `
    @if (open()) {
      <div class="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
        <div
          class="absolute inset-0 bg-navy-900/50"
          (click)="requestClose()"
        ></div>

        <div
          #panel
          tabindex="-1"
          class="relative z-10 flex max-h-[92dvh] w-full flex-col border border-line-200 bg-surface shadow-xl outline-none"
          [class]="panelClass()"
          role="dialog"
          aria-modal="true"
          [attr.aria-labelledby]="headingId"
          (keydown)="onPanelKeydown($event)"
        >
          <header class="flex items-start justify-between gap-4 border-b border-line-200 px-5 py-4">
            <div class="min-w-0">
              <h2 [id]="headingId" class="text-base font-semibold text-ink-900">
                {{ title() }}
              </h2>
              @if (description()) {
                <p class="mt-1 text-sm text-ink-600">{{ description() }}</p>
              }
            </div>
            <button
              type="button"
              class="-mr-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-control text-ink-600 transition-colors hover:bg-slate-50 hover:text-ink-900"
              (click)="requestClose()"
              aria-label="Tutup dialog"
            >
              <app-icon name="X" [size]="18" />
            </button>
          </header>

          <div class="min-h-0 flex-1 overflow-y-auto px-5 py-4">
            <ng-content />
          </div>

          <footer
            class="flex flex-col-reverse gap-2 border-t border-line-200 px-5 py-4 empty:hidden sm:flex-row sm:justify-end"
          >
            <ng-content select="[modalFooter]" />
          </footer>
        </div>
      </div>
    }
  `,
})
export class Modal {
  readonly open = input(false);
  readonly title = input.required<string>();
  readonly description = input<string | null>(null);
  readonly size = input<ModalSize>('md');
  readonly closed = output<void>();

  readonly headingId = `modal-${Math.random().toString(36).slice(2, 8)}`;

  private readonly panel = viewChild<ElementRef<HTMLElement>>('panel');

  readonly panelClass = computed(() => {
    switch (this.size()) {
      case 'sm':
        return 'max-w-sm rounded-t-card sm:rounded-card';
      case 'lg':
        return 'max-w-2xl rounded-t-card sm:rounded-card';
      default:
        return 'max-w-lg rounded-t-card sm:rounded-card';
    }
  });

  constructor() {
    effect((onCleanup) => {
      if (!this.open()) {
        return;
      }

      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      const focusTimer = setTimeout(() => {
        this.panel()?.nativeElement.focus();
      }, 0);

      onCleanup(() => {
        clearTimeout(focusTimer);
        document.body.style.overflow = previousOverflow;
      });
    });
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.open()) {
      this.requestClose();
    }
  }

  requestClose(): void {
    this.closed.emit();
  }

  onPanelKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Tab') {
      return;
    }

    const panel = this.panel()?.nativeElement;
    if (!panel) {
      return;
    }

    const focusables = Array.from(
      panel.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    );

    if (focusables.length === 0) {
      event.preventDefault();
      panel.focus();
      return;
    }

    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement;

    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }
}
