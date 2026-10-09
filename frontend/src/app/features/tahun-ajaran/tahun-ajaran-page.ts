import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { apiErrorMessage } from '../../core/http/http-error.util';
import {
  Semester,
  TahunAjaran,
  TahunAjaranPayload,
} from '../../core/tahun-ajaran/tahun-ajaran.model';
import { TahunAjaranService } from '../../core/tahun-ajaran/tahun-ajaran.service';
import { controlErrorText } from '../../shared/util/form-errors';
import { AppIcon } from '../../shared/ui/app-icon/app-icon';
import { FormField } from '../../shared/ui/form-field/form-field';
import { InlineAlert } from '../../shared/ui/inline-alert/inline-alert';
import { Modal } from '../../shared/ui/modal/modal';
import { PageHeader } from '../../shared/ui/page-header/page-header';
import { StatePanel } from '../../shared/ui/state-panel/state-panel';
import { StatusBadge } from '../../shared/ui/status-badge/status-badge';
import { TableSkeleton } from '../../shared/ui/table-skeleton/table-skeleton';

@Component({
  selector: 'app-tahun-ajaran-page',
  imports: [
    ReactiveFormsModule,
    PageHeader,
    TableSkeleton,
    StatePanel,
    Modal,
    FormField,
    InlineAlert,
    StatusBadge,
    AppIcon,
  ],
  templateUrl: './tahun-ajaran-page.html',
})
export class TahunAjaranPage {
  private readonly tahunAjaranService = inject(TahunAjaranService);
  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  private readonly listState = signal<TahunAjaran[]>([]);
  private readonly loadingState = signal(true);
  private readonly errorState = signal<string | null>(null);
  private readonly successState = signal<string | null>(null);
  private readonly actionErrorState = signal<string | null>(null);

  readonly list = this.listState.asReadonly();
  readonly loading = this.loadingState.asReadonly();
  readonly error = this.errorState.asReadonly();
  readonly success = this.successState.asReadonly();
  readonly actionError = this.actionErrorState.asReadonly();

  readonly formOpen = signal(false);
  readonly submitting = signal(false);
  readonly formError = signal<string | null>(null);
  readonly activatingId = signal<number | null>(null);

  readonly form = this.formBuilder.group({
    nama: this.formBuilder.control('', [
      Validators.required,
      Validators.minLength(4),
      Validators.maxLength(20),
    ]),
    semester: this.formBuilder.control<Semester>('GANJIL', [
      Validators.required,
    ]),
  });

  constructor() {
    this.load();
  }

  get nama(): AbstractControl {
    return this.form.controls.nama;
  }

  get semester(): AbstractControl {
    return this.form.controls.semester;
  }

  protected readonly errorText = controlErrorText;

  isActive(item: TahunAjaran): boolean {
    return Boolean(item.aktif);
  }

  load(): void {
    this.loadingState.set(true);
    this.errorState.set(null);

    this.tahunAjaranService
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
            apiErrorMessage(error, 'Data tahun ajaran tidak dapat dimuat.'),
          );
          this.loadingState.set(false);
        },
      });
  }

  dismissSuccess(): void {
    this.successState.set(null);
  }

  dismissActionError(): void {
    this.actionErrorState.set(null);
  }

  openCreate(): void {
    this.form.reset({ nama: '', semester: 'GANJIL' });
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

    const payload: TahunAjaranPayload = this.form.getRawValue();
    this.submitting.set(true);

    this.tahunAjaranService
      .create(payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.formOpen.set(false);
          this.actionErrorState.set(null);
          this.successState.set('Tahun ajaran berhasil ditambahkan.');
          this.load();
        },
        error: (error: unknown) => {
          this.submitting.set(false);
          this.formError.set(
            apiErrorMessage(error, 'Tahun ajaran tidak dapat disimpan.'),
          );
        },
      });
  }

  activate(item: TahunAjaran): void {
    this.actionErrorState.set(null);
    this.activatingId.set(item.id);

    this.tahunAjaranService
      .activate(item.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.activatingId.set(null);
          this.successState.set(`Tahun ajaran ${item.nama} diaktifkan.`);
          this.load();
        },
        error: (error: unknown) => {
          this.activatingId.set(null);
          this.actionErrorState.set(
            apiErrorMessage(error, 'Tahun ajaran tidak dapat diaktifkan.'),
          );
        },
      });
  }
}
