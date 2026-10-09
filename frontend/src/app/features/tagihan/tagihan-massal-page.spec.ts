import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { LUCIDE_ICONS, LucideIconProvider } from 'lucide-angular';
import { Observable, Subject, of, throwError } from 'rxjs';
import { Kelas } from '../../core/kelas/kelas.model';
import { KelasService } from '../../core/kelas/kelas.service';
import {
  BulkGenerateRequest,
  BulkGenerateResult,
  BulkPreviewRequest,
  BulkPreviewResult,
} from '../../core/tagihan/tagihan.model';
import { TagihanService } from '../../core/tagihan/tagihan.service';
import { TahunAjaran } from '../../core/tahun-ajaran/tahun-ajaran.model';
import { TahunAjaranService } from '../../core/tahun-ajaran/tahun-ajaran.service';
import { APP_ICONS } from '../../shared/ui/app-icon/app-icon';
import { TagihanMassalPage } from './tagihan-massal-page';

const kelas: Kelas[] = [
  { id: 1, tingkat: 'X', jurusan: 'RPL', created_at: '', updated_at: '' },
];
const tahunAjaran: TahunAjaran[] = [
  { id: 1, nama: '2025/2026', semester: 'GANJIL', aktif: true },
];

const preview: BulkPreviewResult = {
  periode: { bulan: 9, tahun: 2025 },
  tahunAjaran: { id: 1, nama: '2025/2026', semester: 'GANJIL' },
  target: { scope: 'ALL', kelasId: null },
  nominal: 150000,
  totalTarget: 10,
  willCreate: 8,
  skipped: 2,
  totalNominal: 1200000,
};

const generateResult: BulkGenerateResult = {
  periode: { bulan: 9, tahun: 2025 },
  tahunAjaran: { id: 1, nama: '2025/2026', semester: 'GANJIL' },
  target: { scope: 'ALL', kelasId: null },
  nominal: 150000,
  totalTarget: 10,
  created: 8,
  skipped: 2,
  failed: 0,
  totalNominal: 1200000,
};

interface Setup {
  fixture: ComponentFixture<TagihanMassalPage>;
  previewCalls: BulkPreviewRequest[];
  generateCalls: BulkGenerateRequest[];
}

function setup(overrides: {
  preview?: (input: BulkPreviewRequest) => Observable<BulkPreviewResult>;
  generate?: (input: BulkGenerateRequest) => Observable<BulkGenerateResult>;
} = {}): Setup {
  const previewCalls: BulkPreviewRequest[] = [];
  const generateCalls: BulkGenerateRequest[] = [];

  TestBed.configureTestingModule({
    imports: [TagihanMassalPage],
    providers: [
      provideRouter([]),
      { provide: KelasService, useValue: { getList: () => of(kelas) } },
      {
        provide: TahunAjaranService,
        useValue: { getList: () => of(tahunAjaran) },
      },
      {
        provide: TagihanService,
        useValue: {
          bulkPreview: (input: BulkPreviewRequest) => {
            previewCalls.push(input);
            return overrides.preview ? overrides.preview(input) : of(preview);
          },
          bulkGenerate: (input: BulkGenerateRequest) => {
            generateCalls.push(input);
            return overrides.generate
              ? overrides.generate(input)
              : of(generateResult);
          },
        },
      },
      {
        provide: LUCIDE_ICONS,
        multi: true,
        useValue: new LucideIconProvider(APP_ICONS),
      },
    ],
  });

  const fixture = TestBed.createComponent(TagihanMassalPage);
  return { fixture, previewCalls, generateCalls };
}

function textOf(fixture: ComponentFixture<TagihanMassalPage>): string {
  return (fixture.nativeElement as HTMLElement).textContent ?? '';
}

function fillValidForm(fixture: ComponentFixture<TagihanMassalPage>): void {
  fixture.componentInstance.form.patchValue({
    bulan: 9,
    tahun: 2025,
    tahunAjaranId: 1,
    scope: 'ALL',
    nominal: 150000,
    jatuhTempo: '2025-09-10',
  });
}

