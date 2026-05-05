import { Component, inject } from '@angular/core';
import { ModalService } from '../../../core/services/modal.service';

@Component({
  selector: 'void-orders-modal',
  imports: [],
  templateUrl: './orders-modal.component.html',
  styleUrl: './orders-modal.component.css'
})
export class OrdersModalComponent {
  modalService = inject(ModalService);

  isOpen() {
    return this.modalService.activeModal() === 'orders';
  }

  close() {
    this.modalService.close();
  }
}
