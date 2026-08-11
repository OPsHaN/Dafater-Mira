import { Injectable, computed, signal } from '@angular/core';
import { Router } from '@angular/router';
import { LoginResponse, UserRole } from './models';

const AUTH_KEY = 'mira_auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly state = signal<LoginResponse | null>(this.readStoredAuth());
  readonly user = computed(() => this.state());
  readonly userName = computed(() => this.state()?.name ?? this.state()?.phone ?? null);
  readonly role = computed(() => this.normalizeRole(this.state()?.userRole));
  readonly isAuthenticated = computed(() => Boolean(this.state()?.token));

  constructor(private router: Router) {}

  setSession(session: LoginResponse) {
    session.userRole = this.normalizeRole(session.userRole) ?? session.userRole;
    if (!session.name) {
      session.name = this.extractNameFromToken(session.token);
    }
    localStorage.setItem(AUTH_KEY, JSON.stringify(session));
    this.state.set(session);
  }

  token() {
    return this.state()?.token ?? null;
  }

  logout(redirect = true) {
    localStorage.removeItem(AUTH_KEY);
    this.state.set(null);
    if (redirect) {
      this.router.navigate(['/login']);
    }
  }

  dashboardFor(role: unknown = this.role()) {
    const normalizedRole = this.normalizeRole(role);
    if (normalizedRole === UserRole.Admin) return '/admin/books';
    if (normalizedRole === UserRole.Accountant) return '/accountant/dashboard';
    if (normalizedRole === UserRole.Distributor) return '/distributor/books';
    return '/login';
  }

  normalizeRole(role: unknown): UserRole | null {
    if (role === UserRole.Admin || role === '1' || role === 'Admin' || role === 'admin') {
      return UserRole.Admin;
    }
    if (role === UserRole.Accountant || role === '2' || role === 'Accountant' || role === 'accountant') {
      return UserRole.Accountant;
    }
    if (role === UserRole.Distributor || role === '3' || role === 'Distributor' || role === 'distributor') {
      return UserRole.Distributor;
    }
    const numericRole = Number(role);
    return numericRole === 1 || numericRole === 2 || numericRole === 3 ? numericRole : null;
  }

  private readStoredAuth(): LoginResponse | null {
    try {
      const raw = localStorage.getItem(AUTH_KEY);
      if (!raw) return null;
      const session = JSON.parse(raw) as LoginResponse;
      if (!session.name && session.token) {
        session.name = this.extractNameFromToken(session.token);
      }
      return session;
    } catch {
      localStorage.removeItem(AUTH_KEY);
      return null;
    }
  }

  private extractNameFromToken(token: string): string | undefined {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return (
        (payload['name'] as string | undefined) ||
        (payload['Name'] as string | undefined) ||
        (payload['fullName'] as string | undefined) ||
        (payload['given_name'] as string | undefined) ||
        (payload['unique_name'] as string | undefined)
      );
    } catch {
      return undefined;
    }
  }
}
