import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { apiErrorMessage } from '../../core/http/http-error.util';
import { Tagihan } from '../../core/tagihan/tagihan.model';
import { TagihanService } from '../../core/tagihan/tagihan.service';
import { formatDate, formatRupiahFrom } from '../../shared/util/format';
import { periodLabel } from '../../shared/util/months';
import {
  BillStatus,
  billStatusLabel,
  billStatusTone,
} from '../../shared/util/status';
import { AppIcon } from '../../shared/ui/app-icon/app-icon';
import { PageHeader } from '../../shared/ui/page-header/page-header';
import { StatePanel } from '../../shared/ui/state-panel/state-panel';
import { StatusBadge } from '../../shared/ui/status-badge/status-badge';
import { TableSkeleton } from '../../shared/ui/table-skeleton/table-skeleton';

type StatusFilter = 'ALL' | BillStatus;

@Component({
  selector: 'app-student-tagihan-page',
  imports: [
    RouterLink,
    PageHeader,
    TableSkeleton,
    StatePanel,
    StatusBadge,
    AppIcon,
  ],
  templateUrl: './student-tagihan-page.html',
})
export class StudentTagihanPage {
  private readonly tagihanService = inject(TagihanService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly tagihanState = signal<Tagihan[]>([]);
  private readonly loadingState = signal(true);
  private readonly errorState = signal<string | null>(null);
  private readonly filterState = signal<StatusFilter>('ALL');

  readonly tagihan = this.tagihanState.asReadonly();
  readonly loading = this.loadingState.asReadonly();
  readonly error = this.errorState.asReadonly();
  readonly filter = this.filterState.asReadonly();

  readonly filters: Array<{ value: StatusFilter; label: string }> = [
    { value: 'ALL', label: 'Semua' },
    { value: 'BELUM_LUNAS', label: 'Belum Lunas' },
    { value: 'LUNAS', label: 'Lunas' },
  ];

  readonly filtered = computed(() => {
    const filter = this.filterState();
    if (filter === 'ALL') {
      return this.tagihanState();
    }
    return this.tagihanState().filter((item) => item.status === filter);
  });

  protected readonly formatRupiah = formatRupiahFrom;
  protected readonly formatDate = formatDate;
  protected readonly periodLabel = periodLabel;
  protected readonly statusLabel = billStatusLabel;
  protected readonly statusTone = billStatusTone;

  constructor() {
    this.load();
  }

  load(): void {
    this.loadingState.set(true);
    this.errorState.set(null);

    this.tagihanService
      .getList()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (list) => {
          this.tagihanState.set(list);
          this.loadingState.set(false);
        },
        error: (error: unknown) => {
          this.tagihanState.set([]);
          this.errorState.set(
            apiErrorMessage(error, 'Data tagihan tidak dapat dimuat.'),
          );
          this.loadingState.set(false);
        },
      });
  }

  setFilter(value: StatusFilter): void {
    this.filterState.set(value);
  }

  semesterLabel(semester: string | null | undefined): string {
    if (semester === 'GANJIL') {
      return 'Ganjil';
    }
    if (semester === 'GENAP') {
      return 'Genap';
    }
    return '-';
  }
}
