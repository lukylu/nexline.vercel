import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ModalService } from '../../core/services/modal.service';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'void-mobile-menu',
  imports: [RouterLink],
  templateUrl: './mobile-menu.component.html',
  styleUrl: './mobile-menu.component.css',
})
export class MobileMenuComponent {
  modalService = inject(ModalService);
  authService = inject(AuthService);
  cartService = inject(CartService);

  isOpen() {
    return this.modalService.activeModal() === 'menu';
  }

  closeMenu() {
    this.modalService.close();
  }

  openAuth() {
    this.closeMenu();
    this.modalService.open('auth');
  }

  openCart() {
    this.closeMenu();
    if (this.authService.isLoggedIn()) {
      this.modalService.open('cart');
    } else {
      this.modalService.open('auth');
    }
  }
}
