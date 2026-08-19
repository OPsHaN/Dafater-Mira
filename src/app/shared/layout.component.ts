import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { ROLE_LABELS, UserRole } from '../core/models';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="flex min-h-screen flex-col bg-[#eef3f8]">
      <!-- Header -->
      <header
        class="sticky top-0 z-30 border-b border-slate-200 bg-white/90 shadow-sm shadow-slate-200/60 backdrop-blur"
      >
        <div
          class="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center lg:justify-between"
        >
          <!-- Logo -->
          <div class="flex items-center gap-3">
            <div
              class="grid size-12 place-items-center rounded-lg bg-slate-950 text-xl font-black text-white shadow-sm"
            >
              M
            </div>

            <div>
              <p class="text-xs font-bold text-teal-700">Mira</p>

              <h1 class="text-xl font-black text-slate-950">إدارة دفاتر التوزيع</h1>
            </div>
          </div>

          <!-- Navigation + Role -->
          <div class="flex flex-wrap items-center justify-between gap-4">
            <!-- Navigation -->
            <nav
              class="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2 text-lg"
            >
              @if (auth.role() === role.Admin || auth.role() === role.Accountant) {
                <a
                  class="nav-link"
                  [routerLink]="['/', auth.role() === role.Admin ? 'admin' : 'accountant', 'dashboard']"
                  routerLinkActive="active"
                >
                  الملخص
                </a>

                <a
                  class="nav-link"
                  [routerLink]="['/', auth.role() === role.Admin ? 'admin' : 'accountant', 'books']"
                  routerLinkActive="active"
                >
                  الدفاتر
                </a>

                <a
                  class="nav-link"
                  [routerLink]="['/', auth.role() === role.Admin ? 'admin' : 'accountant', 'bulk-create']"
                  routerLinkActive="active"
                >
                  إنشاء دفاتر
                </a>

                <a
                  class="nav-link"
                  [routerLink]="['/', auth.role() === role.Admin ? 'admin' : 'accountant', 'search']"
                  routerLinkActive="active"
                >
                  بحث
                </a>

                <a
                  class="nav-link"
                  [routerLink]="['/', auth.role() === role.Admin ? 'admin' : 'accountant', 'distributors']"
                  routerLinkActive="active"
                >
                  الموزعون
                </a>
              }

              @if (auth.role() === role.Admin) {
                <a class="nav-link" routerLink="/admin/users" routerLinkActive="active">
                  المستخدمون
                </a>

                <a class="nav-link" routerLink="/admin/create-user" routerLinkActive="active">
                  مستخدم جديد
                </a>
              }

              @if (auth.role() === role.Distributor) {
                <a class="nav-link" routerLink="/distributor/books" routerLinkActive="active">
                  دفاتري
                </a>
              }

              <!-- Logout -->
              <button class="btn-danger text-lg font-black" type="button" (click)="auth.logout()">
                خروج
              </button>
            </nav>

            <!-- User Role -->
            <div
              class="inline-flex items-center gap-3 rounded-lg border border-teal-200 bg-teal-50 px-6 py-3 shadow-sm"
            >
              <span
                class="grid size-10 place-items-center rounded-full bg-teal-600 text-base text-white"
              >
                👤
              </span>

              <div class="text-right">
                <p class="text-sm font-bold text-slate-500">الصلاحية الحالية</p>

                <p class="text-xl font-black text-teal-700">
                  {{ roleLabel }}
                </p>

                @if (auth.userName()) {
                  <p class="text-sm font-semibold text-slate-500">{{ auth.userName() }}</p>
                }
              </div>
            </div>
          </div>
        </div>
      </header>

      <!-- Main -->
      <main class="flex-1">
        <div class="mx-auto w-full max-w-7xl px-4 py-6 lg:py-8">
          <router-outlet />
        </div>
      </main>

      <!-- Footer -->
      <footer class="mt-auto border-t border-slate-200 bg-white">
        <div class="mx-auto w-full max-w-7xl px-4 py-6">
          <p class="text-center text-sm font-medium text-slate-400">
            © {{ currentYear }}

            جميع الحقوق محفوظة لـ

            <a
              href="https://opshan.github.io/home/#Welcome"
              target="_blank"
              rel="noopener noreferrer"
              class="font-bold text-teal-600 transition hover:text-teal-700"
            >
              شركة أوبشن لتطوير البرمجيات
            </a>
          </p>
        </div>
      </footer>
    </div>
  `,
})
export class LayoutComponent {
  readonly role = UserRole;
  readonly currentYear = new Date().getFullYear();

  constructor(public auth: AuthService) {}

  get roleLabel() {
    const current = this.auth.role();
    return current ? ROLE_LABELS[current] : '';
  }
  
}
