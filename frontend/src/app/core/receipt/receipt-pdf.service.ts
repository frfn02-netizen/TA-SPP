import { Injectable } from '@angular/core';
import { formatRupiah } from '../../shared/util/format';
import { monthLabel } from '../../shared/util/months';
import { ReceiptData, ReceiptFile } from './receipt.model';
import { formatReceiptDate, receiptFileName } from './receipt.util';

type Rgb = [number, number, number];

const PAGE_WIDTH = 148;
const PAGE_HEIGHT = 210;
const MARGIN = 14;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

const NAVY: Rgb = [20, 33, 61];
const GREEN: Rgb = [21, 154, 108];
const INK900: Rgb = [23, 32, 51];
const INK600: Rgb = [102, 112, 133];
const LINE: Rgb = [210, 214, 221];

const LOGO_URL = '/assets/20240801_22b21235a01107b.webp';
const LOGO_ALIAS = 'school-logo';

interface LogoImage {
  dataUrl: string;
  width: number;
  height: number;
}

async function toDrawable(
  blob: Blob,
): Promise<{ source: CanvasImageSource; width: number; height: number }> {
  if (typeof createImageBitmap === 'function') {
    const bitmap = await createImageBitmap(blob);
    return { source: bitmap, width: bitmap.width, height: bitmap.height };
  }

  const url = URL.createObjectURL(blob);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('image load failed'));
      img.src = url;
    });
    return {
      source: image,
      width: image.naturalWidth,
      height: image.naturalHeight,
    };
  } finally {
    URL.revokeObjectURL(url);
  }
}

/**
 * Memuat logo sekolah (WebP) dan mengonversinya ke PNG di frontend,
 * karena jsPDF tidak mendukung WebP secara langsung. Best-effort:
 * bila gagal, dokumen tetap dibuat tanpa logo (tidak pernah error).
 */
async function loadLogoPng(): Promise<LogoImage | null> {
  try {
    const response = await fetch(LOGO_URL);
    if (!response.ok) {
      return null;
    }
    const blob = await response.blob();
    const { source, width, height } = await toDrawable(blob);
    if (!width || !height) {
      return null;
    }

    const canvas = document.createElement('canvas');
    // Turunkan resolusi agar PDF tetap ringan; logo dicetak hanya ~18mm.
    const maxPixels = 320;
    const scale = Math.min(1, maxPixels / Math.max(width, height));
    const canvasWidth = Math.max(1, Math.round(width * scale));
    const canvasHeight = Math.max(1, Math.round(height * scale));
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const context = canvas.getContext('2d');
    if (!context) {
      return null;
    }
    context.drawImage(source, 0, 0, canvasWidth, canvasHeight);

    return { dataUrl: canvas.toDataURL('image/png'), width, height };
  } catch {
    return null;
  }
}

