import { Component } from '@angular/core';
import { UserRole } from '../../core/models';
import { BooksTableComponent } from '../../shared/books-table.component';

@Component({
  standalone: true,
  imports: [BooksTableComponent],
  template: `
    <div class="mb-5">
      <h2 class="text-xl font-black">كل الدفاتر</h2>
      <p class="text-sm text-slate-500">للمدير صلاحيات التعيين والنقل وتعديل الحالة حتى للدفاتر المكتملة.</p>
    </div>
    <app-books-table [role]="role" />
  `,
})
export class AdminBooksComponent {
  readonly role = UserRole.Admin;
}
