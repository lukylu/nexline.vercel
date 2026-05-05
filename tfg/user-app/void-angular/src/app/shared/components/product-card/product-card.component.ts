import { Component, Input, inject } from '@angular/core';
import { Product } from '../../../core/models/product.model';
import { ModalService } from '../../../core/services/modal.service';
import { WishlistService } from '../../../core/services/wishlist.service';

@Component({
  selector: 'void-product-card',
  imports: [],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.css'
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;
  
  private modalService = inject(ModalService);
  private wishlistService = inject(WishlistService);

  openDetail(product: Product) {
    this.modalService.open('product', product);
  }

  isInWishlist() {
    return this.wishlistService.has(this.product.id);
  }

  toggleWishlist(event: Event, product: Product) {
    event.stopPropagation();
    this.wishlistService.toggle(product.id);
  }

  getMainImage(): string {
    return this.product.img || (this.product.images && this.product.images[0]) || '';
  }

  getHoverImage(): string {
    if (this.product.images && this.product.images.length > 1) {
      return this.product.images[1];
    }
    return this.getMainImage();
  }
}
