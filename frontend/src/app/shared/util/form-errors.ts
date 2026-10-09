import { AbstractControl } from '@angular/forms';

export interface ControlErrorMessages {
  pattern?: string;
  min?: string;
  max?: string;
}

export function controlErrorText(
  control: AbstractControl,
  messages: string | ControlErrorMessages = {},
): string | null {
  if (!control.invalid || !(control.touched || control.dirty)) {
    return null;
  }

  const errors = control.errors;
  if (!errors) {
    return null;
  }

  const options: ControlErrorMessages =
    typeof messages === 'string' ? { pattern: messages } : messages;

  if (errors['required']) {
    return 'Wajib diisi.';
  }
  if (errors['minlength']) {
    return `Minimal ${errors['minlength'].requiredLength} karakter.`;
  }
  if (errors['maxlength']) {
    return `Maksimal ${errors['maxlength'].requiredLength} karakter.`;
  }
  if (errors['pattern']) {
    return options.pattern ?? 'Format tidak valid.';
  }
  if (errors['min']) {
    return options.min ?? 'Nilai terlalu kecil.';
  }
  if (errors['max']) {
    return options.max ?? 'Nilai terlalu besar.';
  }
  return 'Nilai tidak valid.';
}
