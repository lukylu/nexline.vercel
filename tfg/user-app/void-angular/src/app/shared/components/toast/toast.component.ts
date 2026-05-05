import { Component, inject } from '@angular/core';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'void-toast',
  standalone: true,
  template: `
    <div class="toast" [class.show]="toast.visible()">
      <span class="toast-dot"></span>
      <span>{{ toast.message() }}</span>
    </div>
  `
})
export class ToastComponent {
  toast = inject(ToastService);
}
