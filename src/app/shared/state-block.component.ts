import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-state-block',
  standalone: true,
  template: `
    <section class="rounded-lg border border-dashed border-slate-300 bg-white px-5 py-12 text-center shadow-sm">
      <div class="mx-auto mb-4 grid size-14 place-items-center rounded-lg bg-slate-100 text-xl font-black text-slate-500">{{ icon }}</div>
      <h3 class="font-semibold text-slate-900">{{ title }}</h3>
      @if (description) {
        <p class="mt-1 text-sm text-slate-500">{{ description }}</p>
      }
      @if (retry.observed) {
        <button class="btn-primary mt-4" type="button" (click)="retry.emit()">إعادة المحاولة</button>
      }
    </section>
  `,
})
export class StateBlockComponent {
  @Input() icon = '📄';
  @Input({ required: true }) title!: string;
  @Input() description = '';
  @Output() retry = new EventEmitter<void>();
}
