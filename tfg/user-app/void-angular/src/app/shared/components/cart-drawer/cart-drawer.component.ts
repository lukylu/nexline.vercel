import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalService } from '../../../core/services/modal.service';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'void-cart-drawer',
  imports: [CommonModule],
  templateUrl: './cart-drawer.component.html',
  styleUrl: './cart-drawer.component.css'
})
export class CartDrawerComponent {
  modalService = inject(ModalService);
  cartService = inject(CartService);

  isOpen() {
    return this.modalService.activeModal() === 'cart';
  }

  close() {
    this.modalService.close();
  }

  openCheckout() {
    this.modalService.open('checkout');
  }
}
