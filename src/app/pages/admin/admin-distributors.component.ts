import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { AdminUser, PHONE_PATTERN, UserRole } from '../../core/models';
import { ToastService } from '../../core/toast.service';
import { StateBlockComponent } from '../../shared/state-block.component';

@Component({
  standalone: true,
  imports: [FormsModule, StateBlockComponent],
  template: `
    <div class="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p class="text-sm font-bold text-teal-700">الإدارة</p>
        <h2 class="text-2xl font-black text-slate-950">الموزعون</h2>
        <p class="mt-1 text-sm text-slate-500">كل حسابات الموزعين التي أنشأها المدير.</p>
      </div>
    </div>

    @if (loading) {
      <app-state-block title="جاري تحميل الموزعين" icon="..." />
    } @else if (error) {
      <app-state-block title="تعذر تحميل الموزعين" icon="!" (retry)="load()" />
    } @else if (!distributors.length) {
      <app-state-block title="لا يوجد موزعون بعد" icon="-" description="أنشئ مستخدمًا جديدًا بدور موزع ليظهر هنا." />
    } @else {
      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        @for (user of distributors; track user.userId) {
          <article class="panel">
            <div class="flex items-start justify-between gap-3">
              <div>
                <h3 class="text-lg font-black text-slate-950">{{ user.name || 'موزع بدون اسم' }}</h3>
                <p class="mt-1 text-lg text-slate-500" dir="rtl">{{ user.phone }}</p>
              </div>
              <span class="rounded-full bg-blue-50 px-3 py-1 text-sm font-bold text-blue-700">موزع</span>
            </div>
            <div class="mt-5 flex flex-wrap gap-2">
              <button class="btn-secondary" type="button" (click)="startEdit(user)">تعديل</button>
              <button class="btn-danger" type="button" [disabled]="busyId === user.userId" (click)="remove(user)">حذف</button>
            </div>
          </article>
        }
      </div>
    }

    @if (editing) {
      <div class="fixed inset-0 z-40 grid place-items-center bg-slate-950/60 p-4 backdrop-blur-sm">
        <form class="w-full max-w-lg rounded-lg bg-white p-5 shadow-2xl" (ngSubmit)="saveEdit()">
          <h3 class="text-lg font-black">تعديل موزع</h3>
          <label class="mt-4 block">
            <span class="label">اسم الموزع</span>
            <input class="field" [(ngModel)]="editName" name="name" />
          </label>
          <label class="mt-4 block">
            <span class="label">رقم التليفون</span>
            <input class="field" dir="ltr" [(ngModel)]="editPhone" name="phone" />
          </label>
          <label class="mt-4 block">
            <span class="label">كلمة مرور جديدة</span>
            <input class="field" dir="ltr" type="password" [(ngModel)]="editPassword" name="password" placeholder="اتركها فارغة بدون تغيير" />
          </label>
          <div class="mt-5 flex justify-end gap-2">
            <button class="btn-secondary" type="button" (click)="editing = null">إلغاء</button>
            <button class="btn-primary" [disabled]="saving">حفظ</button>
          </div>
        </form>
      </div>
    }
  `,
})
export class AdminDistributorsComponent implements OnInit {
  distributors: AdminUser[] = [];
  loading = true;
  error = false;
  busyId = '';
  editing: AdminUser | null = null;
  editName = '';
  editPhone = '';
  editPassword = '';
  saving = false;

  constructor(private api: ApiService, private toast: ToastService) {}

  ngOnInit() {
    this.load();
  }

  async load() {
    this.loading = true;
    this.error = false;
    try {
      const users = await this.api.getUsers();
      this.distributors = users.filter((user) => Number(user.role) === UserRole.Distributor || String(user.role).toLowerCase() === 'distributor');
    } catch {
      this.error = true;
    } finally {
      this.loading = false;
    }
  }

  startEdit(user: AdminUser) {
    this.editing = user;
    this.editName = user.name ?? '';
    this.editPhone = user.phone;
    this.editPassword = '';
  }

  async saveEdit() {
    if (!this.editing || this.saving) return;
    if (!this.editName.trim() || !PHONE_PATTERN.test(this.editPhone) || (this.editPassword && this.editPassword.length < 6)) {
      this.toast.show('راجع اسم الموزع ورقم التليفون وكلمة المرور', 'error');
      return;
    }
    const body: Record<string, string> = { phone: this.editPhone, name: this.editName };
    if (this.editPassword) body['password'] = this.editPassword;
    this.saving = true;
    try {
      await this.api.updateUser(this.editing.userId, body);
      this.toast.show('تم تحديث الموزع', 'success');
      this.editing = null;
      await this.load();
    } finally {
      this.saving = false;
    }
  }

  async remove(user: AdminUser) {
    if (!confirm('هل تريد حذف هذا الموزع؟')) return;
    this.busyId = user.userId;
    try {
      await this.api.deleteUser(user.userId);
      this.toast.show('تم حذف الموزع', 'success');
      await this.load();
    } finally {
      this.busyId = '';
    }
  }
}
