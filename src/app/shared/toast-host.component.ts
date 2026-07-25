import { Component } from '@angular/core';
import { ToastService } from '../core/toast.service';

@Component({
  selector: 'app-toast-host',
  standalone: true,
  template: `
    <div class="fixed right-4 top-4 z-50 flex w-[min(28rem,calc(100vw-2rem))] flex-col gap-3">
      @for (message of toast.messages(); track message.id) {
        <button
          type="button"
          (click)="toast.dismiss(message.id)"
          class="group flex items-start gap-3 rounded-lg border bg-white p-4 text-right text-sm shadow-2xl shadow-slate-900/10 ring-1 ring-black/5 transition hover:-translate-y-0.5"
          [class.border-emerald-200]="message.kind === 'success'"
          [class.border-red-200]="message.kind === 'error'"
          [class.border-slate-200]="message.kind === 'info'"
        >
          <span
            class="mt-0.5 grid size-8 shrink-0 place-items-center rounded-md text-xs font-black"
            [class.bg-emerald-100]="message.kind === 'success'"
            [class.text-emerald-700]="message.kind === 'success'"
            [class.bg-red-100]="message.kind === 'error'"
            [class.text-red-700]="message.kind === 'error'"
            [class.bg-slate-100]="message.kind === 'info'"
            [class.text-slate-700]="message.kind === 'info'"
          >
            {{ message.kind === 'success' ? '✓' : message.kind === 'error' ? '!' : 'i' }}
          </span>
          <span class="min-w-0 flex-1">
            <span class="block font-black text-slate-950">
              {{ message.kind === 'success' ? 'تم بنجاح' : message.kind === 'error' ? 'حدث خطأ' : 'تنبيه' }}
            </span>
            <span class="mt-0.5 block leading-6 text-slate-600">{{ message.text }}</span>
          </span>
          <span class="text-lg leading-none text-slate-300 transition group-hover:text-slate-500">×</span>
        </button>
      }
    </div>
  `,
})
export class ToastHostComponent {
  constructor(public toast: ToastService) {}
}
