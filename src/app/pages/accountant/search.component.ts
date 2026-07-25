import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { Book } from '../../core/models';
import { StateBlockComponent } from '../../shared/state-block.component';
import { StatusBadgeComponent } from '../../shared/status-badge.component';

@Component({
  standalone: true,
  imports: [FormsModule, StateBlockComponent, StatusBadgeComponent],
  template: `
    <section class="panel max-w-2xl">
      <h2 class="text-xl font-black">بحث برقم الإيصال</h2>
      <div class="mt-4 flex flex-col gap-2 sm:flex-row">
        <input class="field" type="number" min="1" [(ngModel)]="receiptNumber" placeholder="رقم الإيصال" />
        <button class="btn-primary" type="button" [disabled]="loading || receiptNumber <= 0" (click)="search()">
          {{ loading ? 'جاري البحث...' : 'بحث' }}
        </button>
      </div>
    </section>

    <div class="mt-5">
      @if (notFound) {
        <app-state-block title="لا يوجد دفتر يحتوي رقم الإيصال" icon="🔎" />
      }
      @if (book) {
        <article class="panel max-w-2xl">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p class="text-sm text-slate-500">نطاق الدفتر</p>
              <h3 class="text-2xl font-black" dir="ltr">#{{ book.serialStart }} - #{{ book.serialEnd }}</h3>
            </div>
            <app-status-badge [status]="book.status" />
          </div>
          <dl class="mt-5 grid gap-3 text-sm sm:grid-cols-2">
            <div><dt class="font-bold text-slate-500">الموزع</dt><dd>{{ book.distributorName || 'غير معين' }}</dd></div>
            <div><dt class="font-bold text-slate-500">ملاحظات</dt><dd>{{ book.notes || 'لا توجد' }}</dd></div>
          </dl>
        </article>
      }
    </div>
  `,
})
export class SearchComponent {
  receiptNumber = 1;
  loading = false;
  notFound = false;
  book: Book | null = null;

  constructor(private api: ApiService) {}

  async search() {
    this.loading = true;
    this.notFound = false;
    this.book = null;
    try {
      this.book = await this.api.searchBook(Number(this.receiptNumber));
    } catch (error: any) {
      if (error?.response?.status === 404) this.notFound = true;
    } finally {
      this.loading = false;
    }
  }
}
