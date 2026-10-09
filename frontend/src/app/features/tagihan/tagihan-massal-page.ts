import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { catchError, forkJoin, of } from 'rxjs';
import { apiErrorMessage } from '../../core/http/http-error.util';
import { Kelas } from '../../core/kelas/kelas.model';
import { KelasService } from '../../core/kelas/kelas.service';
import { TahunAjaran } from '../../core/tahun-ajaran/tahun-ajaran.model';
import { TahunAjaranService } from '../../core/tahun-ajaran/tahun-ajaran.service';
import {
  BulkGenerateResult,
  BulkPreviewResult,
} from '../../core/tagihan/tagihan.model';
import { TagihanService } from '../../core/tagihan/tagihan.service';
import { formatRupiahFrom } from '../../shared/util/format';
import { controlErrorText } from '../../shared/util/form-errors';
import { periodLabel } from '../../shared/util/months';
import { AppIcon } from '../../shared/ui/app-icon/app-icon';
import { ConfirmDialog } from '../../shared/ui/confirm-dialog/confirm-dialog';
import { FormField } from '../../shared/ui/form-field/form-field';
import { InlineAlert } from '../../shared/ui/inline-alert/inline-alert';
import { PageHeader } from '../../shared/ui/page-header/page-header';
import { StatePanel } from '../../shared/ui/state-panel/state-panel';

type Step = 'config' | 'preview' | 'result';
type TargetScope = 'ALL' | 'KELAS';

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
  selector: 'app-tagihan-massal-page',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    PageHeader,
    FormField,
    InlineAlert,
    ConfirmDialog,
    StatePanel,
    AppIcon,
  ],
  templateUrl: './tagihan-massal-page.html',
})
export class TagihanMassalPage {
  private readonly tagihanService = inject(TagihanService);
  private readonly kelasService = inject(KelasService);
  private readonly tahunAjaranService = inject(TahunAjaranService);
  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  private readonly refLoadingState = signal(true);
  private readonly refErrorState = signal<string | null>(null);
  private readonly stepState = signal<Step>('config');
  private readonly previewingState = signal(false);
  private readonly generatingState = signal(false);
  private readonly confirmOpenState = signal(false);
  private readonly previewState = signal<BulkPreviewResult | null>(null);
  private readonly resultState = signal<BulkGenerateResult | null>(null);
  private readonly actionErrorState = signal<string | null>(null);

  readonly refLoading = this.refLoadingState.asReadonly();
  readonly refError = this.refErrorState.asReadonly();
  readonly step = this.stepState.asReadonly();
  readonly previewing = this.previewingState.asReadonly();
  readonly generating = this.generatingState.asReadonly();
  readonly confirmOpen = this.confirmOpenState.asReadonly();
  readonly preview = this.previewState.asReadonly();
  readonly result = this.resultState.asReadonly();
  readonly actionError = this.actionErrorState.asReadonly();

  readonly kelasList = signal<Kelas[]>([]);
  readonly tahunAjaranList = signal<TahunAjaran[]>([]);

  readonly months = MONTHS.map((label, index) => ({
    value: index + 1,
    label,
  }));

  readonly confirmMessage = computed(() => {
    const preview = this.previewState();
    if (!preview) {
      return '';
    }
    return (
      `Sistem akan membuat ${preview.willCreate} tagihan sebesar ` +
      `${formatRupiahFrom(preview.nominal)} untuk periode ` +
      `${periodLabel(preview.periode.bulan, preview.periode.tahun)}. ` +
      `${preview.skipped} siswa dilewati karena sudah memiliki tagihan. ` +
      `Lanjutkan?`
    );
  });

  private readonly kelasRequiredWhenScoped: ValidatorFn = (control) => {
    const scope = control.parent?.get('scope')?.value as
      | TargetScope
      | undefined;
    if (scope === 'KELAS' && Number(control.value) <= 0) {
      return { required: true };
    }
    return null;
  };

  readonly form = this.formBuilder.group({
    bulan: this.formBuilder.control(new Date().getMonth() + 1, [
      Validators.required,
      Validators.min(1),
      Validators.max(12),
    ]),
    tahun: this.formBuilder.control(new Date().getFullYear(), [
      Validators.required,
      Validators.min(2000),
      Validators.max(2100),
    ]),
    tahunAjaranId: this.formBuilder.control(0, [
      Validators.required,
      Validators.min(1),
    ]),
    scope: this.formBuilder.control<TargetScope>('ALL', [Validators.required]),
    kelasId: this.formBuilder.control(0, [this.kelasRequiredWhenScoped]),
    nominal: this.formBuilder.control(0, [
      Validators.required,
      Validators.min(1),
    ]),
    jatuhTempo: this.formBuilder.control('', [Validators.required]),
    keterangan: this.formBuilder.control('', [Validators.maxLength(255)]),
  });

  protected readonly errorText = controlErrorText;
  protected readonly formatRupiah = formatRupiahFrom;
  protected readonly periodLabel = periodLabel;

