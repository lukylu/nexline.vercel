import { Component, inject } from '@angular/core';
import { ModalService } from '../../../core/services/modal.service';

@Component({
  selector: 'void-checkout',
  imports: [],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css'
})
export class CheckoutComponent {
  modalService = inject(ModalService);

  isOpen() {
    return this.modalService.activeModal() === 'checkout';
  }

  close() {
    this.modalService.close();
  }
}
