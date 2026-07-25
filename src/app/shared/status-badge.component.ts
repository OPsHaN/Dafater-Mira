import { Component, Input } from '@angular/core';
import { BookStatus, BOOK_STATUS_LABELS } from '../core/models';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  template: `
    <span class="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold" [class]="classes">
      @if (status === statusEnum.FullyCollected) {
        <span aria-hidden="true">🔒</span>
      }
      {{ label }}
    </span>
  `,
})
export class StatusBadgeComponent {
  @Input({ required: true }) status!: BookStatus;
  readonly statusEnum = BookStatus;

  get label() {
    return BOOK_STATUS_LABELS[this.status];
  }

  get classes() {
    return {
      [BookStatus.NotAssigned]: 'bg-slate-100 text-slate-700',
      [BookStatus.AssignedToDistributor]: 'bg-blue-100 text-blue-700',
      [BookStatus.WaitingForCash]: 'bg-amber-100 text-amber-800',
      [BookStatus.CashReceived]: 'bg-teal-100 text-teal-800',
      [BookStatus.FullyCollected]: 'bg-emerald-100 text-emerald-800',
    }[this.status];
  }
}
