import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  readonly activeModal = signal<'auth' | 'cart' | 'user' | 'product' | 'orders' | 'wishlist' | 'checkout' | 'menu' | 'all-products' | null>(null);
  
  // Custom payloads (e.g., product ID for product detail)
  readonly modalPayload = signal<any>(null);

  open(modal: 'auth' | 'cart' | 'user' | 'product' | 'orders' | 'wishlist' | 'checkout' | 'menu' | 'all-products', payload: any = null) {
    this.activeModal.set(modal);
    this.modalPayload.set(payload);
    if (modal !== 'menu') {
      document.body.style.overflow = 'hidden';
    }
  }

  close() {
    this.activeModal.set(null);
    this.modalPayload.set(null);
    document.body.style.overflow = '';
  }

  // Toggle helpers
  toggleUserPanel() {
    if (this.activeModal() === 'user') {
      this.close();
    } else {
      this.open('user');
    }
  }

  toggleCart() {
    if (this.activeModal() === 'cart') {
      this.close();
    } else {
      this.open('cart');
    }
  }

  toggleMenu() {
    if (this.activeModal() === 'menu') {
      this.close();
    } else {
      this.open('menu');
    }
  }
}
