import { Component, inject } from '@angular/core';
import { ModalService } from '../../../core/services/modal.service';
import { AuthService } from '../../../core/services/auth.service';
import { WishlistService } from '../../../core/services/wishlist.service';

@Component({
  selector: 'void-user-panel',
  imports: [],
  templateUrl: './user-panel.component.html',
  styleUrl: './user-panel.component.css'
})
export class UserPanelComponent {
  modalService = inject(ModalService);
  authService = inject(AuthService);
  wishlistService = inject(WishlistService);

  isOpen() {
    return this.modalService.activeModal() === 'user';
  }

  close() {
    this.modalService.close();
  }

  openOrders() {
    this.modalService.open('orders');
  }

  openWishlist() {
    this.modalService.open('wishlist');
  }

  logout() {
    this.authService.logout();
    this.close();
  }

  wishlistCount() {
    return this.wishlistService.wishes().size;
  }
}
