import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { apiErrorMessage } from '../../core/http/http-error.util';
import { Kelas, KelasPayload, Tingkat } from '../../core/kelas/kelas.model';
import { KelasService } from '../../core/kelas/kelas.service';
import { controlErrorText } from '../../shared/util/form-errors';
import { AppIcon } from '../../shared/ui/app-icon/app-icon';
import { ConfirmDialog } from '../../shared/ui/confirm-dialog/confirm-dialog';
import { FormField } from '../../shared/ui/form-field/form-field';
import { InlineAlert } from '../../shared/ui/inline-alert/inline-alert';
import { Modal } from '../../shared/ui/modal/modal';
import { PageHeader } from '../../shared/ui/page-header/page-header';
import { StatePanel } from '../../shared/ui/state-panel/state-panel';
import { TableSkeleton } from '../../shared/ui/table-skeleton/table-skeleton';

@Component({
  selector: 'app-kelas-page',
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
  templateUrl: './kelas-page.html',
})
export class KelasPage {
  private readonly kelasService = inject(KelasService);
  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  private readonly kelasState = signal<Kelas[]>([]);
  private readonly loadingState = signal(true);
  private readonly errorState = signal<string | null>(null);
  private readonly successState = signal<string | null>(null);
  private readonly actionErrorState = signal<string | null>(null);
  private readonly searchState = signal('');

  readonly kelas = this.kelasState.asReadonly();
  readonly loading = this.loadingState.asReadonly();
  readonly error = this.errorState.asReadonly();
  readonly success = this.successState.asReadonly();
  readonly actionError = this.actionErrorState.asReadonly();
  readonly search = this.searchState.asReadonly();

  readonly filtered = computed(() => {
    const term = this.searchState().trim().toLowerCase();
    if (!term) {
      return this.kelasState();
    }

    return this.kelasState().filter((item) =>
      `${item.tingkat} ${item.jurusan}`.toLowerCase().includes(term),
    );
  });

  readonly formOpen = signal(false);
  readonly editing = signal<Kelas | null>(null);
  readonly submitting = signal(false);
  readonly formError = signal<string | null>(null);

  readonly form = this.formBuilder.group({
    tingkat: this.formBuilder.control<Tingkat>('X', [Validators.required]),
    jurusan: this.formBuilder.control('', [
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(50),
    ]),
  });

  readonly deleteTarget = signal<Kelas | null>(null);
  readonly deleting = signal(false);

  readonly deleteMessage = computed(() => {
    const target = this.deleteTarget();
    return target
      ? `Hapus kelas "${target.tingkat} ${target.jurusan}"? Kelas yang masih memiliki siswa tidak dapat dihapus.`
      : '';
  });

  constructor() {
    this.load();
  }

  get tingkat(): AbstractControl {
    return this.form.controls.tingkat;
  }

  get jurusan(): AbstractControl {
    return this.form.controls.jurusan;
  }

  protected readonly errorText = controlErrorText;

  load(): void {
    this.loadingState.set(true);
    this.errorState.set(null);

    this.kelasService
      .getList()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (list) => {
          this.kelasState.set(list);
          this.loadingState.set(false);
        },
        error: (error: unknown) => {
          this.kelasState.set([]);
          this.errorState.set(
            apiErrorMessage(error, 'Data kelas tidak dapat dimuat.'),
          );
          this.loadingState.set(false);
        },
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

  openCreate(): void {
    this.editing.set(null);
    this.form.reset({ tingkat: 'X', jurusan: '' });
    this.formError.set(null);
    this.formOpen.set(true);
  }

  openEdit(item: Kelas): void {
    this.editing.set(item);
    this.form.reset({ tingkat: item.tingkat, jurusan: item.jurusan });
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
    const payload: KelasPayload = this.form.getRawValue();
    this.submitting.set(true);

    const request = current
      ? this.kelasService.update(current.id, payload)
      : this.kelasService.create(payload);

    request.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.submitting.set(false);
        this.formOpen.set(false);
        this.actionErrorState.set(null);
        this.successState.set(
          current
            ? 'Data kelas berhasil diperbarui.'
            : 'Data kelas berhasil ditambahkan.',
        );
        this.load();
      },
      error: (error: unknown) => {
        this.submitting.set(false);
        this.formError.set(
          apiErrorMessage(error, 'Data kelas tidak dapat disimpan.'),
        );
      },
    });
  }

  confirmDelete(item: Kelas): void {
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
    this.kelasService
      .remove(target.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.deleting.set(false);
          this.deleteTarget.set(null);
          this.successState.set('Data kelas berhasil dihapus.');
          this.load();
        },
        error: (error: unknown) => {
          this.deleting.set(false);
          this.deleteTarget.set(null);
          this.actionErrorState.set(
            apiErrorMessage(error, 'Data kelas tidak dapat dihapus.'),
          );
        },
      });
  }
}
