import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { Distributor, PaginatedResponse, PHONE_PATTERN } from '../../core/models';
import { ToastService } from '../../core/toast.service';
import { PaginationComponent } from '../../shared/pagination.component';
import { StateBlockComponent } from '../../shared/state-block.component';

@Component({
  standalone: true,
  imports: [FormsModule, PaginationComponent, StateBlockComponent],
  template: `
    <div class="mb-5">
      <h2 class="text-xl font-black">الموزعون</h2>
      <p class="text-sm text-slate-500">عرض وتعديل بيانات الموزعين.</p>
    </div>
    @if (loading) {
      <app-state-block title="جاري تحميل الموزعين" icon="⏳" />
    } @else if (error) {
      <app-state-block title="تعذر تحميل الموزعين" icon="!" (retry)="load()" />
    } @else if (!page?.items?.length) {
      <app-state-block title="لا يوجد موزعون بعد" icon="👤" />
    } @else {
      <div class="table-wrap">
        <table class="data-table w-full border-collapse">
          <thead>
            <tr class="border-b-2 border-slate-300 bg-slate-100">
              <th class="border-l border-slate-200 px-6 py-5 !text-lg !font-black !text-slate-900">
                الاسم
              </th>

              <th class="border-l border-slate-200 px-6 py-5 !text-lg !font-black !text-slate-900">
                رقم التليفون
              </th>

              <th class="border-l border-slate-200 px-6 py-5 !text-lg !font-black !text-slate-900">
                عدد الدفاتر
              </th>

              <th class="px-6 py-5 !text-lg !font-black !text-slate-900">الإجراءات</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-slate-100">
            @for (d of page!.items; track d.id) {
              <tr class="transition-colors hover:bg-slate-50">
                <td
                  class="border-l border-slate-100 px-5 py-4 text-sm font-semibold text-slate-700"
                >
                  {{ d.name }}
                </td>

                <td
                  dir="ltr"
                  class="border-l border-slate-100 px-5 py-4 text-sm font-medium text-slate-600"
                >
                  {{ d.phone }}
                </td>

                <td class="border-l border-slate-100 px-5 py-4 text-sm font-bold text-slate-700">
                  {{ d.booksCount }}
                </td>

                <td class="px-5 py-4">
                  <button class="btn-secondary p-0" type="button" (click)="startEdit(d)">
                    تعديل
                  </button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
      <div class="mt-4"><app-pagination [page]="page" (change)="goToPage($event)" /></div>
    }

    @if (editing) {
      <div class="fixed inset-0 z-40 grid place-items-center bg-slate-950/50 p-4">
        <form class="w-full max-w-lg rounded-lg bg-white p-5 shadow-xl" (ngSubmit)="save()">
          <h3 class="text-lg font-black">تعديل موزع</h3>
          <label class="mt-4 block"
            ><span class="label">الاسم</span
            ><input class="field" [(ngModel)]="editName" name="name"
          /></label>
          <label class="mt-4 block"
            ><span class="label">رقم التليفون</span
            ><input class="field" dir="ltr" [(ngModel)]="editPhone" name="phone"
          /></label>
          <div class="mt-5 flex justify-end gap-2">
            <button class="btn-secondary" type="button" (click)="editing = null">إلغاء</button>
            <button class="btn-primary" [disabled]="saving">حفظ</button>
          </div>
        </form>
      </div>
    }
  `,
})
export class DistributorsComponent implements OnInit {
  page: PaginatedResponse<Distributor> | null = null;
  loading = true;
  error = false;
  pageNumber = 1;
  editing: Distributor | null = null;
  editName = '';
  editPhone = '';
  saving = false;

  constructor(
    private api: ApiService,
    private route: ActivatedRoute,
    private router: Router,
    private toast: ToastService,
  ) {}

  ngOnInit() {
    this.route.queryParamMap.subscribe((params) => {
      this.pageNumber = Number(params.get('pageNumber') ?? 1);
      this.load();
    });
  }

  async load() {
    this.loading = true;
    this.error = false;
    try {
      this.page = await this.api.getDistributors({ pageNumber: this.pageNumber, pageSize: 20 });
    } catch {
      this.error = true;
    } finally {
      this.loading = false;
    }
  }

  goToPage(pageNumber: number) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { pageNumber },
      queryParamsHandling: 'merge',
    });
  }

  startEdit(distributor: Distributor) {
    this.editing = distributor;
    this.editName = distributor.name;
    this.editPhone = distributor.phone;
  }

  async save() {
    if (!this.editing || this.saving) return;
    if (!this.editName.trim() || !PHONE_PATTERN.test(this.editPhone)) {
      this.toast.show('راجع اسم الموزع ورقم التليفون', 'error');
      return;
    }
    this.saving = true;
    try {
      await this.api.updateDistributor(this.editing.id, {
        name: this.editName,
        phone: this.editPhone,
      });
      this.toast.show('تم تحديث الموزع', 'success');
      this.editing = null;
      await this.load();
    } finally {
      this.saving = false;
    }
  }
}
