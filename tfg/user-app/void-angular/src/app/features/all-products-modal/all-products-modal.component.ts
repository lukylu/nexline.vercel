import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalService } from '../../core/services/modal.service';
import { ProductService } from '../../core/services/product.service';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { Product } from '../../core/models/product.model';

@Component({
  selector: 'void-all-products-modal',
  standalone: true,
  imports: [CommonModule, ProductCardComponent],
  templateUrl: './all-products-modal.component.html',
  styleUrl: './all-products-modal.component.css'
})
export class AllProductsModalComponent {
  modalService = inject(ModalService);
  productService = inject(ProductService);

  searchQuery = signal('');
  categoryFilter = signal('all');
  sortOption = signal('newest');

  isOpen() {
    return this.modalService.activeModal() === 'all-products';
  }

  close() {
    this.modalService.close();
  }

  filteredProducts = computed(() => {
    let products = this.productService.products();

    // Search
    if (this.searchQuery()) {
      const query = this.searchQuery().toLowerCase();
      products = products.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.sub.toLowerCase().includes(query)
      );
    }

    // Category
    if (this.categoryFilter() !== 'all') {
      products = products.filter(p => p.category === this.categoryFilter());
    }

    // Sort
    products = [...products].sort((a, b) => {
      if (this.sortOption() === 'price-low') return a.price - b.price;
      if (this.sortOption() === 'price-high') return b.price - a.price;
      return b.id - a.id; // newest
    });

    return products;
  });

  setCategory(cat: string) {
    this.categoryFilter.set(cat);
  }

  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
  }

  onSortChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.sortOption.set(select.value);
  }
}
