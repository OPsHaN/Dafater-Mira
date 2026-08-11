export enum UserRole {
  Admin = 1,
  Accountant = 2,
  Distributor = 3,
}

export enum BookType {
  Collection = 1,
  Return = 2,
}

export enum BookStatus {
  NotAssigned = 1,
  AssignedToDistributor = 2,
  WaitingForCash = 3,
  CashReceived = 4,
  FullyCollected = 5,
}

export interface LoginResponse {
  token: string;
  userId: string;
  phone: string;
  userRole: UserRole;
  name?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  pageNumber: number;
  totalPages: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface Book {
  id: number;
  type: BookType;
  serialStart: number;
  serialEnd: number;
  status: BookStatus;
  distributorId: number | null;
  distributorName: string | null;
  deliveryDate: string | null;
  receivedDate: string | null;
  notes: string | null;
  createdAt: string;
}

export interface Distributor {
  id: number;
  name: string;
  phone: string;
  booksCount: number;
}

export interface AdminUser {
  userId: string;
  phone: string;
  role: UserRole;
  name: string | null;
  distributorName?: string | null;
}

export const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.Admin]: 'مدير',
  [UserRole.Accountant]: 'محاسب',
  [UserRole.Distributor]: 'موزع',
};

export const BOOK_TYPE_LABELS: Record<BookType, string> = {
  [BookType.Collection]: 'تحصيل',
  [BookType.Return]: 'مرتجع',
};

export const BOOK_STATUS_LABELS: Record<BookStatus, string> = {
  [BookStatus.NotAssigned]: 'غير معين',
  [BookStatus.AssignedToDistributor]: 'معين لموزع',
  [BookStatus.WaitingForCash]: 'في انتظار النقدية',
  [BookStatus.CashReceived]: 'تم استلام النقدية',
  [BookStatus.FullyCollected]: 'مكتمل',
};

export const PHONE_PATTERN = /^01\d{9}$/;
