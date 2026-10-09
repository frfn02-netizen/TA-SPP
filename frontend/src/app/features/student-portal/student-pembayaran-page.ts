import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { apiErrorMessage } from '../../core/http/http-error.util';
import { isTrustedMidtransUrl } from '../../core/transaksi/midtrans-url.util';
import { TransaksiService } from '../../core/transaksi/transaksi.service';
import { Tagihan } from '../../core/tagihan/tagihan.model';
import { TagihanService } from '../../core/tagihan/tagihan.service';
import { formatDate, formatRupiahFrom } from '../../shared/util/format';
import { periodLabel } from '../../shared/util/months';
import { billStatusLabel, billStatusTone } from '../../shared/util/status';
import { AppIcon } from '../../shared/ui/app-icon/app-icon';
import { InlineAlert } from '../../shared/ui/inline-alert/inline-alert';
import { PageHeader } from '../../shared/ui/page-header/page-header';
import { StatePanel } from '../../shared/ui/state-panel/state-panel';
import { StatusBadge } from '../../shared/ui/status-badge/status-badge';

@Component({
  selector: 'app-student-pembayaran-page',
  imports: [
    RouterLink,
    PageHeader,
    StatePanel,
    StatusBadge,
    InlineAlert,
    AppIcon,
  ],
  templateUrl: './student-pembayaran-page.html',
})
export class StudentPembayaranPage {
  private readonly route = inject(ActivatedRoute);
  private readonly tagihanService = inject(TagihanService);
  private readonly transaksiService = inject(TransaksiService);
  private readonly destroyRef = inject(DestroyRef);

  readonly tagihanId = Number(this.route.snapshot.paramMap.get('tagihanId'));

  private readonly tagihanState = signal<Tagihan | null>(null);
  private readonly loadingState = signal(true);
  private readonly errorState = signal<string | null>(null);
  private readonly submittingState = signal(false);
  private readonly payErrorState = signal<string | null>(null);
  private readonly noticeState = signal<string | null>(null);

  readonly tagihan = this.tagihanState.asReadonly();
  readonly loading = this.loadingState.asReadonly();
  readonly error = this.errorState.asReadonly();
  readonly submitting = this.submittingState.asReadonly();
  readonly payError = this.payErrorState.asReadonly();
  readonly notice = this.noticeState.asReadonly();

  readonly isPayable = computed(
    () => this.tagihanState()?.status === 'BELUM_LUNAS',
  );

  protected readonly formatRupiah = formatRupiahFrom;
  protected readonly formatDate = formatDate;
  protected readonly periodLabel = periodLabel;
  protected readonly statusLabel = billStatusLabel;
  protected readonly statusTone = billStatusTone;

  constructor() {
    if (!Number.isInteger(this.tagihanId) || this.tagihanId <= 0) {
      this.loadingState.set(false);
      this.errorState.set('Tagihan yang diminta tidak ditemukan.');
      return;
    }
    this.load();
  }

  load(): void {
    this.loadingState.set(true);
    this.errorState.set(null);

    this.tagihanService
      .getById(this.tagihanId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (tagihan) => {
          this.tagihanState.set(tagihan);
          this.loadingState.set(false);
        },
        error: (error: unknown) => {
          this.tagihanState.set(null);
          this.errorState.set(
            apiErrorMessage(error, 'Data tagihan tidak dapat dimuat.'),
          );
          this.loadingState.set(false);
        },
      });
  }

  continuePayment(): void {
    const tagihan = this.tagihanState();
    if (!tagihan || this.submittingState()) {
      return;
    }

    if (tagihan.status !== 'BELUM_LUNAS') {
      this.payErrorState.set('Tagihan ini sudah lunas dan tidak dapat dibayar lagi.');
      return;
    }

    this.submittingState.set(true);
    this.payErrorState.set(null);
    this.noticeState.set(null);

    this.transaksiService
      .create({ tagihanId: tagihan.id })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.submittingState.set(false);

          if (!isTrustedMidtransUrl(result.paymentUrl)) {
            this.payErrorState.set(
              'URL pembayaran dari server tidak valid, pembayaran dibatalkan demi keamanan.',
            );
            return;
          }

          this.redirect(result.paymentUrl);
        },
        error: (error: unknown) => {
          this.submittingState.set(false);
          this.payErrorState.set(
            apiErrorMessage(
              error,
              'Transaksi pembayaran tidak dapat dibuat. Silakan coba lagi.',
            ),
          );
        },
      });
  }

  checkStatus(): void {
    this.payErrorState.set(null);
    this.noticeState.set(null);

    this.tagihanService
      .getById(this.tagihanId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (tagihan) => {
          this.tagihanState.set(tagihan);
          this.noticeState.set(
            tagihan.status === 'LUNAS'
              ? 'Pembayaran Anda sudah dikonfirmasi. Tagihan ini lunas.'
              : 'Status tagihan belum berubah. Jika Anda baru menyelesaikan pembayaran, tunggu beberapa saat lalu periksa lagi.',
          );
        },
        error: (error: unknown) => {
          this.payErrorState.set(
            apiErrorMessage(error, 'Status tagihan tidak dapat diperiksa.'),
          );
        },
      });
  }

  redirect(url: string): void {
    window.location.assign(url);
  }
}
