import { HttpErrorResponse } from '@angular/common/http';
import {
  TransactionStatus,
} from '../../shared/util/status';
import { Tagihan } from '../tagihan/tagihan.model';
import { Transaksi } from '../transaksi/transaksi.model';
import { ReceiptData, ReceiptEligibility } from './receipt.model';

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  qris: 'QRIS',
};

const RECEIPT_TZ = 'Asia/Jakarta';
const receiptDateFormatter = new Intl.DateTimeFormat('id-ID', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
  timeZone: RECEIPT_TZ,
});
const receiptTimeFormatter = new Intl.DateTimeFormat('id-ID', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  timeZone: RECEIPT_TZ,
});

/**
 * Format tanggal & waktu resmi dalam WIB, mis. "05 Juli 2025, 08.00 WIB".
 * Mengembalikan string kosong bila nilai tidak valid agar tidak muncul
 * "undefined"/"null" pada dokumen.
 */
export function formatReceiptDate(value: string | null | undefined): string {
  if (!value) {
    return '';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  const time = receiptTimeFormatter.format(date).replace(':', '.');
  return `${receiptDateFormatter.format(date)}, ${time} WIB`;
}

export function evaluateReceiptEligibility(
  transaksi: Transaksi,
  tagihan: Tagihan,
): ReceiptEligibility {
  if (transaksi.transaction_status !== 'SETTLEMENT') {
    return {
      eligible: false,
      reason: notSettledReason(transaksi.transaction_status),
    };
  }

  if (tagihan.status !== 'LUNAS') {
    return {
      eligible: false,
      reason:
        'Status transaksi sudah lunas, tetapi status tagihan belum LUNAS. ' +
        'Struk tidak dapat diterbitkan sampai data konsisten. Hubungi administrator.',
    };
  }

  return { eligible: true };
}

function notSettledReason(status: TransactionStatus): string {
  switch (status) {
    case 'PENDING':
      return 'Transaksi masih menunggu pembayaran. Struk hanya tersedia setelah pembayaran dikonfirmasi.';
    case 'EXPIRE':
      return 'Transaksi sudah kedaluwarsa. Struk pembayaran tidak dapat diterbitkan.';
    case 'CANCEL':
      return 'Transaksi dibatalkan. Struk pembayaran tidak dapat diterbitkan.';
    default:
      return 'Transaksi belum berstatus lunas. Struk pembayaran tidak dapat diterbitkan.';
  }
}

export function buildReceiptData(
  transaksi: Transaksi,
  tagihan: Tagihan,
  now: Date = new Date(),
): ReceiptData {
  return {
    orderId: transaksi.order_id,
    transactionStatus: transaksi.transaction_status,
    paymentTime:
      transaksi.settlement_time ??
      transaksi.paid_at ??
      transaksi.transaction_time ??
      null,
    paymentMethod: formatPaymentMethod(transaksi.payment_type),
    paidAmount: toNumber(transaksi.gross_amount),
    billAmount: tagihan.nominal != null ? toNumber(tagihan.nominal) : null,
    studentName: tagihan.nama ?? transaksi.nama ?? null,
    studentNisn: tagihan.nisn ?? transaksi.nisn ?? null,
    studentClass: classLabel(tagihan),
    periodMonth: tagihan.bulan ?? transaksi.bulan ?? null,
    periodYear: tagihan.tahun ?? transaksi.tahun ?? null,
    academicYear: tagihan.tahun_ajaran ?? null,
    semester: semesterLabel(tagihan.semester),
    description: tagihan.keterangan ?? null,
    generatedAt: now.toISOString(),
  };
}

export function receiptFileName(orderId: string): string {
  const serial = String(orderId ?? '')
    .replace(/^SPP-/, '')
    .replace(/[^A-Za-z0-9._-]/g, '');
  const safe = serial.length > 0 ? serial : 'transaksi';
  return `struk-SPP-${safe}.pdf`;
}

export function mapReceiptFetchError(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 401) {
      return 'Sesi Anda berakhir. Silakan masuk kembali untuk mengunduh struk.';
    }
    if (error.status === 403) {
      return 'Anda tidak memiliki akses ke transaksi ini.';
    }
    if (error.status === 404) {
      return 'Transaksi atau tagihan terkait tidak ditemukan.';
    }
  }
  return 'Data transaksi tidak dapat dimuat untuk membuat struk.';
}

export function formatPaymentMethod(
  method: string | null | undefined,
): string | null {
  if (!method) {
    return null;
  }
  return PAYMENT_METHOD_LABELS[method.toLowerCase()] ?? method;
}

function classLabel(tagihan: Tagihan): string | null {
  if (tagihan.tingkat && tagihan.jurusan) {
    return `${tagihan.tingkat} ${tagihan.jurusan}`;
  }
  return null;
}

function semesterLabel(semester: string | null | undefined): string | null {
  if (semester === 'GANJIL') {
    return 'Ganjil';
  }
  if (semester === 'GENAP') {
    return 'Genap';
  }
  return null;
}

function toNumber(value: number | string | null | undefined): number {
  const numeric = typeof value === 'string' ? Number(value) : value;
  return typeof numeric === 'number' && Number.isFinite(numeric) ? numeric : 0;
}
