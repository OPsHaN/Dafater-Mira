import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../core/api.service';
import { BOOK_STATUS_LABELS, BookStatus } from '../../core/models';
import { StateBlockComponent } from '../../shared/state-block.component';

@Component({
  standalone: true,
  imports: [StateBlockComponent],
  template: `
    <div class="mb-5">
      <h2 class="text-xl font-black">ملخص الدفاتر</h2>
      <p class="text-sm text-slate-500">نظرة سريعة على إجمالي الدفاتر حسب الحالة.</p>
    </div>
    @if (loading) {
      <app-state-block title="جاري تحميل الملخص" icon="⏳" />
    } @else if (error) {
      <app-state-block title="تعذر تحميل الملخص" icon="!" (retry)="load()" />
    } @else {
      <section class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <article class="panel">
          <p class="text-sm font-bold text-slate-500">إجمالي الدفاتر</p>
          <strong class="mt-3 block text-4xl text-slate-950">{{ total }}</strong>
        </article>
        @for (item of cards; track item.status) {
          <article class="panel">
            <p class="text-sm font-bold text-slate-500">{{ item.label }}</p>
            <strong class="mt-3 block text-4xl text-teal-800">{{ item.count }}</strong>
          </article>
        }
      </section>
    }
  `,
})
export class DashboardComponent implements OnInit {
  loading = true;
  error = false;
  total = 0;
  cards: { status: BookStatus; label: string; count: number }[] = [];

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.load();
  }

  async load() {
    this.loading = true;
    this.error = false;
    try {
      const all = await this.api.getBooks({ pageNumber: 1, pageSize: 1 });
      this.total = all.totalCount;
      this.cards = await Promise.all(
        Object.entries(BOOK_STATUS_LABELS).map(async ([status, label]) => {
          const result = await this.api.getBooks({ status: Number(status), pageNumber: 1, pageSize: 1 });
          return { status: Number(status) as BookStatus, label, count: result.totalCount };
        }),
      );
    } catch {
      this.error = true;
    } finally {
      this.loading = false;
    }
  }
}
