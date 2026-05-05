import { Component, HostListener, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ModalService } from '../../core/services/modal.service';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'void-navbar',
  imports: [RouterLink],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  isScrolled = false;
  
  modalService = inject(ModalService);
  authService = inject(AuthService);
  cartService = inject(CartService);

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled = window.scrollY > 50;
  }

  openAuth() {
    this.modalService.open('auth');
  }

  toggleUserPanel() {
    this.modalService.toggleUserPanel();
  }

  openCart() {
    if (this.authService.isLoggedIn()) {
      this.modalService.open('cart');
    } else {
      this.modalService.open('auth');
    }
  }

  toggleMenu() {
    this.modalService.toggleMenu();
  }
}
