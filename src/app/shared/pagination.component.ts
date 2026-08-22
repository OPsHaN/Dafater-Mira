import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PaginatedResponse } from '../core/models';

@Component({
  selector: 'app-pagination',
  standalone: true,
  template: `
    @if (page && page.totalPages > 1) {
      <nav
        class="flex flex-col items-center justify-between gap-3 border-t border-slate-200 pt-4 sm:flex-row"
      >
        <p class="text-sm text-slate-500">
          صفحة {{ displayPageNumber }} من {{ page.totalPages }}
          · {{ page.totalCount }} عنصر
        </p>

        <div class="flex flex-wrap items-center justify-center gap-1.5">

          <!-- السابق -->
          <button
            class="page-btn"
            [disabled]="displayPageNumber >= page.totalPages"
            (click)="goToDisplayPage(displayPageNumber + 1)"
          >
            السابق
          </button>

          <!-- أول صفحة -->
          @if (pages[0] > 1) {
            <button
              class="page-btn"
              (click)="goToDisplayPage(1)"
            >
              1
            </button>

            @if (pages[0] > 2) {
              <span class="px-2 text-slate-400">...</span>
            }
          }

          <!-- أرقام الصفحات -->
          @for (item of pages; track item) {
            <button
              class="page-btn"
              [class.page-btn-active]="item === displayPageNumber"
              [disabled]="item === displayPageNumber"
              (click)="goToDisplayPage(item)"
            >
              {{ item }}
            </button>
          }

          <!-- آخر صفحة -->
          @if (pages[pages.length - 1] < page.totalPages) {
            @if (pages[pages.length - 1] < page.totalPages - 1) {
              <span class="px-2 text-slate-400">...</span>
            }

            <button
              class="page-btn"
              (click)="goToDisplayPage(page.totalPages)"
            >
              {{ page.totalPages }}
            </button>
          }

          <!-- التالي -->
          <button
            class="page-btn"
            [disabled]="displayPageNumber <= 1"
            (click)="goToDisplayPage(displayPageNumber - 1)"
          >
            التالي
          </button>

        </div>
      </nav>
    }
  `,
})
export class PaginationComponent<T> {
  @Input() page: PaginatedResponse<T> | null = null;
  @Output() change = new EventEmitter<number>();


  get displayPageNumber(): number {
    if (!this.page) return 1;

    return this.page.totalPages - this.page.pageNumber + 1;
  }

  /**
   * الصفحات المعروضة حول الصفحة الحالية
   */
  get pages(): number[] {
    if (!this.page) return [];

    const current = this.displayPageNumber;

    const start = Math.max(1, current - 2);
    const end = Math.min(this.page.totalPages, current + 2);

    return Array.from(
      { length: end - start + 1 },
      (_, index) => start + index
    );
  }

  /**
   * تحويل رقم الصفحة من UI إلى رقم الصفحة الحقيقي للـ API
   */
  goToDisplayPage(displayPage: number) {
    if (!this.page) return;

    const apiPageNumber =
      this.page.totalPages - displayPage + 1;

    this.change.emit(apiPageNumber);
  }
}