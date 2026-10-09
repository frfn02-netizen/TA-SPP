import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { apiErrorMessage } from '../../core/http/http-error.util';
import { SiswaListItem } from '../../core/siswa/siswa.model';
import { SiswaService } from '../../core/siswa/siswa.service';
import { Tagihan, TagihanPayload } from '../../core/tagihan/tagihan.model';
import { TagihanService } from '../../core/tagihan/tagihan.service';
import { TahunAjaran } from '../../core/tahun-ajaran/tahun-ajaran.model';
import { TahunAjaranService } from '../../core/tahun-ajaran/tahun-ajaran.service';
import { controlErrorText } from '../../shared/util/form-errors';
import { formatDate, formatRupiahFrom } from '../../shared/util/format';
import {
  BillStatus,
  billStatusLabel,
  billStatusTone,
} from '../../shared/util/status';
import { AppIcon } from '../../shared/ui/app-icon/app-icon';
import { ConfirmDialog } from '../../shared/ui/confirm-dialog/confirm-dialog';
import { FormField } from '../../shared/ui/form-field/form-field';
import { InlineAlert } from '../../shared/ui/inline-alert/inline-alert';
import { Modal } from '../../shared/ui/modal/modal';
import { PageHeader } from '../../shared/ui/page-header/page-header';
import { StatePanel } from '../../shared/ui/state-panel/state-panel';
import { StatusBadge } from '../../shared/ui/status-badge/status-badge';
import { TableSkeleton } from '../../shared/ui/table-skeleton/table-skeleton';

type StatusFilter = 'ALL' | BillStatus;

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
  selector: 'app-tagihan-page',
  imports: [
    ReactiveFormsModule,
    PageHeader,
    TableSkeleton,
    StatePanel,
    Modal,
    ConfirmDialog,
    FormField,
    InlineAlert,
    StatusBadge,
    AppIcon,
  ],
  templateUrl: './tagihan-page.html',
})
export class TagihanPage {
  private readonly tagihanService = inject(TagihanService);
  private readonly siswaService = inject(SiswaService);
  private readonly tahunAjaranService = inject(TahunAjaranService);
  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  private readonly listState = signal<Tagihan[]>([]);
  private readonly loadingState = signal(true);
  private readonly errorState = signal<string | null>(null);
  private readonly successState = signal<string | null>(null);
  private readonly actionErrorState = signal<string | null>(null);

  private readonly statusFilterState = signal<StatusFilter>('ALL');
  private readonly siswaFilterState = signal(0);
  private readonly searchState = signal('');

  readonly list = this.listState.asReadonly();
  readonly loading = this.loadingState.asReadonly();
  readonly error = this.errorState.asReadonly();
  readonly success = this.successState.asReadonly();
  readonly actionError = this.actionErrorState.asReadonly();
  readonly statusFilter = this.statusFilterState.asReadonly();
  readonly siswaFilter = this.siswaFilterState.asReadonly();
  readonly search = this.searchState.asReadonly();

  readonly siswaList = signal<SiswaListItem[]>([]);
  readonly tahunAjaranList = signal<TahunAjaran[]>([]);

  readonly months = MONTHS.map((label, index) => ({
    value: index + 1,
    label,
  }));

  readonly filtered = computed(() => {
    const status = this.statusFilterState();
    const siswaId = this.siswaFilterState();
    const term = this.searchState().trim().toLowerCase();

    return this.listState().filter((item) => {
      if (status !== 'ALL' && item.status !== status) {
        return false;
      }
      if (siswaId !== 0 && item.siswa_id !== siswaId) {
        return false;
      }
      if (!term) {
        return true;
      }
      return (
        (item.nama ?? '').toLowerCase().includes(term) ||
        (item.nisn ?? '').toLowerCase().includes(term)
      );
    });
  });

  readonly hasActiveFilter = computed(
    () =>
      this.statusFilterState() !== 'ALL' ||
      this.siswaFilterState() !== 0 ||
      this.searchState().trim().length > 0,
  );

  readonly formOpen = signal(false);
  readonly editing = signal<Tagihan | null>(null);
  readonly submitting = signal(false);
  readonly formError = signal<string | null>(null);

  readonly form = this.formBuilder.group({
    siswaId: this.formBuilder.control(0, [
      Validators.required,
      Validators.min(1),
    ]),
    tahunAjaranId: this.formBuilder.control(0, [
      Validators.required,
      Validators.min(1),
    ]),
    bulan: this.formBuilder.control(1, [
      Validators.required,
      Validators.min(1),
      Validators.max(12),
    ]),
    tahun: this.formBuilder.control(new Date().getFullYear(), [
      Validators.required,
      Validators.min(2000),
      Validators.max(2100),
    ]),
    nominal: this.formBuilder.control(0, [
      Validators.required,
      Validators.min(1),
    ]),
    jatuhTempo: this.formBuilder.control('', [Validators.required]),
    keterangan: this.formBuilder.control('', [Validators.maxLength(255)]),
  });

  readonly deleteTarget = signal<Tagihan | null>(null);
  readonly deleting = signal(false);

  readonly deleteMessage = computed(() => {
    const target = this.deleteTarget();
    if (!target) {
      return '';
    }
    const name = target.nama ?? 'siswa';
    return `Hapus tagihan ${this.monthLabel(target.bulan)} ${target.tahun} untuk ${name}? Tindakan ini tidak dapat dibatalkan.`;
  });

