import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { apiErrorMessage } from '../../core/http/http-error.util';
import { controlErrorText } from '../../shared/util/form-errors';
import { Kelas } from '../../core/kelas/kelas.model';
import { KelasService } from '../../core/kelas/kelas.service';
import {
  JenisKelamin,
  SiswaListItem,
  SiswaPayload,
} from '../../core/siswa/siswa.model';
import { SiswaService } from '../../core/siswa/siswa.service';
import { AppIcon } from '../../shared/ui/app-icon/app-icon';
import { ConfirmDialog } from '../../shared/ui/confirm-dialog/confirm-dialog';
import { FormField } from '../../shared/ui/form-field/form-field';
import { InlineAlert } from '../../shared/ui/inline-alert/inline-alert';
import { Modal } from '../../shared/ui/modal/modal';
import { PageHeader } from '../../shared/ui/page-header/page-header';
import { StatePanel } from '../../shared/ui/state-panel/state-panel';
import { TableSkeleton } from '../../shared/ui/table-skeleton/table-skeleton';

@Component({
  selector: 'app-siswa-page',
  imports: [
    ReactiveFormsModule,
    PageHeader,
    TableSkeleton,
    StatePanel,
    Modal,
    ConfirmDialog,
    FormField,
    InlineAlert,
    AppIcon,
  ],
  templateUrl: './siswa-page.html',
})
export class SiswaPage {
  private readonly siswaService = inject(SiswaService);
  private readonly kelasService = inject(KelasService);
  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  private readonly siswaState = signal<SiswaListItem[]>([]);
  private readonly loadingState = signal(true);
  private readonly errorState = signal<string | null>(null);
  private readonly successState = signal<string | null>(null);
  private readonly actionErrorState = signal<string | null>(null);
  private readonly searchState = signal('');

  readonly siswa = this.siswaState.asReadonly();
  readonly loading = this.loadingState.asReadonly();
  readonly error = this.errorState.asReadonly();
  readonly success = this.successState.asReadonly();
  readonly actionError = this.actionErrorState.asReadonly();
  readonly search = this.searchState.asReadonly();

  readonly kelasList = signal<Kelas[]>([]);

  readonly filtered = computed(() => {
    const term = this.searchState().trim().toLowerCase();
    if (!term) {
      return this.siswaState();
    }

    return this.siswaState().filter((item) => {
      const kelas = `${item.tingkat} ${item.jurusan}`.toLowerCase();
      return (
        item.nama.toLowerCase().includes(term) ||
        item.nisn.toLowerCase().includes(term) ||
        kelas.includes(term)
      );
    });
  });

  readonly formOpen = signal(false);
  readonly editing = signal<SiswaListItem | null>(null);
  readonly submitting = signal(false);
  readonly formError = signal<string | null>(null);

  readonly form = this.formBuilder.group({
    nisn: this.formBuilder.control('', [
      Validators.required,
      Validators.pattern(/^\d{10}$/),
    ]),
    nama: this.formBuilder.control('', [
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(100),
    ]),
    jenisKelamin: this.formBuilder.control<JenisKelamin>('L', [
      Validators.required,
    ]),
    kelasId: this.formBuilder.control(0, [
      Validators.required,
      Validators.min(1),
    ]),
    alamat: this.formBuilder.control('', [
      Validators.required,
      Validators.minLength(5),
      Validators.maxLength(255),
    ]),
    noHp: this.formBuilder.control('', [
      Validators.required,
      Validators.pattern(/^(\+62|08)[0-9]{8,13}$/),
    ]),
  });

  readonly deleteTarget = signal<SiswaListItem | null>(null);
  readonly deleting = signal(false);

  readonly deleteMessage = computed(() => {
    const target = this.deleteTarget();
    return target
      ? `Hapus data siswa "${target.nama}" (${target.nisn})? Tindakan ini tidak dapat dibatalkan.`
      : '';
  });

  constructor() {
    this.loadKelas();
    this.load();
  }

  get nisn(): AbstractControl {
    return this.form.controls.nisn;
  }

