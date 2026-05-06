import { Component, inject } from '@angular/core';
import { ProductService } from '../../core/services/product.service';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { RevealDirective } from '../../shared/directives/reveal.directive';

@Component({
  selector: 'void-new-arrivals',
  imports: [ProductCardComponent, RevealDirective],
  templateUrl: './new-arrivals.component.html',
  styleUrl: './new-arrivals.component.css'
})
export class NewArrivalsComponent {
  productService = inject(ProductService);
}
