import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { PHONE_PATTERN, UserRole } from '../../core/models';
import { ToastService } from '../../core/toast.service';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <main class="flex min-h-screen items-center justify-center bg-[#eef3f8] px-4 py-6 text-lg">
      <section
        class="mx-auto grid min-h-[calc(50vh-4rem)] w-full max-w-6xl overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xl shadow-slate-900/10 lg:grid-cols-[1.05fr_0.95fr]"
      >
        <!-- Login Form -->
        <div class="flex items-center justify-center p-5 sm:p-8 lg:p-12">
          <div class="w-full max-w-md">
            <div class="mb-8">
              <h2 class="mt-2 text-3xl font-black text-slate-950">مرحبًا بك</h2>

              <p class="mt-3 text-base font-medium leading-7 text-slate-500">
                ادخل برقم التليفون وكلمة المرور للانتقال للوحة التحكم المناسبة لصلاحيتك.
              </p>
            </div>

            <form class="space-y-6" [formGroup]="form" (ngSubmit)="submit()">
              <!-- Phone -->
              <label>
                <span class="label !text-lg !font-black"> رقم التليفون </span>

                <input
                  class="field !mt-2 !text-lg"
                  dir="ltr"
                  formControlName="phone"
                  placeholder="01000000000"
                />

                @if (form.controls.phone.touched && form.controls.phone.invalid) {
                  <p class="invalid !mt-2 !text-base">رقم التليفون يجب أن يكون بصيغة 01xxxxxxxxx</p>
                }
              </label>

              <!-- Password -->
              <label>
                <span class="label !text-lg !font-black"> كلمة المرور </span>

                <div class="relative mt-2">
                  <input
                    class="field !text-lg pe-14"
                    dir="ltr"
                    [type]="showPassword ? 'text' : 'password'"
                    formControlName="password"
                  />

                  <button
                    type="button"
                    (click)="showPassword = !showPassword"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-teal-600"
                    [attr.aria-label]="showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'"
                  >
                    @if (showPassword) {
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.8"
                        stroke="currentColor"
                        class="size-6"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.85-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.5a10.523 10.523 0 0 1-4.293 5.146M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 1-4.243-4.243m4.243 4.243L9.879 9.879"
                        />
                      </svg>
                    } @else {
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.8"
                        stroke="currentColor"
                        class="size-6"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M2.036 12.322a1.012 1.012 0 0 1 0-.644C3.423 7.51 7.36 4.5 12 4.5c4.64 0 8.577 3.01 9.964 7.178.07.208.07.432 0 .644C20.577 16.49 16.64 19.5 12 19.5c-4.64 0-8.577-3.01-9.964-7.178Z"
                        />
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                        />
                      </svg>
                    }
                  </button>
                </div>

                @if (form.controls.password.touched && form.controls.password.invalid) {
                  <p class="invalid !mt-2 !text-base">كلمة المرور لا تقل عن 6 أحرف</p>
                }
              </label>

              <!-- Login Button -->
              <button
                class="btn-primary mt-3 w-full !text-lg !font-black"
                type="submit"
                [disabled]="form.invalid || submitting"
              >
                {{ submitting ? 'جاري الدخول...' : 'دخول' }}
              </button>
            </form>

            <!-- Footer -->
            <p class="mt-8 text-center text-sm font-medium text-slate-400">
              © {{ currentYear }}
              جميع الحقوق محفوظة لـ

              <a
                href="https://opshan.github.io/home/#Welcome"
                target="_blank"
                rel="noopener noreferrer"
                class="font-black text-teal-600 transition hover:text-teal-700"
              >
                شركة أوبشن لتطوير البرمجيات
              </a>
            </p>
            <p class="mt-8 text-center text-sm font-medium text-slate-400">
              Software Version 1.1.2
            </p>
          </div>
        </div>

        <!-- Side Section -->
        <aside class="hidden bg-slate-950 p-10 text-white lg:flex lg:flex-col">
          <div class="mb-6 grid place-items-center text-center">
            <div class="grid size-20 place-items-center rounded-lg bg-teal-600 text-2xl font-black">
              Mira
            </div>

            <p class="mt-4 mb-3 max-w-md text-lg font-medium leading-8 text-slate-300">
              نظام احترافي لإدارة دفاتر التحصيل والمرتجعات وتتبع حركة الموزعين داخل المخزن.
            </p>
          </div>

          <div class="grid gap-4 text-base text-slate-300">
            <div class="rounded-lg border border-white/10 bg-white/5 p-5">
              <p class="text-lg font-black text-white">تتبع كامل</p>

              <p class="mt-2 text-base leading-7">دفاتر، حالات، تواريخ تسليم واستلام، وملاحظات.</p>
            </div>

            <div class="rounded-lg border border-white/10 bg-white/5 p-5">
              <p class="text-lg font-black text-white">صلاحيات واضحة</p>

              <p class="mt-2 text-base leading-7">مدير، محاسب، وموزع بواجهات منفصلة.</p>
            </div>
          </div>
        </aside>
      </section>
    </main>
  `,
})
export class LoginComponent {
  submitting = false;
  form;
  currentYear = new Date().getFullYear();
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private auth: AuthService,
    private router: Router,
    private toast: ToastService,
  ) {
    this.form = this.fb.nonNullable.group({
      phone: ['', [Validators.required, Validators.pattern(PHONE_PATTERN)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  async submit() {
    if (this.form.invalid || this.submitting) return;

    this.submitting = true;

    try {
      const session = await this.api.login(this.form.value.phone!, this.form.value.password!);

      session.userRole =
        this.roleFromToken(session.token) ??
        this.auth.normalizeRole(session.userRole) ??
        session.userRole;

      const redirectTo = this.auth.dashboardFor(session.userRole);

      if (redirectTo === '/login') {
        this.toast.show('تعذر تحديد صلاحية المستخدم بعد تسجيل الدخول', 'error');
        return;
      }

      this.auth.setSession(session);

      this.toast.show('تم تسجيل الدخول بنجاح', 'success');

      console.log('User login data:', session);
      console.info('Mira login succeeded', {
        userId: session.userId,
        phone: session.phone,
        name: session.name ?? this.auth.userName(),
        userRole: session.userRole,
        redirectTo,
      });

      await this.router.navigateByUrl(redirectTo);
    } catch (error: any) {
      console.error('Mira login failed:', error);

      this.toast.show('رقم التليفون أو كلمة المرور غير صحيحة', 'error');
    } finally {
      this.submitting = false;
    }
  }

  private roleFromToken(token: string): UserRole | null {
    try {
      const decoded = jwtDecode<Record<string, unknown>>(token);
      const rawRole =
        decoded['userRole'] ??
        decoded['role'] ??
        decoded['UserRole'] ??
        decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
      return this.auth.normalizeRole(rawRole);
    } catch {
      return null;
    }
  }
}
