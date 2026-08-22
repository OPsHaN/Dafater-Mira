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

    @if (!loading && !error && page?.items?.length) {
      <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex flex-wrap items-center gap-2">
          @if (role === userRole.Admin && selectedBookIds.size) {
            <button
              class="btn-danger"
              type="button"
              [disabled]="bulkBusy"
              (click)="deleteSelected()"
            >
              {{ bulkBusy ? 'جاري الحذف...' : 'حذف المحدد (' + selectedBookIds.size + ')' }}
            </button>
          }
        </div>
              <button class="btn-secondary" type="button" [disabled]="exportBusy" (click)="exportBooks()">
          {{ exportBusy ? 'جاري التحميل...' : 'تحميل الدفاتر كإكسيل' }}
        </button>

      </div>

      <div class="my-3">
        <app-pagination [page]="page" (change)="goToPage($event)" />
      </div>
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
                @if (role === userRole.Admin) {
                  <th
                    class="border-l border-slate-200 px-4 py-4 text-center !text-lg !font-black !text-slate-900"
                  >
                    <input
                      type="checkbox"
                      [checked]="isAllSelected()"
                      (change)="toggleSelectAll($any($event.target).checked)"
                    />
                  </th>
                }

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
                  التصنيف
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
                  @if (role === userRole.Admin) {
                    <td class="border-l border-slate-200 px-6 py-5 text-center">
                      <input
                        type="checkbox"
                        [checked]="selectedBookIds.has(book.id)"
                        (change)="toggleSelection(book.id, $any($event.target).checked)"
                      />
                    </td>
                  }

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
                  <td
                    class="border-l border-slate-200 px-6 py-5 text-xl font-black text-slate-800 text-center"
                  >
                    <app-status-badge [status]="book.status" />
                  </td>

                  <!-- التصنيف -->
                  <td
                    class="border-l border-slate-200 px-6 py-5 text-base font-bold text-slate-800 text-center"
                  >
                    {{ book.status === status.FullyCollected ? 'مكتمل' : 'غير مكتمل' }}
                  </td>

                  <!-- الموزع -->
                  <td class="border-l border-slate-200 px-6 py-5 text-lg font-bold text-slate-800">
                    {{ book.distributorName || 'غير معين' }}
                  </td>

                  <!-- تاريخ التسليم -->
                  <td
                    class="border-l border-slate-200 px-6 py-5 text-base font-medium text-slate-700"
                  >
                    @if (!book.distributorId) {
                      <span class="text-slate-400">غير معين</span>
                    } @else if (!readonly && canWriteLocked(book)) {
                      <div class="flex flex-col gap-2">
                        @if (!book.deliveryDate) {
                          <span class="font-bold text-amber-600"> لم يتم تسجيل تاريخ التسليم </span>
                        }

                        <input
                          class="field min-w-52 text-base"
                          type="date"
                          [ngModel]="
                            deliveryDateDrafts.get(book.id) ?? toLocalInput(book.deliveryDate)
                          "
                          [disabled]="busyId === book.id"
                          (ngModelChange)="deliveryDateDrafts.set(book.id, $event)"
                        />

                        <button
                          class="btn-primary w-fit text-base"
                          type="button"
                          [disabled]="busyId === book.id || !deliveryDateDrafts.get(book.id)"
                          (click)="saveDeliveryDate(book)"
                        >
                          {{ busyId === book.id ? 'جاري الحفظ...' : 'حفظ تاريخ التسليم' }}
                        </button>
                      </div>
                    } @else {
                      {{ formatDate(book.deliveryDate) }}
                    }
                  </td>

                  <!-- تاريخ الاستلام -->
                  <td
                    class="border-l border-slate-200 px-6 py-5 text-base font-medium text-slate-700"
                  >
                    @if (!readonly && book.deliveryDate && canWriteLocked(book)) {
                      <div class="flex flex-col gap-2">
                        <input
                          class="field min-w-52 text-base"
                          type="date"
                          [ngModel]="
                            receivedDateDrafts.get(book.id) ?? toLocalInput(book.receivedDate)
                          "
                          [disabled]="busyId === book.id"
                          (ngModelChange)="receivedDateDrafts.set(book.id, $event)"
                        />

                        <button
                          class="btn-primary w-fit text-base"
                          type="button"
                          [disabled]="busyId === book.id || !receivedDateDrafts.get(book.id)"
                          (click)="saveReceivedDate(book)"
                        >
                          {{ busyId === book.id ? 'جاري الحفظ...' : 'حفظ تاريخ الاستلام' }}
                        </button>
                      </div>
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
  private initialized = false;
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
  bulkBusy = false;
  exportBusy = false;
  selectedBookIds = new Set<number>();
  noteOpenId: number | null = null;
  draftNote = '';
  filters = { type: '', status: '', distributorId: '', pageNumber: 1, pageSize: '20' };
  deliveryDateDrafts = new Map<number, string>();
  receivedDateDrafts = new Map<number, string>();
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

    this.sortBooks();
    this.selectedBookIds.clear();
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

private formatDateForApi(value: string): string {
  return `${value}T00:00:00`;
}

async saveDeliveryDate(book: Book) {
  const localValue = this.deliveryDateDrafts.get(book.id);

  if (!localValue) {
    this.toast.show('اختر تاريخ التسليم أولًا', 'error');
    return;
  }

  if (!book.distributorId) {
    this.toast.show('لا يمكن تسجيل تاريخ التسليم قبل تعيين موزع', 'error');
    return;
  }

  const deliveryDate = new Date(`${localValue}T00:00:00`);

  if (Number.isNaN(deliveryDate.getTime())) {
    this.toast.show('تاريخ التسليم غير صحيح', 'error');
    return;
  }

  if (book.receivedDate && deliveryDate > new Date(book.receivedDate)) {
    this.toast.show('تاريخ التسليم لا يمكن أن يكون بعد تاريخ الاستلام', 'error');
    return;
  }

  await this.run(book.id, async () => {
    await this.api.updateBookDeliveryDate(
      book.id,
      this.formatDateForApi(localValue),
    );

    this.deliveryDateDrafts.delete(book.id);

    this.toast.show('تم حفظ تاريخ التسليم بنجاح', 'success');
  });
}

 async saveReceivedDate(book: Book) {
  const localValue = this.receivedDateDrafts.get(book.id);

  if (!localValue) {
    this.toast.show('اختر تاريخ الاستلام أولًا', 'error');
    return;
  }

  if (!book.deliveryDate) {
    this.toast.show('لا يمكن تسجيل تاريخ الاستلام قبل تاريخ التسليم', 'error');
    return;
  }

  const receivedDate = new Date(`${localValue}T00:00:00`);

  if (Number.isNaN(receivedDate.getTime())) {
    this.toast.show('تاريخ الاستلام غير صحيح', 'error');
    return;
  }

  if (receivedDate < new Date(book.deliveryDate)) {
    this.toast.show('تاريخ الاستلام لا يمكن أن يكون قبل تاريخ التسليم', 'error');
    return;
  }

  await this.run(book.id, async () => {
    await this.api.setReceivedDate(
      book.id,
      this.formatDateForApi(localValue),
    );

    this.receivedDateDrafts.delete(book.id);

    this.toast.show('تم حفظ تاريخ الاستلام بنجاح', 'success');
  });
}

async updateFilters() {
  try {
    // نجيب الصفحة الأولى فقط لمعرفة إجمالي الصفحات
    const firstPage = this.readonly
      ? await this.api.getMyBooks({
          pageNumber: 1,
          pageSize: this.filters.pageSize,
        })
      : await this.api.getBooks({
          ...this.filters,
          pageNumber: 1,
        });

    // نذهب لآخر صفحة في الـ API
    await this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        ...this.filters,
        pageNumber: firstPage.totalPages,
      },
      queryParamsHandling: 'merge',
    });
  } catch {
    this.toast.show('تعذر تحديث الفلاتر', 'error');
  }
}
  

