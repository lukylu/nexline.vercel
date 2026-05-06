import { Component, inject } from '@angular/core';
import { ProductService } from '../../core/services/product.service';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { ModalService } from '../../core/services/modal.service';
import { RevealDirective } from '../../shared/directives/reveal.directive';

@Component({
  selector: 'void-collection',
  imports: [ProductCardComponent, RevealDirective],
  templateUrl: './collection.component.html',
  styleUrl: './collection.component.css'
})
export class CollectionComponent {
  productService = inject(ProductService);

  modalService = inject(ModalService);

  scrollCar(dir: number) {
    const grid = document.getElementById('pgrid-carousel');
    if (grid) {
      grid.scrollBy({ left: dir * 300, behavior: 'smooth' });
    }
  }

  openAllProductsModal() {
    this.modalService.open('all-products');
  }
}