describe('TagihanMassalPage', () => {
  it('blocks preview and shows validation for an invalid form', () => {
    const { fixture, previewCalls } = setup();
    fixture.detectChanges();

    fixture.componentInstance.submitPreview();
    fixture.detectChanges();

    expect(previewCalls.length).toBe(0);
    expect(textOf(fixture)).toContain('Wajib diisi');
  });

  it('requests preview and shows the summary on success', () => {
    const { fixture, previewCalls } = setup();
    fixture.detectChanges();
    fillValidForm(fixture);

    fixture.componentInstance.submitPreview();
    fixture.detectChanges();

    expect(previewCalls).toEqual([
      {
        tahunAjaranId: 1,
        bulan: 9,
        tahun: 2025,
        nominal: 150000,
        kelasId: null,
      },
    ]);

    const text = textOf(fixture);
    expect(text).toContain('Ringkasan Preview');
    expect(text).toContain('September 2025');
    expect(text).toContain('Tagihan baru akan dibuat');
    expect(text).toContain('8');
    expect(text).toContain('Rp 1.200.000');
  });

  it('shows an error and stays on config when preview fails', () => {
    const error = new HttpErrorResponse({ status: 500 });
    const { fixture } = setup({ preview: () => throwError(() => error) });
    fixture.detectChanges();
    fillValidForm(fixture);

    fixture.componentInstance.submitPreview();
    fixture.detectChanges();

    const text = textOf(fixture);
    expect(text).toContain('Preview tagihan massal tidak dapat dimuat');
    expect(text).not.toContain('Ringkasan Preview');
  });

  it('requires confirmation before generating', () => {
    const { fixture, generateCalls } = setup();
    fixture.detectChanges();
    fillValidForm(fixture);
    fixture.componentInstance.submitPreview();
    fixture.detectChanges();

    fixture.componentInstance.requestGenerate();
    fixture.detectChanges();

    expect(fixture.componentInstance.confirmOpen()).toBe(true);
    expect(generateCalls.length).toBe(0);
  });

  it('prevents double submission while a generate request is in flight', () => {
    const subject = new Subject<BulkGenerateResult>();
    const { fixture, generateCalls } = setup({
      generate: () => subject.asObservable(),
    });
    fixture.detectChanges();
    fillValidForm(fixture);
    fixture.componentInstance.submitPreview();
    fixture.detectChanges();

    fixture.componentInstance.requestGenerate();
    fixture.componentInstance.generate();
    fixture.componentInstance.generate();
    fixture.detectChanges();

    expect(generateCalls.length).toBe(1);
  });

  it('shows the result summary from the API response', () => {
    const { fixture, generateCalls } = setup();
    fixture.detectChanges();
    fillValidForm(fixture);
    fixture.componentInstance.submitPreview();
    fixture.detectChanges();

    fixture.componentInstance.requestGenerate();
    fixture.componentInstance.generate();
    fixture.detectChanges();

    expect(generateCalls[0]).toEqual({
      tahunAjaranId: 1,
      bulan: 9,
      tahun: 2025,
      nominal: 150000,
      kelasId: null,
      jatuhTempo: '2025-09-10',
      keterangan: undefined,
    });

    const text = textOf(fixture);
    expect(text).toContain('Hasil Generate Tagihan');
    expect(text).toContain('Tagihan dibuat');
    expect(text).toContain('8');
    expect(text).toContain('Rp 1.200.000');
  });

  it('shows an error and keeps the preview when generate fails', () => {
    const error = new HttpErrorResponse({ status: 500 });
    const { fixture } = setup({ generate: () => throwError(() => error) });
    fixture.detectChanges();
    fillValidForm(fixture);
    fixture.componentInstance.submitPreview();
    fixture.detectChanges();

    fixture.componentInstance.requestGenerate();
    fixture.componentInstance.generate();
    fixture.detectChanges();

    const text = textOf(fixture);
    expect(text).toContain('Ringkasan Preview');
    expect(text).toContain('Tagihan massal tidak dapat diproses');
  });
});
