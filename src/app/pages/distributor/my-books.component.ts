import { Component } from '@angular/core';
import { UserRole } from '../../core/models';
import { BooksTableComponent } from '../../shared/books-table.component';

@Component({
  standalone: true,
  imports: [BooksTableComponent],
  template: `
    <div class="mb-5">
      <h2 class="text-xl font-black">دفاتري</h2>
      <p class="text-sm text-slate-500">قائمة قراءة فقط بالدفاتر المسندة إليك.</p>
    </div>
    <app-books-table [role]="role" [readonly]="true" [showFilters]="false" />
  `,
})
export class MyBooksComponent {
  readonly role = UserRole.Distributor;
}
