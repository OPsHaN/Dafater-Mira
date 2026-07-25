import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../core/api.service';
import {
  Book,
  BOOK_STATUS_LABELS,
  BOOK_TYPE_LABELS,
  BookStatus,
  BookType,
  Distributor,
  PaginatedResponse,
  UserRole,
} from '../core/models';
import { ToastService } from '../core/toast.service';
import { PaginationComponent } from './pagination.component';
import { StateBlockComponent } from './state-block.component';
import { StatusBadgeComponent } from './status-badge.component';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-books-table',
  standalone: true,
  imports: [FormsModule, PaginationComponent, StateBlockComponent, StatusBadgeComponent, NgClass],
  template: `
    @if (showFilters) {
      <section class="panel mb-5 grid gap-3 md:grid-cols-4">
        <label>
          <span class="label">النوع</span>
          <select class="field" [(ngModel)]="filters.type" (ngModelChange)="updateFilters()">
            <option value="">الكل</option>
            <option [value]="type.Collection">تحصيل</option>
            <option [value]="type.Return">مرتجع</option>
          </select>
        </label>
        <label>
          <span class="label">الحالة</span>
          <select class="field" [(ngModel)]="filters.status" (ngModelChange)="updateFilters()">
            <option value="">الكل</option>
            @for (item of statusOptions; track item.value) {
              <option [value]="item.value">{{ item.label }}</option>
            }
          </select>
        </label>
        <label>
          <span class="label">الموزع</span>
          <select
            class="field"
            [(ngModel)]="filters.distributorId"
            (ngModelChange)="updateFilters()"
          >
            <option value="">الكل</option>
            @for (distributor of distributors; track distributor.id) {
              <option [value]="distributor.id">{{ distributor.name }}</option>
            }
          </select>
        </label>
        <label>
          <span class="label">حجم الصفحة</span>
          <select class="field" [(ngModel)]="filters.pageSize" (ngModelChange)="updateFilters()">
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </label>
      </section>
      @if (role === userRole.Admin && distributorsUnavailable) {
        <div
          class="mb-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-lg font-semibold text-amber-900"
        >
          قائمة الموزعين غير متاحة من صلاحيات المدير في السيرفر، لذلك تم إخفاء اختيارات التعيين
          والنقل مؤقتًا.
        </div>
      }
    }

    @if (loading) {
      <app-state-block title="جاري تحميل الدفاتر" icon="⏳" />
    } @else if (error) {
      <app-state-block title="تعذر تحميل الدفاتر" icon="!" (retry)="load()" />
    } @else if (!page?.items?.length) {
      <app-state-block title="لا توجد دفاتر بعد" icon="📚" />
    } @else {
      <div class="table-wrap">
        <div class="w-full max-w-full overflow-hidden">
          <table class="data-table w-full max-w-full border-collapse">
            <thead>
              <tr class="border-b-2 border-slate-100 bg-slate-100">
                <th
                  class="border-l border-slate-200 px-4 py-4 text-center !text-lg !font-black !text-slate-900"
                >
                  النوع
                </th>

                <th
                  class="border-l border-slate-200 px-4 py-4 text-center !text-lg !font-black !text-slate-900"
                >
                  السيريال
                </th>

                <th
                  class="border-l border-slate-200 px-4 py-4 text-center !text-lg !font-black !text-slate-900"
                >
                  الحالة
                </th>

                <th
                  class="border-l border-slate-200 px-4 py-4 text-center !text-lg !font-black !text-slate-900"
                >
                  الموزع
                </th>

                <th
                  class="border-l border-slate-200 px-4 py-4 text-center !text-lg !font-black !text-slate-900"
                >
                  تاريخ التسليم
                </th>

                <th
                  class="border-l border-slate-200 px-4 py-4 text-center !text-lg !font-black !text-slate-900"
                >
                  تاريخ الاستلام
                </th>

                <th
                  class="border-l border-slate-200 px-4 py-4 text-center !text-lg !font-black !text-slate-900"
                  [class.border-l]="!readonly"
                  [class.border-slate-200]="!readonly"
                >
                  الملاحظات
                </th>

                @if (!readonly) {
                  <th class="px-4 py-4 text-center !text-lg !font-black !text-slate-900">
                    الإجراءات
                  </th>
                }
              </tr>
            </thead>

            <tbody class="divide-y divide-slate-200">
              @for (book of page!.items; track book.id) {
                <tr
                  class="text-base transition-colors"
                  [ngClass]="{
                    'bg-slate-50 hover:bg-slate-100': book.status === status.NotAssigned,

                    'bg-amber-50 hover:bg-amber-100': book.status === status.AssignedToDistributor,

                    'bg-orange-50 hover:bg-orange-100': book.status === status.WaitingForCash,

                    'bg-blue-50 hover:bg-blue-100': book.status === status.CashReceived,

                    'bg-emerald-50 hover:bg-emerald-100': book.status === status.FullyCollected,
                  }"
                >
                  <!-- النوع -->
                  <td
                    class="border-l border-slate-200 px-6 py-5 text-base font-bold text-slate-800"
                  >
                    {{ typeLabel(book.type) }}
                  </td>

                  <!-- السيريال -->
                  <td
                    dir="ltr"
                    class="border-l border-slate-200 px-6 py-5 text-base font-semibold text-slate-700"
                  >
                    #{{ book.serialStart }} - #{{ book.serialEnd }}
                  </td>

                  <!-- الحالة -->
                  <td class="border-l border-slate-200 px-6 py-5 text-xl font-black text-slate-800 text-center">
                    <app-status-badge [status]="book.status" />
                  </td>

                  <!-- الموزع -->
                  <td class="border-l border-slate-200 px-6 py-5 text-lg font-bold text-slate-800">
                    {{ book.distributorName || 'غير معين' }}
                  </td>

                  <!-- تاريخ التسليم -->
                  <td
                    class="border-l border-slate-200 px-6 py-5 text-base font-medium text-slate-700"
                  >
                    {{ formatDate(book.deliveryDate) }}
                  </td>

                  <!-- تاريخ الاستلام -->
                  <td
                    class="border-l border-slate-200 px-6 py-5 text-base font-medium text-slate-700"
                  >
                    @if (!readonly && book.deliveryDate && canWriteLocked(book)) {
                      <input
                        class="field min-w-52 text-base"
                        type="datetime-local"
                        [ngModel]="toLocalInput(book.receivedDate)"
                        (change)="setReceived(book, $any($event.target).value)"
                      />
                    } @else {
                      {{ formatDate(book.receivedDate) }}
                    }
                  </td>

                  <!-- الملاحظات -->
                  <td class="border-l border-slate-200 px-6 py-5 text-base">
                    @if (noteOpenId === book.id && !readonly) {
                      <textarea
                        class="field min-h-24 text-base"
                        maxlength="500"
                        [(ngModel)]="draftNote"
                      ></textarea>

                      <div class="mt-2 flex gap-2">
                        <button
                          class="btn-primary text-base"
                          type="button"
                          [disabled]="busyId === book.id"
                          (click)="saveNote(book)"
                        >
                          حفظ
                        </button>

                        <button
                          class="btn-secondary text-base"
                          type="button"
                          (click)="noteOpenId = null"
                        >
                          إلغاء
                        </button>
                      </div>
                    } @else {
                      <p class="max-w-72 whitespace-pre-wrap text-base font-medium text-slate-700">
                        {{ book.notes || 'لا توجد ملاحظات' }}
                      </p>

                      @if (!readonly) {
                        <button
                          class="mt-2 text-base font-bold text-teal-700 transition hover:text-teal-800"
                          type="button"
                          (click)="openNote(book)"
                        >
                          {{ book.notes ? 'تعديل الملاحظة' : 'إضافة ملاحظة' }}
                        </button>
                      }
                    }
                  </td>

                  <!-- الإجراءات -->
                  @if (!readonly) {
                    <td class="px-6 py-5 text-base">
                      <div class="flex flex-wrap items-center gap-2">
                        @if (
                          book.status === status.NotAssigned &&
                          canWriteLocked(book) &&
                          distributors.length
                        ) {
                          <select
                            class="field w-44 text-base"
                            [disabled]="busyId === book.id"
                            (change)="assign(book, $any($event.target).value)"
                          >
                            <option value="">تعيين لموزع</option>

                            @for (d of distributors; track d.id) {
                              <option [value]="d.id">
                                {{ d.name }}
                              </option>
                            }
                          </select>
                        }

                        @if (book.distributorId && canWriteLocked(book) && distributors.length) {
                          <select
                            class="field w-44 text-base"
                            [disabled]="busyId === book.id"
                            (change)="transfer(book, $any($event.target).value)"
                          >
                            <option value="">نقل لموزع</option>

                            @for (d of distributors; track d.id) {
                              <option [value]="d.id">
                                {{ d.name }}
                              </option>
                            }
                          </select>
                        }

                        @if (
                          book.status === status.FullyCollected && role === userRole.Accountant
                        ) {
                          <span
                            class="rounded-md bg-emerald-100 px-3 py-2 text-base font-bold text-emerald-800"
                          >
                            🔒 مكتمل
                          </span>
                        } @else {
                          <select
                            class="field w-44 text-base"
                            [disabled]="
                              busyId === book.id ||
                              (!book.distributorId && book.status !== status.NotAssigned)
                            "
                            [ngModel]="book.status"
                            (ngModelChange)="changeStatus(book, $event)"
                          >
                            @for (item of statusOptions; track item.value) {
                              <option [ngValue]="item.value">
                                {{ item.label }}
                              </option>
                            }
                          </select>
                        }

                        @if (role === userRole.Admin) {
                          <button
                            class="btn-secondary text-base"
                            type="button"
                            (click)="editSerial(book)"
                            [disabled]="busyId === book.id"
                          >
                            تعديل السيريال
                          </button>

                          <button
                            class="btn-danger text-base"
                            type="button"
                            (click)="deleteBook(book)"
                            [disabled]="busyId === book.id"
                          >
                            حذف
                          </button>
                        }
                      </div>
                    </td>
                  }
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
      <div class="mt-4">
        <app-pagination [page]="page" (change)="goToPage($event)" />
      </div>
    }
  `,
})
export class BooksTableComponent implements OnInit {
  @Input() role: UserRole = UserRole.Accountant;
  @Input() readonly = false;
  @Input() showFilters = true;

