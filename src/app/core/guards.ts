import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { UserRole } from './models';
import { ToastService } from './toast.service';

export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.isAuthenticated() ? router.parseUrl(auth.dashboardFor()) : true;
};

export const roleGuard = (roles: UserRole[]): CanActivateFn => {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    const toast = inject(ToastService);
    if (!auth.isAuthenticated()) return router.parseUrl('/login');
    if (auth.role() && roles.includes(auth.role()!)) return true;
    toast.show('ليس لديك صلاحية للقيام بهذا الإجراء', 'error');
    return router.parseUrl(auth.dashboardFor());
  };
};
