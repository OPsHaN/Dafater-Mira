import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: number;
  text: string;
  kind: 'success' | 'error' | 'info';
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly messages = signal<ToastMessage[]>([]);
  private nextId = 1;

  show(text: string, kind: ToastMessage['kind'] = 'info') {
    const id = this.nextId++;
    this.messages.update((items) => [...items, { id, text, kind }]);
    window.setTimeout(() => this.dismiss(id), 4500);
  }

  dismiss(id: number) {
    this.messages.update((items) => items.filter((item) => item.id !== id));
  }
}
