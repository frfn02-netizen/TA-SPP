import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { apiErrorMessage } from '../../core/http/http-error.util';
import { ReceiptService } from '../../core/receipt/receipt.service';
import { Transaksi } from '../../core/transaksi/transaksi.model';
import { TransaksiService } from '../../core/transaksi/transaksi.service';
import { formatDate, formatDateTime, formatRupiahFrom } from '../../shared/util/format';
import {
  TransactionStatus,
  transactionStatusLabel,
  transactionStatusTone,
} from '../../shared/util/status';
import { AppIcon } from '../../shared/ui/app-icon/app-icon';
import { InlineAlert } from '../../shared/ui/inline-alert/inline-alert';
import { Modal } from '../../shared/ui/modal/modal';
import { PageHeader } from '../../shared/ui/page-header/page-header';
import { StatePanel } from '../../shared/ui/state-panel/state-panel';
import { StatusBadge } from '../../shared/ui/status-badge/status-badge';
import { TableSkeleton } from '../../shared/ui/table-skeleton/table-skeleton';

type StatusFilter = 'ALL' | TransactionStatus;

const MONTHS = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

@Component({
  selector: 'app-transaksi-page',
  imports: [
    PageHeader,
    TableSkeleton,
    StatePanel,
    Modal,
    InlineAlert,
    StatusBadge,
    AppIcon,
  ],
  templateUrl: './transaksi-page.html',
})
export class TransaksiPage {
  private readonly transaksiService = inject(TransaksiService);
  private readonly receiptService = inject(ReceiptService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly listState = signal<Transaksi[]>([]);
  private readonly loadingState = signal(true);
  private readonly errorState = signal<string | null>(null);
  private readonly statusFilterState = signal<StatusFilter>('ALL');
  private readonly searchState = signal('');

  readonly list = this.listState.asReadonly();
  readonly loading = this.loadingState.asReadonly();
  readonly error = this.errorState.asReadonly();
  readonly statusFilter = this.statusFilterState.asReadonly();
  readonly search = this.searchState.asReadonly();

  readonly detailOpen = signal(false);
  readonly detailLoading = signal(false);
  readonly detailError = signal<string | null>(null);
  readonly detail = signal<Transaksi | null>(null);
  readonly detailRow = signal<Transaksi | null>(null);

  private readonly downloadingState = signal<number | null>(null);
  private readonly receiptNoticeState = signal<
    { tone: 'success' | 'error'; message: string } | null
  >(null);

  readonly downloading = this.downloadingState.asReadonly();
  readonly receiptNotice = this.receiptNoticeState.asReadonly();

  readonly filtered = computed(() => {
    const status = this.statusFilterState();
    const term = this.searchState().trim().toLowerCase();

    return this.listState().filter((item) => {
      if (status !== 'ALL' && item.transaction_status !== status) {
        return false;
      }
      if (!term) {
        return true;
      }
      return (
        item.order_id.toLowerCase().includes(term) ||
        (item.nama ?? '').toLowerCase().includes(term) ||
        (item.nisn ?? '').toLowerCase().includes(term)
      );
    });
  });

  readonly hasActiveFilter = computed(
    () => this.statusFilterState() !== 'ALL' || this.searchState().trim().length > 0,
  );

  protected readonly formatRupiah = formatRupiahFrom;
  protected readonly formatDate = formatDate;
  protected readonly formatDateTime = formatDateTime;
  protected readonly statusLabel = transactionStatusLabel;
  protected readonly statusTone = transactionStatusTone;

  constructor() {
    this.load();
  }

  monthLabel(bulan: number | undefined): string {
    if (!bulan) {
      return '-';
    }
    return MONTHS[bulan - 1] ?? '-';
  }

  load(): void {
    this.loadingState.set(true);
    this.errorState.set(null);

    this.transaksiService
      .getList()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (list) => {
          this.listState.set(list);
          this.loadingState.set(false);
        },
        error: (error: unknown) => {
          this.listState.set([]);
          this.errorState.set(
            apiErrorMessage(error, 'Data transaksi tidak dapat dimuat.'),
          );
          this.loadingState.set(false);
        },
      });
  }

  onSearch(event: Event): void {
    this.searchState.set((event.target as HTMLInputElement).value);
  }

  onStatusFilter(event: Event): void {
    this.statusFilterState.set(
      (event.target as HTMLSelectElement).value as StatusFilter,
    );
  }

  clearFilters(): void {
    this.statusFilterState.set('ALL');
    this.searchState.set('');
  }

  openDetail(item: Transaksi): void {
    this.detailRow.set(item);
    this.detail.set(null);
    this.detailError.set(null);
    this.detailLoading.set(true);
    this.detailOpen.set(true);
    this.fetchDetail(item.id);
  }

  retryDetail(): void {
    const row = this.detailRow();
    if (!row) {
      return;
    }
    this.detailError.set(null);
    this.detailLoading.set(true);
    this.fetchDetail(row.id);
  }

  closeDetail(): void {
    this.detailOpen.set(false);
  }

  canDownload(item: Transaksi): boolean {
    return item.transaction_status === 'SETTLEMENT';
  }

  downloadReceipt(item: Transaksi): void {
    if (this.downloadingState() !== null) {
      return;
    }

    this.receiptNoticeState.set(null);
    this.downloadingState.set(item.id);

    this.receiptService
      .generate(item.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((outcome) => {
        this.downloadingState.set(null);

        if (outcome.status === 'ok') {
          this.receiptService.download({
            blob: outcome.blob,
            fileName: outcome.fileName,
          });
          this.receiptNoticeState.set({
            tone: 'success',
            message: 'Struk PDF berhasil dibuat dan diunduh.',
          });
        } else if (outcome.status === 'ineligible') {
          this.receiptNoticeState.set({
            tone: 'error',
            message: outcome.reason,
          });
        } else {
          this.receiptNoticeState.set({
            tone: 'error',
            message: outcome.message,
          });
        }
      });
  }

  dismissReceiptNotice(): void {
    this.receiptNoticeState.set(null);
  }

  private fetchDetail(id: number): void {
    this.transaksiService
      .getById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (transaksi) => {
          this.detail.set(transaksi);
          this.detailLoading.set(false);
        },
        error: (error: unknown) => {
          this.detail.set(null);
          this.detailError.set(
            apiErrorMessage(error, 'Detail transaksi tidak dapat dimuat.'),
          );
          this.detailLoading.set(false);
        },
      });
  }
}
