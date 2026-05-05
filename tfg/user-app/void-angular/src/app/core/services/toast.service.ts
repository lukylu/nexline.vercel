import { Injectable, signal, computed } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ToastService {
  message = signal('');
  visible = signal(false);
  private _timeout: any;

  show(msg: string, duration = 3000) {
    clearTimeout(this._timeout);
    this.message.set(msg);
    this.visible.set(true);
    this._timeout = setTimeout(() => this.visible.set(false), duration);
  }
}
