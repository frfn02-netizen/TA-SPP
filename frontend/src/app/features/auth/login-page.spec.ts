import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { AppUser } from '../../core/models/user.model';
import { AuthService } from '../../core/auth/auth.service';
import { LoginPage } from './login-page';

const adminUser: AppUser = { id: 1, username: 'admin', role: 'ADMIN' };
const studentUser: AppUser = { id: 2, username: '20260001', role: 'SISWA' };

function setup(user: AppUser): {
  fixture: ComponentFixture<LoginPage>;
  navigate: ReturnType<typeof vi.spyOn>;
} {
  const auth = {
    login: () => of(user),
    isAuthenticated: () => false,
    isAdmin: () => false,
    isStudent: () => false,
  };

  TestBed.configureTestingModule({
    imports: [LoginPage],
    providers: [provideRouter([]), { provide: AuthService, useValue: auth }],
  });

  const fixture = TestBed.createComponent(LoginPage);
  const router = TestBed.inject(Router);
  const navigate = vi
    .spyOn(router, 'navigateByUrl')
    .mockResolvedValue(true);

  fixture.componentInstance.form.patchValue({
    username: 'user',
    password: 'secret',
  });

  return { fixture, navigate };
}

describe('LoginPage redirects', () => {
  it('sends an admin to /admin/dashboard after login', () => {
    const { fixture, navigate } = setup(adminUser);
    fixture.componentInstance.submit();

    expect(navigate).toHaveBeenCalledWith('/admin/dashboard');
  });

  it('sends a student to /siswa after login', () => {
    const { fixture, navigate } = setup(studentUser);
    fixture.componentInstance.submit();

    expect(navigate).toHaveBeenCalledWith('/siswa');
  });

  it('does not navigate when the form is invalid', () => {
    const { fixture, navigate } = setup(adminUser);
    fixture.componentInstance.form.reset({ username: '', password: '' });
    fixture.componentInstance.submit();

    expect(navigate).not.toHaveBeenCalled();
  });
});
