import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { AuthService } from './auth.service';
import { AdminUser, Book, Distributor, LoginResponse, PaginatedResponse } from './models';
import { ToastService } from './toast.service';

const apiBaseUrl =
  (import.meta as unknown as { env?: Record<string, string> }).env?.['VITE_API_BASE_URL'] ??
  'https://dafater.runasp.net';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly client: AxiosInstance;

  constructor(
    private auth: AuthService,
    private router: Router,
    private toast: ToastService,
  ) {
    this.client = axios.create({
      baseURL: apiBaseUrl,
      timeout: 20000,
      headers: { 'Content-Type': 'application/json' },
    });

    this.client.interceptors.request.use((config) => {
      const token = this.auth.token();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        const status = error?.response?.status;
        const title = error?.response?.data?.title;
        const skipForbiddenHandling = Boolean(error?.config?.skipForbiddenHandling);
        if (!error?.response) {
          this.toast.show(this.errorMessage(error), 'error');
        } else if (status === 401) {
          this.auth.logout();
        } else if (status === 403 && skipForbiddenHandling) {
          return Promise.reject(error);
        } else if (status === 403 && !skipForbiddenHandling) {
          this.toast.show('ليس لديك صلاحية للقيام بهذا الإجراء', 'error');
          this.router.navigate([this.auth.dashboardFor()]);
        } else if (title) {
          this.toast.show(title, 'error');
        } else {
          this.toast.show(this.errorMessage(error), 'error');
        }
        return Promise.reject(error);
      },
    );
  }

  async login(phone: string, password: string) {
    return this.unwrap<LoginResponse>(this.client.post('/api/v1/auth/login', { phone, password }));
  }

  async getUsers() {
    return this.unwrap<AdminUser[]>(this.client.get('/api/v1/admin/users'));
  }

  async createUser(body: { phone: string; password: string; role: number; name?: string | null }) {
    return this.unwrap<AdminUser>(this.client.post('/api/v1/admin/users', body));
  }

  async updateUser(userId: string, body: Record<string, string>) {
    return this.unwrap<AdminUser>(this.client.put(`/api/v1/admin/users/${userId}`, body));
  }

  async deleteUser(userId: string) {
    return this.unwrap<void>(this.client.delete(`/api/v1/admin/users/${userId}`));
  }

  async deleteBook(id: number) {
    return this.unwrap<void>(this.client.delete(`/api/v1/admin/books/${id}`));
  }

  async bulkDeleteBooks(bookIds: number[]) {
    return this.unwrap<{ deletedCount: number }>(
      this.client.post('/api/v1/admin/books/bulk-delete', { bookIds }),
    );
  }

  async updateBookSerial(id: number, newSerialStart: number) {
    return this.unwrap<Book>(this.client.put(`/api/v1/admin/books/${id}/serial`, { newSerialStart }));
  }

  async updateBookDeliveryDate(id: number, deliveryDate: string) {
    return this.unwrap<Book>(
      this.client.put(`/api/v1/books/${id}/delivery-date`, { deliveryDate }),
    );
  }

  async getDistributors(params: Record<string, string | number | null | undefined>, skipForbiddenHandling = false) {
    const config: AxiosRequestConfig & { skipForbiddenHandling?: boolean } = {
      params: this.clean(params),
      skipForbiddenHandling,
    };
    return this.unwrap<PaginatedResponse<Distributor>>(
      this.client.get('/api/v1/distributors', config),
    );
  }

  async updateDistributor(id: number, body: { name: string; phone: string }) {
    return this.unwrap<Distributor>(this.client.put(`/api/v1/distributors/${id}`, body));
  }

  async bulkCreateBooks(body: { type: number; firstSerialStart: number; count: number }) {
    return this.unwrap<Book[]>(this.client.post('/api/v1/books/bulk', body));
  }

  async getBooks(params: Record<string, string | number | null | undefined>) {
    return this.unwrap<PaginatedResponse<Book>>(
      this.client.get('/api/v1/books', { params: this.clean(params) }),
    );
  }

  async searchBook(receiptNumber: number) {
    return this.unwrap<Book>(this.client.get('/api/v1/books/search', { params: { receiptNumber } }));
  }

  async assignBook(id: number, distributorId: number) {
    return this.unwrap<Book>(this.client.post(`/api/v1/books/${id}/assign`, { distributorId }));
  }

  async transferBook(id: number, newDistributorId: number) {
    return this.unwrap<Book>(this.client.post(`/api/v1/books/${id}/transfer`, { newDistributorId }));
  }

  async changeBookStatus(id: number, newStatus: number) {
    return this.unwrap<Book>(this.client.put(`/api/v1/books/${id}/status`, { newStatus }));
  }

  async setReceivedDate(id: number, receivedDate: string) {
    return this.unwrap<Book>(this.client.put(`/api/v1/books/${id}/received-date`, { receivedDate }));
  }

  async setBookNote(id: number, note: string | null) {
    return this.unwrap<Book>(this.client.put(`/api/v1/books/${id}/note`, { note }));
  }

  async getMyBooks(params: Record<string, string | number | null | undefined>) {
    return this.unwrap<PaginatedResponse<Book>>(
      this.client.get('/api/v1/distributor/books', { params: this.clean(params) }),
    );
  }

  private async unwrap<T>(promise: Promise<{ data: T }>) {
    const response = await promise;
    return response.data;
  }

  private clean(params: Record<string, string | number | null | undefined>) {
    return Object.fromEntries(
      Object.entries(params).filter(([, value]) => value !== '' && value !== null && value !== undefined),
    );
  }

  private errorMessage(error: any) {
    const status = error?.response?.status;
    if (error?.code === 'ECONNABORTED') return 'انتهت مهلة الاتصال بالسيرفر. حاول مرة أخرى.';
    if (!error?.response) return 'تعذر الاتصال بالسيرفر. تأكد من اتصال الإنترنت أو إعدادات CORS.';
    if (status === 400) return 'البيانات المرسلة غير صحيحة. راجع الحقول وحاول مرة أخرى.';
    if (status === 404) return 'العنصر المطلوب غير موجود.';
    if (status >= 500) return 'حدث خطأ في السيرفر. حاول مرة أخرى بعد قليل.';
    return 'حدث خطأ غير متوقع. حاول مرة أخرى.';
  }
}