goToPage(apiPageNumber: number) {
  this.router.navigate([], {
    relativeTo: this.route,
    queryParams: {
      ...this.filters,
      pageNumber: apiPageNumber,
    },
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
    ? new Intl.DateTimeFormat('ar-EG', { dateStyle: 'medium' }).format(new Date(value))
    : '-';
}

toLocalInput(value: string | null) {
  if (!value) return '';
  const date = new Date(value);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 10); // ⬅️ "2026-08-21" بس
}

  async assign(book: Book, distributorId: string) {
    if (!distributorId) return;
    await this.run(
      book.id,
      async () => {
        const updated = await this.api.assignBook(book.id, Number(distributorId));
        Object.assign(book, updated);
        this.sortBooks();
        this.toast.show('تم تعيين الدفتر', 'success');
      },
      false,
    );
  }

  async transfer(book: Book, distributorId: string) {
    if (!distributorId || Number(distributorId) === book.distributorId) return;
    await this.run(
      book.id,
      async () => {
        const updated = await this.api.transferBook(book.id, Number(distributorId));
        Object.assign(book, updated);
        this.toast.show('تم نقل الدفتر', 'success');
      },
      false,
    );
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

  async setDeliveryDate(book: Book, localValue: string) {
    if (!localValue) return;
    if (!book.distributorId) {
      this.toast.show('لا يمكن تسجيل تاريخ التسليم قبل تعيين موزع', 'error');
      return;
    }
    const deliveryDate = new Date(localValue);
    if (book.receivedDate && deliveryDate > new Date(book.receivedDate)) {
      this.toast.show('تاريخ التسليم لا يمكن أن يكون بعد تاريخ الاستلام', 'error');
      return;
    }
    await this.run(
      book.id,
      async () => {
        const updated = await this.api.updateBookDeliveryDate(book.id, deliveryDate.toISOString());
        Object.assign(book, updated);
        this.toast.show('تم تعديل تاريخ التسليم', 'success');
      },
      false,
    );
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
    await this.run(
      book.id,
      async () => {
        const updated = await this.api.updateBookSerial(book.id, serial);
        Object.assign(book, updated);
        this.sortBooks();
        this.toast.show('تم تعديل السيريال', 'success');
      },
      false,
    );
  }

  async deleteBook(book: Book) {
    if (!confirm('حذف الدفتر إجراء نهائي. هل تريد المتابعة؟')) return;
    await this.run(
      book.id,
      async () => {
        await this.api.deleteBook(book.id);
        if (this.page) {
          this.page.items = this.page.items.filter((item) => item.id !== book.id);
        }
        this.selectedBookIds.delete(book.id);
        this.toast.show('تم حذف الدفتر', 'success');
      },
      false,
    );
  }

  async deleteSelected() {
    if (!this.selectedBookIds.size) return;
    if (!confirm(`حذف ${this.selectedBookIds.size} دفاتر إجراء نهائي. هل تريد المتابعة؟`)) return;
    this.bulkBusy = true;
    try {
      const selected = Array.from(this.selectedBookIds);
      await this.api.bulkDeleteBooks(selected);
      if (this.page) {
        this.page.items = this.page.items.filter((item) => !this.selectedBookIds.has(item.id));
      }
      this.selectedBookIds.clear();
      this.toast.show('تم حذف الدفاتر المحددة', 'success');
    } catch {
      this.toast.show('تعذر حذف الدفاتر المحددة', 'error');
    } finally {
      this.bulkBusy = false;
    }
  }

  toggleSelection(bookId: number, selected: boolean) {
    if (selected) {
      this.selectedBookIds.add(bookId);
    } else {
      this.selectedBookIds.delete(bookId);
    }
  }

  isAllSelected() {
    return (
      !!this.page?.items?.length &&
      this.page.items.every((item) => this.selectedBookIds.has(item.id))
    );
  }

  toggleSelectAll(select: boolean) {
    if (!this.page) return;
    this.page.items.forEach((item) => {
      if (select) {
        this.selectedBookIds.add(item.id);
      } else {
        this.selectedBookIds.delete(item.id);
      }
    });
  }

  async exportBooks() {
    if (this.exportBusy) return;
    this.exportBusy = true;
    try {
      const books = await this.fetchAllBooks();
      this.downloadCsv(books);
    } catch {
      this.toast.show('تعذر تنزيل الدفاتر', 'error');
    } finally {
      this.exportBusy = false;
    }
  }

  private async fetchAllBooks() {
    const all: Book[] = [];
    let pageNumber = 1;
    const pageSize = 200;
    while (true) {
      const result = this.readonly
        ? await this.api.getMyBooks({ pageNumber, pageSize })
        : await this.api.getBooks({ ...this.filters, pageNumber, pageSize });
      all.push(...result.items);
      if (!result.hasNextPage) {
        break;
      }
      pageNumber += 1;
    }
    return all;
  }

  private downloadCsv(books: Book[]) {
    const headers = [
      'نوع',
      'بداية السيريال',
      'نهاية السيريال',
      'الحالة',
      'مكتمل',
      'الموزع',
      'تاريخ التسليم',
      'تاريخ الاستلام',
      'ملاحظات',
    ];
    const rows = books.map((book) => [
      this.typeLabel(book.type),
      book.serialStart,
      book.serialEnd,
      BOOK_STATUS_LABELS[book.status],
      book.status === BookStatus.FullyCollected ? 'نعم' : 'لا',
      book.distributorName || '',
      book.deliveryDate ? new Date(book.deliveryDate).toISOString() : '',
      book.receivedDate ? new Date(book.receivedDate).toISOString() : '',
      book.notes?.replace(/[\r\n]+/g, ' ') ?? '',
    ]);
const csv = [headers, ...rows]
  .map((row) =>
    row
      .map((field) => `"${String(field).replace(/"/g, '""')}"`)
      .join(',')
  )
  .join('\r\n');

const BOM = '\uFEFF';

const blob = new Blob(
  [BOM + csv],
  { type: 'text/csv;charset=utf-8;' }
);

const url = URL.createObjectURL(blob);
const link = document.createElement('a');

link.href = url;
link.download = 'books-export.csv';
link.click();

URL.revokeObjectURL(url);
  }

private sortBooks() {
  if (this.page?.items?.length) {
    // ترتيب تصاعدي: السيريال الأصغر يظهر أولًا
    this.page.items.sort((a, b) => a.serialStart - b.serialStart);
  }
}

  private async run(bookId: number, action: () => Promise<void>, reload = true) {
    this.busyId = bookId;
    try {
      await action();
      if (reload) {
        await this.load();
      }
    } finally {
      this.busyId = null;
    }
  }
}
