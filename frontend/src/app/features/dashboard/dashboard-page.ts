import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DashboardStats } from '../../core/dashboard/dashboard.model';
import { DashboardService } from '../../core/dashboard/dashboard.service';
import { apiErrorMessage } from '../../core/http/http-error.util';
import { formatNumber, formatRupiah } from '../../shared/util/format';
import { AppIcon } from '../../shared/ui/app-icon/app-icon';
import { PageHeader } from '../../shared/ui/page-header/page-header';
import { StatCard } from '../../shared/ui/stat-card/stat-card';
import { StatePanel } from '../../shared/ui/state-panel/state-panel';

@Component({
  selector: 'app-dashboard-page',
  imports: [PageHeader, StatCard, StatePanel, AppIcon],
  templateUrl: './dashboard-page.html',
})
export class DashboardPage {
  private readonly dashboardService = inject(DashboardService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly statsState = signal<DashboardStats | null>(null);
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
    if (!this.statsState() || this.statsState()?.totalTagihan === 0) {
      return 0;
    }
    return 100 - this.paidPercent();
  });

  readonly hasBills = computed(() => (this.statsState()?.totalTagihan ?? 0) > 0);

  protected readonly formatNumber = formatNumber;
  protected readonly formatRupiah = formatRupiah;

  constructor() {
    this.load();
  }

  load(): void {
    this.loadingState.set(true);
    this.errorState.set(null);

    this.dashboardService
      .getStats()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (stats) => {
          this.statsState.set(stats);
          this.loadingState.set(false);
        },
        error: (error: unknown) => {
          this.statsState.set(null);
          this.errorState.set(
            apiErrorMessage(error, 'Data dashboard tidak dapat dimuat.'),
          );
          this.loadingState.set(false);
        },
      });
  }
}
