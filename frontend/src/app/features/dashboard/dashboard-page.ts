import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';
import { DashboardStats } from '../../core/dashboard/dashboard.model';
import { DashboardService } from '../../core/dashboard/dashboard.service';
import { apiErrorMessage } from '../../core/http/http-error.util';
import { Tagihan } from '../../core/tagihan/tagihan.model';
import { TagihanService } from '../../core/tagihan/tagihan.service';
import { Transaksi } from '../../core/transaksi/transaksi.model';
import { TransaksiService } from '../../core/transaksi/transaksi.service';
import {
  formatDateTime,
  formatNumber,
  formatRupiahFrom,
} from '../../shared/util/format';
import { periodLabel } from '../../shared/util/months';
import {
  billStatusLabel,
  billStatusTone,
  transactionStatusLabel,
  transactionStatusTone,
} from '../../shared/util/status';
import { AppIcon } from '../../shared/ui/app-icon/app-icon';
import { BarChart, BarChartBar } from '../../shared/ui/bar-chart/bar-chart';
import { PageHeader } from '../../shared/ui/page-header/page-header';
import { StatCard } from '../../shared/ui/stat-card/stat-card';
import { StatePanel } from '../../shared/ui/state-panel/state-panel';
import { StatusBadge } from '../../shared/ui/status-badge/status-badge';

const RECENT_LIMIT = 5;

@Component({
  selector: 'app-dashboard-page',
  imports: [
    RouterLink,
    PageHeader,
    StatCard,
    StatePanel,
    StatusBadge,
    BarChart,
    AppIcon,
  ],
  templateUrl: './dashboard-page.html',
})
export class DashboardPage {
  private readonly dashboardService = inject(DashboardService);
  private readonly tagihanService = inject(TagihanService);
  private readonly transaksiService = inject(TransaksiService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly statsState = signal<DashboardStats | null>(null);
  private readonly tagihanState = signal<Tagihan[]>([]);
  private readonly transaksiState = signal<Transaksi[]>([]);
  private readonly loadingState = signal(true);
  private readonly errorState = signal<string | null>(null);

  readonly stats = this.statsState.asReadonly();
  readonly loading = this.loadingState.asReadonly();
  readonly error = this.errorState.asReadonly();

  readonly paidPercent = computed(() => {
    const stats = this.statsState();
    if (!stats || stats.totalTagihan === 0) {
      return 0;
    }
    return Math.round((stats.totalLunas / stats.totalTagihan) * 100);
  });

  readonly outstandingPercent = computed(() => {
    const stats = this.statsState();
    if (!stats || stats.totalTagihan === 0) {
      return 0;
    }
    return Math.round((stats.totalBelumLunas / stats.totalTagihan) * 100);
  });

  readonly hasBills = computed(() => (this.statsState()?.totalTagihan ?? 0) > 0);

  readonly chartBars = computed<BarChartBar[]>(() => {
    const stats = this.statsState();
    return [
      {
        label: 'Lunas',
        value: stats?.totalLunas ?? 0,
        barClass: 'bg-green-600',
      },
      {
        label: 'Belum Lunas',
        value: stats?.totalBelumLunas ?? 0,
        barClass: 'bg-amber-700',
      },
    ];
  });

  readonly chartAriaLabel = computed(() => {
    const stats = this.statsState();
    if (!stats) {
      return 'Diagram batang status tagihan';
    }
    return (
      `Diagram batang status tagihan. Lunas ${stats.totalLunas} dari ` +
      `${stats.totalTagihan} tagihan (${this.paidPercent()} persen). ` +
      `Belum lunas ${stats.totalBelumLunas} dari ${stats.totalTagihan} ` +
      `tagihan (${this.outstandingPercent()} persen).`
    );
  });

  readonly recentBills = computed(() =>
    [...this.tagihanState()]
      .sort((a, b) => this.timeOf(b.created_at) - this.timeOf(a.created_at))
      .slice(0, RECENT_LIMIT),
  );

  readonly recentTransactions = computed(() =>
    this.transaksiState().slice(0, RECENT_LIMIT),
  );

  protected readonly formatNumber = formatNumber;
  protected readonly formatRupiah = formatRupiahFrom;
  protected readonly formatDateTime = formatDateTime;
  protected readonly periodLabel = periodLabel;
  protected readonly billLabel = billStatusLabel;
  protected readonly billTone = billStatusTone;
  protected readonly transactionLabel = transactionStatusLabel;
  protected readonly transactionTone = transactionStatusTone;

  constructor() {
    this.load();
  }

  load(): void {
    this.loadingState.set(true);
    this.errorState.set(null);

    forkJoin({
      stats: this.dashboardService.getStats(),
      tagihan: this.tagihanService
        .getList()
        .pipe(catchError(() => of([] as Tagihan[]))),
      transaksi: this.transaksiService
        .getList()
        .pipe(catchError(() => of([] as Transaksi[]))),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ stats, tagihan, transaksi }) => {
          this.statsState.set(stats);
          this.tagihanState.set(tagihan);
          this.transaksiState.set(transaksi);
          this.loadingState.set(false);
        },
        error: (error: unknown) => {
          this.statsState.set(null);
          this.tagihanState.set([]);
          this.transaksiState.set([]);
          this.errorState.set(
            apiErrorMessage(error, 'Data dashboard tidak dapat dimuat.'),
          );
          this.loadingState.set(false);
        },
      });
  }

  private timeOf(value: string | null | undefined): number {
    if (!value) {
      return 0;
    }
    const time = new Date(value).getTime();
    return Number.isNaN(time) ? 0 : time;
  }
}
