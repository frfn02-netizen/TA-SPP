import { Injectable, inject } from '@angular/core';
import { Observable, catchError, from, map, of, switchMap } from 'rxjs';
import { Tagihan } from '../tagihan/tagihan.model';
import { TagihanService } from '../tagihan/tagihan.service';
import { Transaksi } from '../transaksi/transaksi.model';
import { TransaksiService } from '../transaksi/transaksi.service';
import { ReceiptFile, ReceiptOutcome } from './receipt.model';
import { ReceiptPdfService } from './receipt-pdf.service';
import {
  buildReceiptData,
  evaluateReceiptEligibility,
  mapReceiptFetchError,
} from './receipt.util';

@Injectable({ providedIn: 'root' })
export class ReceiptService {
  private readonly tagihanService = inject(TagihanService);
  private readonly transaksiService = inject(TransaksiService);
  private readonly pdfService = inject(ReceiptPdfService);

  /**
   * Mengambil transaksi terbaru (owner-scoped di backend), tagihan terkait,
   * memvalidasi status, lalu menyusun PDF. Tidak pernah melempar error;
   * kegagalan dikembalikan sebagai outcome bertipe.
   */
  generate(transaksiId: number): Observable<ReceiptOutcome> {
    return this.transaksiService.getById(transaksiId).pipe(
      switchMap((transaksi) => this.buildFromTransaksi(transaksi)),
      catchError((error) =>
        of<ReceiptOutcome>({
          status: 'error',
          message: mapReceiptFetchError(error),
        }),
      ),
    );
  }

  download(file: ReceiptFile): void {
    const url = URL.createObjectURL(file.blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = file.fileName;
    anchor.rel = 'noopener';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  private buildFromTransaksi(transaksi: Transaksi): Observable<ReceiptOutcome> {
    return this.tagihanService.getById(transaksi.tagihan_id).pipe(
      switchMap((tagihan) => this.buildOutcome(transaksi, tagihan)),
      catchError((error) =>
        of<ReceiptOutcome>({
          status: 'error',
          message: mapReceiptFetchError(error),
        }),
      ),
    );
  }

  private buildOutcome(
    transaksi: Transaksi,
    tagihan: Tagihan,
  ): Observable<ReceiptOutcome> {
    const eligibility = evaluateReceiptEligibility(transaksi, tagihan);
    if (!eligibility.eligible) {
      return of<ReceiptOutcome>({
        status: 'ineligible',
        reason: eligibility.reason,
      });
    }

    return from(
      this.pdfService.buildPdf(buildReceiptData(transaksi, tagihan)),
    ).pipe(
      map(
        (file): ReceiptOutcome => ({
          status: 'ok',
          blob: file.blob,
          fileName: file.fileName,
        }),
      ),
      catchError(() =>
        of<ReceiptOutcome>({
          status: 'error',
          message: 'Struk PDF tidak dapat dibuat. Silakan coba lagi.',
        }),
      ),
    );
  }
}