  protected readonly errorText = controlErrorText;
  protected readonly formatRupiah = formatRupiahFrom;
  protected readonly formatDate = formatDate;
  protected readonly statusLabel = billStatusLabel;
  protected readonly statusTone = billStatusTone;

  constructor() {
    this.load();
    this.loadSiswa();
    this.loadTahunAjaran();
  }

  get siswaId(): AbstractControl {
    return this.form.controls.siswaId;
  }

  get tahunAjaranId(): AbstractControl {
    return this.form.controls.tahunAjaranId;
  }

  get bulan(): AbstractControl {
    return this.form.controls.bulan;
  }

  get tahun(): AbstractControl {
    return this.form.controls.tahun;
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

  monthLabel(bulan: number): string {
    return MONTHS[bulan - 1] ?? '-';
  }

  siswaLabel(siswa: SiswaListItem): string {
    return `${siswa.nama} (${siswa.nisn})`;
  }

  tahunAjaranLabel(item: TahunAjaran): string {
    return `${item.nama} - ${item.semester === 'GANJIL' ? 'Ganjil' : 'Genap'}`;
  }

  load(): void {
    this.loadingState.set(true);
    this.errorState.set(null);

    this.tagihanService
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
            apiErrorMessage(error, 'Data tagihan tidak dapat dimuat.'),
          );
          this.loadingState.set(false);
        },
      });
  }

  loadSiswa(): void {
    this.siswaService
      .getList()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (list) => this.siswaList.set(list),
        error: () => this.siswaList.set([]),
      });
  }

  loadTahunAjaran(): void {
    this.tahunAjaranService
      .getList()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (list) => this.tahunAjaranList.set(list),
        error: () => this.tahunAjaranList.set([]),
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

  onSiswaFilter(event: Event): void {
    this.siswaFilterState.set(
      Number((event.target as HTMLSelectElement).value),
    );
  }

  clearFilters(): void {
    this.statusFilterState.set('ALL');
    this.siswaFilterState.set(0);
    this.searchState.set('');
  }

  dismissSuccess(): void {
    this.successState.set(null);
  }

  dismissActionError(): void {
    this.actionErrorState.set(null);
  }

  openCreate(): void {
    this.editing.set(null);
    this.form.reset({
      siswaId: 0,
      tahunAjaranId: this.defaultTahunAjaranId(),
      bulan: new Date().getMonth() + 1,
      tahun: new Date().getFullYear(),
      nominal: 0,
      jatuhTempo: '',
      keterangan: '',
    });
    this.formError.set(null);
    this.formOpen.set(true);
  }

  openEdit(item: Tagihan): void {
    this.editing.set(item);
    this.form.reset({
      siswaId: item.siswa_id,
      tahunAjaranId: item.tahun_ajaran_id,
      bulan: item.bulan,
      tahun: item.tahun,
      nominal: Number(item.nominal),
      jatuhTempo: (item.jatuh_tempo ?? '').slice(0, 10),
      keterangan: item.keterangan ?? '',
    });
    this.formError.set(null);
    this.formOpen.set(true);
  }

  closeForm(): void {
    this.formOpen.set(false);
  }

  submit(): void {
    this.formError.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const current = this.editing();
    const raw = this.form.getRawValue();
    const keterangan = raw.keterangan.trim();
    const payload: TagihanPayload = {
      siswaId: raw.siswaId,
      tahunAjaranId: raw.tahunAjaranId,
      bulan: raw.bulan,
      tahun: raw.tahun,
      nominal: raw.nominal,
      jatuhTempo: raw.jatuhTempo,
      keterangan: keterangan.length > 0 ? keterangan : undefined,
    };
    this.submitting.set(true);

    const request = current
      ? this.tagihanService.update(current.id, payload)
      : this.tagihanService.create(payload);

    request.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.submitting.set(false);
        this.formOpen.set(false);
        this.actionErrorState.set(null);
        this.successState.set(
          current
            ? 'Tagihan berhasil diperbarui.'
            : 'Tagihan berhasil dibuat.',
        );
        this.load();
      },
      error: (error: unknown) => {
        this.submitting.set(false);
        this.formError.set(
          apiErrorMessage(error, 'Tagihan tidak dapat disimpan.'),
        );
      },
    });
  }

  confirmDelete(item: Tagihan): void {
    this.actionErrorState.set(null);
    this.deleteTarget.set(item);
  }

  cancelDelete(): void {
    this.deleteTarget.set(null);
  }

  remove(): void {
    const target = this.deleteTarget();
    if (!target) {
      return;
    }

    this.deleting.set(true);
    this.tagihanService
      .remove(target.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.deleting.set(false);
          this.deleteTarget.set(null);
          this.successState.set('Tagihan berhasil dihapus.');
          this.load();
        },
        error: (error: unknown) => {
          this.deleting.set(false);
          this.deleteTarget.set(null);
          this.actionErrorState.set(
            apiErrorMessage(error, 'Tagihan tidak dapat dihapus.'),
          );
        },
      });
  }

  private defaultTahunAjaranId(): number {
    const active = this.tahunAjaranList().find((item) => Boolean(item.aktif));
    return active?.id ?? this.tahunAjaranList()[0]?.id ?? 0;
  }
}
