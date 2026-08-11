import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { PHONE_PATTERN, UserRole } from '../../core/models';
import { ToastService } from '../../core/toast.service';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <section class="panel max-w-2xl">
      <h2 class="text-xl font-black text-slate-950">إنشاء مستخدم</h2>
<form
  class="mt-5 grid gap-5 text-lg"
  [formGroup]="form"
  (ngSubmit)="submit()"
>

  <label>
    <span class="label !text-lg !font-black">
      الدور
    </span>

  <select
      class="field !text-lg"
      formControlName="role"
    >
      <option [ngValue]="role.Accountant">
        محاسب
      </option>

      <option [ngValue]="role.Distributor">
        موزع
      </option>
    </select>
  </label>

  <label>
    <span class="label !text-lg !font-black">
      الاسم
    </span>

    <input
      class="field !text-lg"
      formControlName="name"
      type="text"
    />
  </label>

  <label>
    <span class="label !text-lg !font-black">
      رقم التليفون
    </span>

    <input
      class="field !text-lg"
      dir="ltr"
      formControlName="phone"
    />
  </label>

  <label>
    <span class="label !text-lg !font-black">
      كلمة المرور
    </span>

    <input
      class="field !text-lg"
      dir="ltr"
      type="password"
      formControlName="password"
    />
  </label>



  <button
    class="btn-primary justify-self-start !text-lg !font-black"
    [disabled]="form.invalid || submitting"
  >
    {{ submitting ? 'جاري الحفظ...' : 'حفظ المستخدم' }}
  </button>
</form>
    </section>
  `,
})
export class CreateUserComponent {
  readonly role = UserRole;
  submitting = false;
  form;

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private router: Router,
    private toast: ToastService,
  ) {
    this.form = this.fb.nonNullable.group({
      phone: ['', [Validators.required, Validators.pattern(PHONE_PATTERN)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: [UserRole.Accountant, Validators.required],
      name: ['', Validators.required],
    });
  }

  get isDistributor(): boolean {
  return this.form.controls.role.value === UserRole.Distributor;
}

  async submit() {
    if (this.form.invalid || this.submitting) return;
    this.submitting = true;
    try {
      const value = this.form.getRawValue();
      await this.api.createUser({
        phone: value.phone,
        password: value.password,
        role: value.role,
        name: value.name,
      });
      this.toast.show('تم إنشاء المستخدم', 'success');
      this.router.navigate(['/admin/users']);
    } finally {
      this.submitting = false;
    }
  }
}