  readonly type = BookType;
  readonly status = BookStatus;
  readonly userRole = UserRole;
  readonly statusOptions = Object.entries(BOOK_STATUS_LABELS).map(([value, label]) => ({
    value: Number(value),
    label,
  }));

  page: PaginatedResponse<Book> | null = null;
  distributors: Distributor[] = [];
  distributorsUnavailable = false;
  loading = true;
  error = false;
  busyId: number | null = null;
  noteOpenId: number | null = null;
  draftNote = '';
  filters = { type: '', status: '', distributorId: '', pageNumber: 1, pageSize: '20' };

  constructor(
    private api: ApiService,
    private route: ActivatedRoute,
    private router: Router,
    private toast: ToastService,
  ) {}

  ngOnInit() {
    this.route.queryParamMap.subscribe((params) => {
      this.filters = {
        type: params.get('type') ?? '',
        status: params.get('status') ?? '',
        distributorId: params.get('distributorId') ?? '',
        pageNumber: Number(params.get('pageNumber') ?? 1),
        pageSize: params.get('pageSize') ?? '20',
      };
      this.load();
    });
    if (!this.readonly) this.loadDistributors();
  }

  async load() {
    this.loading = true;
    this.error = false;
    try {
      this.page = this.readonly
        ? await this.api.getMyBooks({
            pageNumber: this.filters.pageNumber,
            pageSize: this.filters.pageSize,
          })
        : await this.api.getBooks(this.filters);
    } catch {
      this.error = true;
    } finally {
      this.loading = false;
    }
  }

