import { TestBed } from '@angular/core/testing';
import { ReceiptData } from './receipt.model';
import { ReceiptPdfService } from './receipt-pdf.service';

function makeData(overrides: Partial<ReceiptData> = {}): ReceiptData {
  return {
    orderId: 'SPP-20250910-ABCDEF',
    transactionStatus: 'SETTLEMENT',
    paymentTime: '2025-09-10T08:05:00.000Z',
    paymentMethod: 'QRIS',
    paidAmount: 150000,
    billAmount: 150000,
    studentName: 'Budi Santoso',
    studentNisn: '1234567890',
    studentClass: 'X RPL',
    periodMonth: 9,
    periodYear: 2025,
    academicYear: '2025/2026',
    semester: 'Ganjil',
    description: 'SPP September',
    generatedAt: '2025-10-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('ReceiptPdfService', () => {
  let service: ReceiptPdfService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReceiptPdfService);
  });

  it('produces a PDF blob with a safe file name', async () => {
    const file = await service.buildPdf(makeData());

    expect(file.fileName).toBe('struk-SPP-20250910-ABCDEF.pdf');
    expect(file.blob.size).toBeGreaterThan(0);

    const buffer = await file.blob.arrayBuffer();
    const head = new TextDecoder().decode(buffer.slice(0, 5));
    expect(head).toBe('%PDF-');
  });

  it('does not throw when optional fields are absent', async () => {
    const file = await service.buildPdf(
      makeData({
        paymentTime: null,
        paymentMethod: null,
        billAmount: null,
        studentName: null,
        studentNisn: null,
        studentClass: null,
        periodMonth: null,
        periodYear: null,
        academicYear: null,
        semester: null,
        description: null,
      }),
    );

    expect(file.blob.size).toBeGreaterThan(0);
  });

  it('renders a single receipt on one A5 portrait page', async () => {
    const file = await service.buildPdf(makeData());
    const source = new TextDecoder().decode(await file.blob.arrayBuffer());

    const pages = source.match(/\/Type\s*\/Page\b/g) ?? [];
    expect(pages.length).toBe(1);

    const titles = source.match(/BUKTI PEMBAYARAN SPP/g) ?? [];
    expect(titles.length).toBe(1);

    const mediaBox = source.match(
      /\/MediaBox\s*\[\s*0\s+0\s+([\d.]+)\s+([\d.]+)\s*\]/,
    );
    expect(mediaBox).not.toBeNull();
    if (mediaBox) {
      const width = Number(mediaBox[1]);
      const height = Number(mediaBox[2]);
      // A5 portrait sekitar 419.53 x 595.28 pt.
      expect(width).toBeGreaterThan(410);
      expect(width).toBeLessThan(430);
      expect(height).toBeGreaterThan(580);
      expect(height).toBeLessThan(610);
    }
  });
});
