import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { apiErrorMessage } from '../../core/http/http-error.util';
import { Tagihan } from '../../core/tagihan/tagihan.model';
import { TagihanService } from '../../core/tagihan/tagihan.service';
import { Transaksi } from '../../core/transaksi/transaksi.model';
import { TransaksiService } from '../../core/transaksi/transaksi.service';
import { formatDate, formatDateTime, formatRupiahFrom } from '../../shared/util/format';
import { periodLabel } from '../../shared/util/months';
import {
  transactionStatusLabel,
  transactionStatusTone,
} from '../../shared/util/status';
import { AppIcon } from '../../shared/ui/app-icon/app-icon';
import { PageHeader } from '../../shared/ui/page-header/page-header';
import { StatCard } from '../../shared/ui/stat-card/stat-card';
import { StatePanel } from '../../shared/ui/state-panel/state-panel';
import { StatusBadge } from '../../shared/ui/status-badge/status-badge';

interface StudentProfile {
  nama: string | null;
  tingkat: string | null;
  jurusan: string | null;
}

@Component({
  selector: 'app-student-dashboard-page',
  imports: [
    RouterLink,
    PageHeader,
    StatCard,
    StatePanel,
    StatusBadge,
    AppIcon,
  ],
  templateUrl: './student-dashboard-page.html',
})
export class StudentDashboardPage {
  private readonly tagihanService = inject(TagihanService);
  private readonly transaksiService = inject(TransaksiService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly tagihanState = signal<Tagihan[]>([]);
  private readonly transaksiState = signal<Transaksi[]>([]);
  private readonly profileState = signal<StudentProfile | null>(null);
  private readonly loadingState = signal(true);
  private readonly errorState = signal<string | null>(null);

  readonly tagihan = this.tagihanState.asReadonly();
  readonly transaksi = this.transaksiState.asReadonly();
  readonly loading = this.loadingState.asReadonly();
  readonly error = this.errorState.asReadonly();

  readonly unpaid = computed(() =>
    this.tagihanState().filter((item) => item.status === 'BELUM_LUNAS'),
  );
  readonly paidCount = computed(
    () => this.tagihanState().filter((item) => item.status === 'LUNAS').length,
  );
  readonly unpaidTotal = computed(() =>
    this.unpaid().reduce((sum, item) => sum + Number(item.nominal ?? 0), 0),
  );
  readonly upcomingUnpaid = computed(() =>
    [...this.unpaid()]
      .sort((a, b) => this.dueTime(a) - this.dueTime(b))
      .slice(0, 3),
  );
  readonly recentTransactions = computed(() => this.transaksiState().slice(0, 3));
  readonly hasBills = computed(() => this.tagihanState().length > 0);
  readonly hasAnyData = computed(
    () => this.tagihanState().length > 0 || this.transaksiState().length > 0,
  );

  readonly name = computed(() => this.profileState()?.nama ?? null);
  readonly greeting = computed(() =>
    this.name() ? `Halo, ${this.name()}` : 'Selamat datang',
  );
  readonly className = computed(() => {
    const profile = this.profileState();
    if (!profile?.tingkat || !profile?.jurusan) {
      return null;
    }
    return `${profile.tingkat} ${profile.jurusan}`;
  });
  readonly description = computed(() =>
    this.className()
      ? `Kelas ${this.className()} · Ringkasan tagihan dan pembayaran SPP Anda.`
      : 'Ringkasan tagihan dan pembayaran SPP Anda.',
  );

  protected readonly formatRupiah = formatRupiahFrom;
  protected readonly formatDate = formatDate;
  protected readonly formatDateTime = formatDateTime;
  protected readonly periodLabel = periodLabel;
  protected readonly transactionLabel = transactionStatusLabel;
  protected readonly transactionTone = transactionStatusTone;

  constructor() {
    this.load();
  }

  load(): void {
    this.loadingState.set(true);
    this.errorState.set(null);

    forkJoin({
      tagihan: this.tagihanService.getList(),
      transaksi: this.transaksiService.getList(),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ tagihan, transaksi }) => {
          this.tagihanState.set(tagihan);
          this.transaksiState.set(transaksi);
          this.loadingState.set(false);
          this.loadProfile(tagihan);
        },
        error: (error: unknown) => {
          this.tagihanState.set([]);
          this.transaksiState.set([]);
          this.errorState.set(
            apiErrorMessage(error, 'Data tagihan tidak dapat dimuat.'),
          );
          this.loadingState.set(false);
        },
      });
  }

  private loadProfile(tagihan: Tagihan[]): void {
    const first = tagihan[0];
    if (!first) {
      this.profileState.set(null);
      return;
    }

    this.tagihanService
      .getById(first.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (detail) =>
          this.profileState.set({
            nama: detail.nama ?? null,
            tingkat: detail.tingkat ?? null,
            jurusan: detail.jurusan ?? null,
          }),
        error: () => this.profileState.set(null),
      });
  }

  private dueTime(item: Tagihan): number {
    if (!item.jatuh_tempo) {
      return Number.POSITIVE_INFINITY;
    }
    const time = new Date(item.jatuh_tempo).getTime();
    return Number.isNaN(time) ? Number.POSITIVE_INFINITY : time;
  }
}