  async loadDistributors() {
    try {
      const result = await this.api.getDistributors(
        { pageNumber: 1, pageSize: 100 },
        this.role === UserRole.Admin,
      );
      this.distributors = result.items;
      this.distributorsUnavailable = false;
    } catch {
      this.distributors = [];
      this.distributorsUnavailable = this.role === UserRole.Admin;
    }
  }

  updateFilters() {
    this.goToPage(1);
  }

  goToPage(pageNumber: number) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { ...this.filters, pageNumber },
      queryParamsHandling: 'merge',
    });
  }

  canWriteLocked(book: Book) {
    return this.role === UserRole.Accountant || book.status !== BookStatus.FullyCollected;
  }

  typeLabel(type: BookType) {
    return BOOK_TYPE_LABELS[type];
  }

  formatDate(value: string | null) {
    return value
      ? new Intl.DateTimeFormat('ar-EG', { dateStyle: 'medium', timeStyle: 'short' }).format(
          new Date(value),
        )
      : '-';
  }

  toLocalInput(value: string | null) {
    if (!value) return '';
    const date = new Date(value);
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return date.toISOString().slice(0, 16);
  }

  async assign(book: Book, distributorId: string) {
    if (!distributorId) return;
    await this.run(book.id, async () => {
      await this.api.assignBook(book.id, Number(distributorId));
      this.toast.show('تم تعيين الدفتر', 'success');
    });
  }

  async transfer(book: Book, distributorId: string) {
    if (!distributorId || Number(distributorId) === book.distributorId) return;
    await this.run(book.id, async () => {
      await this.api.transferBook(book.id, Number(distributorId));
      this.toast.show('تم نقل الدفتر', 'success');
    });
  }

  async changeStatus(book: Book, newStatus: number) {
    if (!book.distributorId && Number(newStatus) !== BookStatus.NotAssigned) {
      this.toast.show('لا يمكن تغيير الحالة قبل تعيين موزع', 'error');
      return;
    }
    await this.run(book.id, async () => {
      await this.api.changeBookStatus(book.id, Number(newStatus));
      this.toast.show('تم تغيير الحالة', 'success');
    });
  }

  async setReceived(book: Book, localValue: string) {
    if (!localValue || !book.deliveryDate) return;
    const received = new Date(localValue);
    if (received < new Date(book.deliveryDate)) {
      this.toast.show('تاريخ الاستلام لا يمكن أن يكون قبل تاريخ التسليم', 'error');
      return;
    }
    await this.run(book.id, async () => {
      await this.api.setReceivedDate(book.id, received.toISOString());
      this.toast.show('تم حفظ تاريخ الاستلام', 'success');
    });
  }

  openNote(book: Book) {
    this.noteOpenId = book.id;
    this.draftNote = book.notes ?? '';
  }

  async saveNote(book: Book) {
    if (this.draftNote.length > 500) {
      this.toast.show('الملاحظة لا تزيد عن 500 حرف', 'error');
      return;
    }
    await this.run(book.id, async () => {
      await this.api.setBookNote(book.id, this.draftNote.trim() ? this.draftNote : null);
      this.noteOpenId = null;
      this.toast.show('تم حفظ الملاحظة', 'success');
    });
  }

  async editSerial(book: Book) {
    const value = prompt('أدخل بداية السيريال الجديدة', String(book.serialStart));
    if (!value) return;
    const serial = Number(value);
    if (!Number.isInteger(serial) || serial <= 0) {
      this.toast.show('بداية السيريال يجب أن تكون رقم أكبر من صفر', 'error');
      return;
    }
    await this.run(book.id, async () => {
      await this.api.updateBookSerial(book.id, serial);
      this.toast.show('تم تعديل السيريال', 'success');
    });
  }

  async deleteBook(book: Book) {
    if (!confirm('حذف الدفتر إجراء نهائي. هل تريد المتابعة؟')) return;
    await this.run(book.id, async () => {
      await this.api.deleteBook(book.id);
      this.toast.show('تم حذف الدفتر', 'success');
    });
  }

  private async run(bookId: number, action: () => Promise<void>) {
    this.busyId = bookId;
    try {
      await action();
      await this.load();
    } finally {
      this.busyId = null;
    }
  }
}
