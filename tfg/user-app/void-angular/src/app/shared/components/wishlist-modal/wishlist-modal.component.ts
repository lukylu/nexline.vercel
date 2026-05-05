import { Component, inject, computed } from '@angular/core';
import { ModalService } from '../../../core/services/modal.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { ProductService } from '../../../core/services/product.service';
import { ProductCardComponent } from '../product-card/product-card.component';

@Component({
  selector: 'void-wishlist-modal',
  imports: [ProductCardComponent],
  templateUrl: './wishlist-modal.component.html',
  styleUrl: './wishlist-modal.component.css'
})
export class WishlistModalComponent {
  modalService = inject(ModalService);
  wishlistService = inject(WishlistService);
  productService = inject(ProductService);

  isOpen() {
    return this.modalService.activeModal() === 'wishlist';
  }

  close() {
    this.modalService.close();
  }

  wishlistItems = computed(() => {
    const ids = Array.from(this.wishlistService.wishes());
    return this.productService.products().filter(p => ids.includes(p.id));
  });
}
