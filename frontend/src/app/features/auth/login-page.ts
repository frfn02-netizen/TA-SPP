import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { apiErrorMessage } from '../../core/http/http-error.util';
import { AuthService } from '../../core/auth/auth.service';
import { AppIcon } from '../../shared/ui/app-icon/app-icon';

@Component({
  selector: 'app-login-page',
  imports: [ReactiveFormsModule, AppIcon],
  templateUrl: './login-page.html',
})
export class LoginPage {
  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly form = this.formBuilder.group({
    username: this.formBuilder.control('', [
      Validators.required,
      Validators.minLength(3),
    ]),
    password: this.formBuilder.control('', [
      Validators.required,
      Validators.minLength(6),
    ]),
  });

  readonly submitting = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly showPassword = signal(false);

  get username() {
    return this.form.controls.username;
  }

  get password() {
    return this.form.controls.password;
  }

  togglePassword(): void {
    this.showPassword.update((value) => !value);
  }

  submit(): void {
    this.errorMessage.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.auth.login(this.form.getRawValue()).subscribe({
      next: (user) => {
        this.submitting.set(false);
        const target = user.role === 'ADMIN' ? '/admin/dashboard' : '/403';
        void this.router.navigateByUrl(target);
      },
      error: (error: unknown) => {
        this.submitting.set(false);
        this.errorMessage.set(
          apiErrorMessage(
            error,
            'Tidak dapat masuk. Periksa koneksi lalu coba lagi.',
          ),
        );
      },
    });
  }
}
