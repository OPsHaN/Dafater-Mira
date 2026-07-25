import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { BookType } from '../../core/models';
import { ToastService } from '../../core/toast.service';

@Component({
  standalone: true,
  imports: [FormsModule],
  template: `
    <section class="panel max-w-3xl">
      <div class="mb-5">
        <h2 class="text-xl font-black">إنشاء دفاتر</h2>
        <p class="text-sm text-slate-500">الإنشاء يتم فقط كدفعة، حتى لو دفتر واحد.</p>
      </div>

      <div class="mb-5 grid grid-cols-3 gap-2 text-center text-sm font-bold">
        <span class="rounded-md py-2" [class.bg-teal-700]="step === 1" [class.text-white]="step === 1" [class.bg-slate-100]="step !== 1">النوع</span>
        <span class="rounded-md py-2" [class.bg-teal-700]="step === 2" [class.text-white]="step === 2" [class.bg-slate-100]="step !== 2">العدد</span>
        <span class="rounded-md py-2" [class.bg-teal-700]="step === 3" [class.text-white]="step === 3" [class.bg-slate-100]="step !== 3">بداية السيريال</span>
      </div>

      @if (step === 1) {
        <div class="grid gap-3 sm:grid-cols-2">
          <button class="btn-secondary min-h-20" type="button" [class.!border-teal-700]="type === bookType.Collection" (click)="type = bookType.Collection">تحصيل</button>
          <button class="btn-secondary min-h-20" type="button" [class.!border-teal-700]="type === bookType.Return" (click)="type = bookType.Return">مرتجع</button>
        </div>
      }
      @if (step === 2) {
        <label>
          <span class="label">عدد الدفاتر</span>
          <input class="field" type="number" min="1" max="200" [(ngModel)]="count" />
        </label>
      }
      @if (step === 3) {
        <label>
          <span class="label">أول رقم في أول دفتر</span>
          <input class="field" type="number" min="1" [(ngModel)]="firstSerialStart" />
        </label>
        <div class="mt-4 rounded-md bg-teal-50 p-4 text-sm font-bold text-teal-900">
          {{ preview }}
        </div>
      }

      <div class="mt-6 flex justify-between gap-2">
        <button class="btn-secondary" type="button" [disabled]="step === 1 || submitting" (click)="step = step - 1">السابق</button>
        @if (step < 3) {
          <button class="btn-primary" type="button" [disabled]="!stepValid" (click)="step = step + 1">التالي</button>
        } @else {
          <button class="btn-primary" type="button" [disabled]="!stepValid || submitting" (click)="submit()">
            {{ submitting ? 'جاري الإنشاء...' : 'إنشاء الدفاتر' }}
          </button>
        }
      </div>
    </section>
  `,
})
export class BulkCreateComponent {
  readonly bookType = BookType;
  step = 1;
  type: BookType | null = null;
  count = 1;
  firstSerialStart = 1;
  submitting = false;

  constructor(private api: ApiService, private toast: ToastService) {}

  get stepValid() {
    if (this.step === 1) return this.type === BookType.Collection || this.type === BookType.Return;
    if (this.step === 2) return Number.isInteger(Number(this.count)) && this.count >= 1 && this.count <= 200;
    return Number.isInteger(Number(this.firstSerialStart)) && this.firstSerialStart > 0;
  }

  get preview() {
    const lastStart = this.firstSerialStart + (this.count - 1) * 50;
    const lastEnd = lastStart + 49;
    return `سيتم إنشاء ${this.count} دفاتر: من #1 (${this.firstSerialStart}-${this.firstSerialStart + 49}) إلى #${this.count} (${lastStart}-${lastEnd})`;
  }

  async submit() {
    if (!this.type || !this.stepValid || this.submitting) return;
    this.submitting = true;
    try {
      await this.api.bulkCreateBooks({
        type: this.type,
        firstSerialStart: Number(this.firstSerialStart),
        count: Number(this.count),
      });
      this.toast.show('تم إنشاء الدفاتر بنجاح', 'success');
      this.step = 1;
      this.type = null;
      this.count = 1;
      this.firstSerialStart = 1;
    } finally {
      this.submitting = false;
    }
  }
}