  get nama(): AbstractControl {
    return this.form.controls.nama;
  }

  get jenisKelamin(): AbstractControl {
    return this.form.controls.jenisKelamin;
  }

  get kelasId(): AbstractControl {
    return this.form.controls.kelasId;
  }

  get alamat(): AbstractControl {
    return this.form.controls.alamat;
  }

  get noHp(): AbstractControl {
    return this.form.controls.noHp;
  }

  load(): void {
    this.loadingState.set(true);
    this.errorState.set(null);

    this.siswaService
      .getList()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (list) => {
          this.siswaState.set(list);
          this.loadingState.set(false);
        },
        error: (error: unknown) => {
          this.siswaState.set([]);
          this.errorState.set(
            apiErrorMessage(error, 'Data siswa tidak dapat dimuat.'),
          );
          this.loadingState.set(false);
        },
      });
  }

  loadKelas(): void {
    this.kelasService
      .getList()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (list) => this.kelasList.set(list),
        error: () => this.kelasList.set([]),
      });
  }

  onSearch(event: Event): void {
    this.searchState.set((event.target as HTMLInputElement).value);
  }

  clearSearch(): void {
    this.searchState.set('');
  }

  dismissSuccess(): void {
    this.successState.set(null);
  }

  dismissActionError(): void {
    this.actionErrorState.set(null);
  }

  kelasLabel(kelas: Kelas): string {
    return `${kelas.tingkat} ${kelas.jurusan}`;
  }

  openCreate(): void {
    this.editing.set(null);
    this.form.reset({
      nisn: '',
      nama: '',
      jenisKelamin: 'L',
      kelasId: this.kelasList()[0]?.id ?? 0,
      alamat: '',
      noHp: '',
    });
    this.formError.set(null);
    this.formOpen.set(true);
  }

  openEdit(item: SiswaListItem): void {
    this.editing.set(item);
    this.form.reset({
      nisn: item.nisn,
      nama: item.nama,
      jenisKelamin: item.jenis_kelamin,
      kelasId: item.kelas_id,
      alamat: item.alamat,
      noHp: item.no_hp,
    });
    this.formError.set(null);
    this.formOpen.set(true);
  }

  closeForm(): void {
    this.formOpen.set(false);
  }

  submit(): void {
    if (this.submitting()) {
      return;
    }

    this.formError.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const current = this.editing();
    const payload: SiswaPayload = this.form.getRawValue();
    this.submitting.set(true);

    const request = current
      ? this.siswaService.update(current.id, payload)
      : this.siswaService.create(payload);

    request.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.submitting.set(false);
        this.formOpen.set(false);
        this.actionErrorState.set(null);
        this.successState.set(
          current
            ? 'Data siswa berhasil diperbarui.'
            : 'Data siswa berhasil ditambahkan.',
        );
        this.load();
      },
      error: (error: unknown) => {
        this.submitting.set(false);
        this.formError.set(
          apiErrorMessage(error, 'Data siswa tidak dapat disimpan.'),
        );
      },
    });
  }

  confirmDelete(item: SiswaListItem): void {
    this.actionErrorState.set(null);
    this.deleteTarget.set(item);
  }

  cancelDelete(): void {
    this.deleteTarget.set(null);
  }

  remove(): void {
    const target = this.deleteTarget();
    if (!target || this.deleting()) {
      return;
    }

    this.deleting.set(true);
    this.siswaService
      .remove(target.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.deleting.set(false);
          this.deleteTarget.set(null);
          this.successState.set('Data siswa berhasil dihapus.');
          this.load();
        },
        error: (error: unknown) => {
          this.deleting.set(false);
          this.deleteTarget.set(null);
          this.actionErrorState.set(this.deleteErrorMessage(error));
        },
      });
  }

  private deleteErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse && error.status === 409) {
      return 'Data siswa tidak dapat dihapus karena masih memiliki data terkait, misalnya tagihan.';
    }
    return apiErrorMessage(error, 'Data siswa tidak dapat dihapus.');
  }

  protected readonly errorText = controlErrorText;
}
