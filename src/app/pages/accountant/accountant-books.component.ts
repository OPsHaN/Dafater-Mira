import { Component } from '@angular/core';
import { UserRole } from '../../core/models';
import { BooksTableComponent } from '../../shared/books-table.component';

@Component({
  standalone: true,
  imports: [BooksTableComponent],
  template: `
    <div class="mb-5">
      <h2 class="text-xl font-black">الدفاتر</h2>
      <p class="text-sm text-slate-500">فلترة وتحديث حركة دفاتر التحصيل والمرتجعات.</p>
    </div>
    <app-books-table [role]="role" />
  `,
})
export class AccountantBooksComponent {
  readonly role = UserRole.Accountant;
}
