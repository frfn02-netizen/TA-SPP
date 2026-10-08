import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found-page',
  imports: [RouterLink],
  template: `
    <main class="flex min-h-dvh items-center justify-center bg-canvas px-4 py-10">
      <div class="w-full max-w-md text-center">
        <p class="text-sm font-semibold tracking-widest text-ink-600">404</p>
        <h1 class="mt-1 text-2xl font-bold text-navy-900">
          Halaman tidak ditemukan
        </h1>
        <p class="mt-2 text-sm text-ink-600">
          Alamat yang Anda tuju tidak tersedia.
        </p>
        <a
          routerLink="/"
          class="mt-6 inline-flex h-11 items-center justify-center rounded-control bg-navy-900 px-5 text-sm font-semibold text-white transition-colors hover:bg-navy-800"
        >
          Kembali ke beranda
        </a>
      </div>
    </main>
  `,
})
export class NotFoundPage {}