@Injectable({ providedIn: 'root' })
export class ReceiptPdfService {
  async buildPdf(data: ReceiptData): Promise<ReceiptFile> {
    // Dimuat saat dibutuhkan agar halaman riwayat/transaksi tidak
    // ikut mengunduh jsPDF (beserta html2canvas/canvg) di muka.
    const { jsPDF } = await import('jspdf');

    const logo = await loadLogoPng();
    const doc = new jsPDF({ unit: 'mm', format: 'a5' });

    const font = (style: 'normal' | 'bold', size: number, color: Rgb): void => {
      // Times (base-14 PDF, metric-compatible dengan Times New Roman).
      doc.setFont('times', style);
      doc.setFontSize(size);
      doc.setTextColor(color[0], color[1], color[2]);
    };

    const rule = (
      atY: number,
      width = 0.25,
      color: Rgb = LINE,
      x = MARGIN,
    ): void => {
      doc.setDrawColor(color[0], color[1], color[2]);
      doc.setLineWidth(width);
      doc.line(x, atY, PAGE_WIDTH - x, atY);
    };

    const pair = (
      label: string,
      value: string | null | undefined,
      rowY: number,
      valueColor: Rgb = INK900,
      size = 9.5,
    ): number => {
      if (value == null || value === '') {
        return rowY;
      }
      const labelWidth = 42;
      const valueWidth = CONTENT_WIDTH - labelWidth;
      font('normal', size, INK600);
      doc.text(label, MARGIN, rowY);
      doc.text(':', MARGIN + labelWidth - 3, rowY);
      font('bold', size, valueColor);
      const lines = doc.splitTextToSize(String(value), valueWidth) as string[];
      doc.text(lines, MARGIN + labelWidth, rowY);
      const lineHeight = size * 0.52;
      return rowY + Math.max(6.4, lines.length * lineHeight + 2);
    };

    // Satu struk penuh, ditempatkan di bagian atas halaman.
    const drawReceipt = (): void => {
      const base = 14;
      const centerX = PAGE_WIDTH / 2;

      if (logo) {
        const box = 18;
        const ratio = logo.width / logo.height;
        const logoWidth = ratio >= 1 ? box : box * ratio;
        const logoHeight = ratio >= 1 ? box / ratio : box;
        try {
          doc.addImage(
            logo.dataUrl,
            'PNG',
            MARGIN,
            base,
            logoWidth,
            logoHeight,
            LOGO_ALIAS,
          );
        } catch {
          // Abaikan; header tetap valid tanpa logo.
        }
      }

      // Header: teks dipusatkan terhadap halaman, logo independen di kiri.
      font('bold', 13, NAVY);
      doc.text('BUKTI PEMBAYARAN SPP', centerX, base + 7, { align: 'center' });
      font('normal', 8.5, INK600);
      doc.text('SISTEM ADMINISTRASI PEMBAYARAN SPP', centerX, base + 13, {
        align: 'center',
      });
      font('bold', 10, NAVY);
      doc.text('SMK NEGERI 1 DLANGGU', centerX, base + 19.5, {
        align: 'center',
      });

      rule(base + 26, 0.6, NAVY);

      let ly = base + 33;
      ly = pair('Nama Siswa', data.studentName, ly);
      ly = pair('NISN', data.studentNisn, ly);
      ly = pair('Kelas', data.studentClass, ly);
      ly = pair('ID Transaksi', data.orderId, ly);
      ly = pair(
        'Tanggal Pembayaran',
        data.paymentTime ? formatReceiptDate(data.paymentTime) : null,
        ly,
      );
      ly = pair('Metode Pembayaran', data.paymentMethod, ly);
      ly = pair(
        'Periode',
        data.periodMonth && data.periodYear
          ? `${monthLabel(data.periodMonth)} ${data.periodYear}`
          : null,
        ly,
      );
      if (data.description) {
        ly = pair('Keterangan', data.description, ly);
      }
      ly = pair(
        'Nominal Pembayaran',
        formatRupiah(data.paidAmount),
        ly,
        INK900,
        12,
      );
      ly = pair('Status Pembayaran', 'LUNAS', ly, GREEN, 10);

      const footerTop = Math.max(base + 104, ly + 6);
      rule(footerTop, 0.3, LINE);
      font('normal', 7.5, INK600);
      doc.text(
        doc.splitTextToSize(
          'Dokumen bukti pembayaran SPP yang diterbitkan oleh sistem administrasi pembayaran SPP QRIS.',
          CONTENT_WIDTH,
        ),
        MARGIN,
        footerTop + 5,
      );
      doc.text(
        `Tanggal cetak: ${formatReceiptDate(data.generatedAt)}`,
        MARGIN,
        footerTop + 10,
      );
    };

    // Satu struk saja (tanpa salinan kedua, tanpa garis potong).
    drawReceipt();

    return {
      blob: doc.output('blob'),
      fileName: receiptFileName(data.orderId),
    };
  }
}