  constructor() {
    this.form.controls.scope.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.form.controls.kelasId.updateValueAndValidity());

    this.loadReference();
  }

  get bulan(): AbstractControl {
    return this.form.controls.bulan;
  }

  get tahun(): AbstractControl {
    return this.form.controls.tahun;
  }

  get tahunAjaranId(): AbstractControl {
    return this.form.controls.tahunAjaranId;
  }

  get scope(): AbstractControl {
    return this.form.controls.scope;
  }

  get kelasId(): AbstractControl {
    return this.form.controls.kelasId;
  }

  get nominal(): AbstractControl {
    return this.form.controls.nominal;
  }

  get jatuhTempo(): AbstractControl {
    return this.form.controls.jatuhTempo;
  }

  get keterangan(): AbstractControl {
    return this.form.controls.keterangan;
  }

  get isScoped(): boolean {
    return this.form.controls.scope.value === 'KELAS';
  }

  loadReference(): void {
    this.refLoadingState.set(true);
    this.refErrorState.set(null);

    forkJoin({
      kelas: this.kelasService.getList(),
      tahunAjaran: this.tahunAjaranService
        .getList()
        .pipe(catchError(() => of([] as TahunAjaran[]))),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ kelas, tahunAjaran }) => {
          this.kelasList.set(kelas);
          this.tahunAjaranList.set(tahunAjaran);
          const active =
            tahunAjaran.find((item) => Boolean(item.aktif)) ?? tahunAjaran[0];
          if (active) {
            this.form.controls.tahunAjaranId.setValue(active.id);
          }
          this.refLoadingState.set(false);
        },
        error: (error: unknown) => {
          this.refErrorState.set(
            apiErrorMessage(error, 'Data kelas dan tahun ajaran tidak dapat dimuat.'),
          );
          this.refLoadingState.set(false);
        },
      });
  }

  kelasLabel(kelas: Kelas): string {
    return `${kelas.tingkat} ${kelas.jurusan}`;
  }

  semesterLabel(item: TahunAjaran): string {
    return item.semester === 'GANJIL' ? 'Ganjil' : 'Genap';
  }

  scopeLabel(scope: TargetScope | undefined): string {
    return scope === 'KELAS' ? 'Kelas tertentu' : 'Semua siswa';
  }

  targetLabel(target: BulkPreviewResult['target']): string {
    if (target.scope === 'KELAS' && target.kelasId != null) {
      const kelas = this.kelasList().find((item) => item.id === target.kelasId);
      return kelas ? `Kelas ${this.kelasLabel(kelas)}` : 'Kelas tertentu';
    }
    return 'Semua siswa';
  }

  onScopeChange(value: TargetScope): void {
    this.form.controls.scope.setValue(value);
  }

  dismissActionError(): void {
    this.actionErrorState.set(null);
  }

  submitPreview(): void {
    this.actionErrorState.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    this.previewingState.set(true);

    this.tagihanService
      .bulkPreview({
        tahunAjaranId: raw.tahunAjaranId,
        bulan: raw.bulan,
        tahun: raw.tahun,
        nominal: raw.nominal,
        kelasId: raw.scope === 'KELAS' ? raw.kelasId : null,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (preview) => {
          this.previewingState.set(false);
          this.previewState.set(preview);
          this.stepState.set('preview');
        },
        error: (error: unknown) => {
          this.previewingState.set(false);
          this.actionErrorState.set(
            apiErrorMessage(error, 'Preview tagihan massal tidak dapat dimuat.'),
          );
        },
      });
  }

  backToConfig(): void {
    this.actionErrorState.set(null);
    this.stepState.set('config');
  }

  requestGenerate(): void {
    if ((this.preview()?.willCreate ?? 0) === 0) {
      return;
    }
    this.confirmOpenState.set(true);
  }

  cancelGenerate(): void {
    this.confirmOpenState.set(false);
  }

  generate(): void {
    if (this.generatingState()) {
      return;
    }

    const raw = this.form.getRawValue();
    this.actionErrorState.set(null);
    this.generatingState.set(true);

    const keterangan = raw.keterangan.trim();

    this.tagihanService
      .bulkGenerate({
        tahunAjaranId: raw.tahunAjaranId,
        bulan: raw.bulan,
        tahun: raw.tahun,
        nominal: raw.nominal,
        kelasId: raw.scope === 'KELAS' ? raw.kelasId : null,
        jatuhTempo: raw.jatuhTempo,
        keterangan: keterangan.length > 0 ? keterangan : undefined,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.generatingState.set(false);
          this.confirmOpenState.set(false);
          this.resultState.set(result);
          this.stepState.set('result');
        },
        error: (error: unknown) => {
          this.generatingState.set(false);
          this.confirmOpenState.set(false);
          this.actionErrorState.set(
            apiErrorMessage(error, 'Tagihan massal tidak dapat diproses.'),
          );
        },
      });
  }

  restart(): void {
    this.actionErrorState.set(null);
    this.previewState.set(null);
    this.resultState.set(null);
    this.stepState.set('config');
  }
}
