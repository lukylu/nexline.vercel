import { Component, inject, computed, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalService } from '../../../core/services/modal.service';
import { CartService } from '../../../core/services/cart.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { Product } from '../../../core/models/product.model';

@Component({
  selector: 'void-product-detail',
  imports: [CommonModule],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.css'
})
export class ProductDetailComponent {
  modalService = inject(ModalService);
  cartService = inject(CartService);
  wishlistService = inject(WishlistService);

  showSizeGuide = signal(false);
  selectedSize = signal<string | null>(null);
  currentImg = signal<string>('');

  product = computed<Product | null>(() => {
    if (this.modalService.activeModal() === 'product') {
      return this.modalService.modalPayload() as Product;
    }
    return null;
  });

  images = computed(() => {
    const p = this.product();
    if (!p) return [];
    return (p.images && p.images.length > 0) ? p.images : [p.img || ''];
  });

  isSoldOut = computed(() => this.product()?.stock === 0);

  constructor() {
    effect(() => {
      const imgs = this.images();
      if (imgs && imgs.length > 0) {
        this.currentImg.set(imgs[0]);
      }
      this.selectedSize.set(null);
      this.showSizeGuide.set(false);
    });
  }

  isOpen() {
    return this.modalService.activeModal() === 'product';
  }

  close() {
    this.modalService.close();
  }

  setImg(img: string) {
    this.currentImg.set(img);
  }

  addToCart() {
    if (this.isSoldOut()) return;
    const p = this.product();
    if (p) {
      if (!this.selectedSize() && p.sizes && p.sizes.length > 0) {
        alert('Por favor selecciona una talla');
        return;
      }
      this.cartService.addToCart(p.id, this.selectedSize() || null);
      this.close();
    }
  }

  isInWishlist() {
    const p = this.product();
    return p ? this.wishlistService.has(p.id) : false;
  }

  toggleWishlist() {
    const p = this.product();
    if (p) {
      this.wishlistService.toggle(p.id);
    }
  }
}
