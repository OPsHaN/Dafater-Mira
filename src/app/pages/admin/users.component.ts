import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { AdminUser, PHONE_PATTERN, ROLE_LABELS, UserRole } from '../../core/models';
import { ToastService } from '../../core/toast.service';
import { StateBlockComponent } from '../../shared/state-block.component';

@Component({
  standalone: true,
  imports: [FormsModule, StateBlockComponent],
  template: `
    <div class="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="text-xl font-black">المستخدمون</h2>
        <p class="text-sm text-slate-500">إدارة حسابات المحاسبين والموزعين.</p>
      </div>
    </div>

    @if (loading) {
      <app-state-block title="جاري تحميل المستخدمين" icon="⏳" />
    } @else if (error) {
      <app-state-block title="تعذر تحميل المستخدمين" icon="!" (retry)="load()" />
    } @else if (!users.length) {
      <app-state-block title="لا يوجد مستخدمون بعد" icon="👥" />
    } @else {
      <div class="table-wrap">
<table class="data-table w-full border-collapse">
  <thead>
    <tr class="border-b-2 border-slate-300 bg-slate-100">

      <th
        class="border-l border-slate-200 px-6 py-5 !text-lg !font-black !text-slate-900"
      >
        رقم التليفون
      </th>

      <th
        class="border-l border-slate-200 px-6 py-5 !text-lg !font-black !text-slate-900"
      >
        الدور
      </th>

      <th
        class="border-l border-slate-200 px-6 py-5 !text-lg !font-black !text-slate-900"
      >
        الاسم
      </th>

      <th
        class="px-6 py-5 !text-lg !font-black !text-slate-900"
      >
        الإجراءات
      </th>

    </tr>
  </thead>

  <tbody class="divide-y divide-slate-100">
    @for (user of users; track user.userId) {
      <tr class="transition-colors hover:bg-slate-50">

        <!-- Phone -->
        <td
          dir="ltr"
          class="border-l border-slate-100 px-6 py-5 text-sm font-semibold text-slate-700"
        >
          {{ user.phone }}
        </td>

        <!-- Role -->
        <td class="border-l border-slate-100 px-6 py-5">
          <span
            class="inline-flex rounded-full bg-slate-100 px-3 py-1.5 text-sm font-bold text-slate-700"
          >
            {{ roleLabel(user.role) }}
          </span>
        </td>

        <!-- Distributor -->
        <td
          class="border-l border-slate-100 px-6 py-5 text-sm font-semibold text-slate-700"
        >
          {{ user.name || user.distributorName || '-' }}
        </td>

        <!-- Actions -->
        <td class="px-6 py-5">
          <div class="flex flex-wrap items-center gap-2">

            <button
              class="btn-secondary"
              type="button"
              (click)="startEdit(user)"
            >
              تعديل
            </button>

            <button
              class="btn-danger"
              type="button"
              [disabled]="busyId === user.userId"
              (click)="remove(user)"
            >
              {{ busyId === user.userId ? 'جاري الحذف...' : 'حذف' }}
            </button>

          </div>
        </td>

      </tr>
    }
  </tbody>
</table>
      </div>
    }

    @if (editing) {
      <div class="fixed inset-0 z-40 grid place-items-center bg-slate-950/50 p-4">
        <form class="w-full max-w-lg rounded-lg bg-white p-5 shadow-xl" (ngSubmit)="saveEdit()">
          <h3 class="text-lg font-black">تعديل المستخدم</h3>
          <div class="mt-4 grid gap-4">
            <label>
              <span class="label">رقم التليفون</span>
              <input class="field" dir="ltr" [(ngModel)]="editPhone" name="phone" />
            </label>
            <label>
              <span class="label">كلمة مرور جديدة</span>
              <input class="field" dir="ltr" type="password" [(ngModel)]="editPassword" name="password" placeholder="اتركها فارغة بدون تغيير" />
            </label>
            <label>
              <span class="label">الاسم</span>
              <input class="field" [(ngModel)]="editName" name="name" />
            </label>
          </div>
          <div class="mt-5 flex justify-end gap-2">
            <button class="btn-secondary" type="button" (click)="editing = null">إلغاء</button>
            <button class="btn-primary" [disabled]="saving">حفظ</button>
          </div>
        </form>
      </div>
    }
  `,
})
export class UsersComponent implements OnInit {
  readonly role = UserRole;
  users: AdminUser[] = [];
  loading = true;
  error = false;
  busyId = '';
  editing: AdminUser | null = null;
  editPhone = '';
  editPassword = '';
  editName = '';
  saving = false;

  constructor(private api: ApiService, private toast: ToastService) {}

  ngOnInit() {
    this.load();
  }

  async load() {
    this.loading = true;
    this.error = false;
    try {
      this.users = await this.api.getUsers();
    } catch {
      this.error = true;
    } finally {
      this.loading = false;
    }
  }

  roleLabel(role: UserRole) {
    return ROLE_LABELS[role];
  }

  startEdit(user: AdminUser) {
    this.editing = user;
    this.editPhone = user.phone;
    this.editPassword = '';
    this.editName = user.name ?? user.distributorName ?? '';
  }

  async saveEdit() {
    if (!this.editing || this.saving) return;
    if (!PHONE_PATTERN.test(this.editPhone) || (this.editPassword && this.editPassword.length < 6)) {
      this.toast.show('راجع رقم التليفون وكلمة المرور', 'error');
      return;
    }
    const body: Record<string, string> = {};
    if (this.editPhone !== this.editing.phone) body['phone'] = this.editPhone;
    if (this.editPassword) body['password'] = this.editPassword;
    if (this.editName !== (this.editing.name ?? this.editing.distributorName ?? '')) body['name'] = this.editName;
    this.saving = true;
    try {
      await this.api.updateUser(this.editing.userId, body);
      this.toast.show('تم تحديث المستخدم', 'success');
      this.editing = null;
      await this.load();
    } finally {
      this.saving = false;
    }
  }

  async remove(user: AdminUser) {
    if (!confirm('هل تريد حذف هذا المستخدم؟')) return;
    this.busyId = user.userId;
    try {
      await this.api.deleteUser(user.userId);
      this.toast.show('تم حذف المستخدم', 'success');
      await this.load();
    } finally {
      this.busyId = '';
    }
  }
}
