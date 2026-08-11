import { Routes } from '@angular/router';
import { guestGuard, roleGuard } from './core/guards';
import { UserRole } from './core/models';
import { LayoutComponent } from './shared/layout.component';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'admin',
    component: LayoutComponent,
    canActivate: [roleGuard([UserRole.Admin])],
    children: [
      { path: 'books', loadComponent: () => import('./pages/admin/admin-books.component').then((m) => m.AdminBooksComponent) },
      { path: 'distributors', loadComponent: () => import('./pages/admin/admin-distributors.component').then((m) => m.AdminDistributorsComponent) },
      { path: 'users', loadComponent: () => import('./pages/admin/users.component').then((m) => m.UsersComponent) },
      { path: 'create-user', loadComponent: () => import('./pages/admin/create-user.component').then((m) => m.CreateUserComponent) },
      { path: '', pathMatch: 'full', redirectTo: 'books' },
    ],
  },
  {
    path: 'accountant',
    component: LayoutComponent,
    canActivate: [roleGuard([UserRole.Accountant, UserRole.Admin])],
    children: [
      { path: 'dashboard', loadComponent: () => import('./pages/accountant/dashboard.component').then((m) => m.DashboardComponent) },
      { path: 'books', loadComponent: () => import('./pages/accountant/accountant-books.component').then((m) => m.AccountantBooksComponent) },
      { path: 'bulk-create', loadComponent: () => import('./pages/accountant/bulk-create.component').then((m) => m.BulkCreateComponent) },
      { path: 'search', loadComponent: () => import('./pages/accountant/search.component').then((m) => m.SearchComponent) },
      { path: 'distributors', loadComponent: () => import('./pages/accountant/distributors.component').then((m) => m.DistributorsComponent) },
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
    ],
  },
  {
    path: 'admin',
    component: LayoutComponent,
    canActivate: [roleGuard([UserRole.Admin])],
    children: [
      { path: 'dashboard', loadComponent: () => import('./pages/accountant/dashboard.component').then((m) => m.DashboardComponent) },
      { path: 'books', loadComponent: () => import('./pages/admin/admin-books.component').then((m) => m.AdminBooksComponent) },
      { path: 'bulk-create', loadComponent: () => import('./pages/accountant/bulk-create.component').then((m) => m.BulkCreateComponent) },
      { path: 'search', loadComponent: () => import('./pages/accountant/search.component').then((m) => m.SearchComponent) },
      { path: 'distributors', loadComponent: () => import('./pages/admin/admin-distributors.component').then((m) => m.AdminDistributorsComponent) },
      { path: 'users', loadComponent: () => import('./pages/admin/users.component').then((m) => m.UsersComponent) },
      { path: 'create-user', loadComponent: () => import('./pages/admin/create-user.component').then((m) => m.CreateUserComponent) },
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
    ],
  },
  {
    path: 'distributor',
    component: LayoutComponent,
    canActivate: [roleGuard([UserRole.Distributor])],
    children: [
      { path: 'books', loadComponent: () => import('./pages/distributor/my-books.component').then((m) => m.MyBooksComponent) },
      { path: '', pathMatch: 'full', redirectTo: 'books' },
    ],
  },
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: '**', redirectTo: 'login' },
];
