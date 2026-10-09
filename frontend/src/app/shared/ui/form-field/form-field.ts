import { Component, input } from '@angular/core';

@Component({
  selector: 'app-form-field',
  template: `
    <div>
      <label
        [for]="fieldId()"
        class="mb-1.5 block text-[13px] font-medium text-ink-700"
      >
        {{ label() }}
        @if (required()) {
          <span class="ml-0.5 text-red-700" aria-hidden="true">*</span>
          <span class="sr-only"> (wajib)</span>
        }
      </label>

      <ng-content />

      @if (error()) {
        <p [id]="fieldId() + '-error'" class="mt-1.5 text-xs text-red-700">
          {{ error() }}
        </p>
      } @else if (hint()) {
        <p class="mt-1.5 text-xs text-ink-600">{{ hint() }}</p>
      }
    </div>
  `,
})
export class FormField {
  readonly label = input.required<string>();
  readonly fieldId = input.required<string>();
  readonly hint = input<string | null>(null);
  readonly error = input<string | null>(null);
  readonly required = input(false);
}
