import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PaginatedResponse } from '../core/models';

@Component({
  selector: 'app-pagination',
  standalone: true,
  template: `
    @if (page && page.totalPages > 1) {
      <nav class="flex flex-col items-center justify-between gap-3 border-t border-slate-200 pt-4 sm:flex-row">
        <p class="text-sm text-slate-500">
          صفحة {{ page.pageNumber }} من {{ page.totalPages }} · {{ page.totalCount }} عنصر
        </p>
        <div class="flex flex-wrap items-center justify-center gap-1.5">
          <button class="page-btn" [disabled]="!page.hasPreviousPage" (click)="change.emit(page.pageNumber - 1)">
            السابق
          </button>
          @if (pages[0] > 1) {
            <button class="page-btn" (click)="change.emit(1)">1</button>
            @if (pages[0] > 2) {
              <span class="px-2 text-slate-400">...</span>
            }
          }
          @for (item of pages; track item) {
            <button
              class="page-btn"
              [class.page-btn-active]="item === page.pageNumber"
              [disabled]="item === page.pageNumber"
              (click)="change.emit(item)"
            >
              {{ item }}
            </button>
          }
          @if (pages[pages.length - 1] < page.totalPages) {
            @if (pages[pages.length - 1] < page.totalPages - 1) {
              <span class="px-2 text-slate-400">...</span>
            }
            <button class="page-btn" (click)="change.emit(page.totalPages)">{{ page.totalPages }}</button>
          }
          <button class="page-btn" [disabled]="!page.hasNextPage" (click)="change.emit(page.pageNumber + 1)">
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

  get pages() {
    if (!this.page) return [];
    const start = Math.max(1, this.page.pageNumber - 2);
    const end = Math.min(this.page.totalPages, this.page.pageNumber + 2);
    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  }
}
