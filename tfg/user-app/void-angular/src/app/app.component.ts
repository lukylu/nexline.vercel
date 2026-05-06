import { Component, signal, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './layout/navbar/navbar.component';
import { FooterComponent } from './layout/footer/footer.component';
import { MobileMenuComponent } from './layout/mobile-menu/mobile-menu.component';
import { ToastComponent } from './shared/components/toast/toast.component';
import { CookieBarComponent } from './shared/components/cookie-bar/cookie-bar.component';
import { CustomCursorComponent } from './shared/components/custom-cursor/custom-cursor.component';
import { AuthModalComponent } from './shared/components/auth-modal/auth-modal.component';
import { CartDrawerComponent } from './shared/components/cart-drawer/cart-drawer.component';
import { UserPanelComponent } from './shared/components/user-panel/user-panel.component';
import { ProductDetailComponent } from './shared/components/product-detail/product-detail.component';
import { WishlistModalComponent } from './shared/components/wishlist-modal/wishlist-modal.component';
import { OrdersModalComponent } from './shared/components/orders-modal/orders-modal.component';
import { CheckoutComponent } from './shared/components/checkout/checkout.component';
import { AllProductsModalComponent } from './features/all-products-modal/all-products-modal.component';
import { PromotionPopupsComponent } from './features/popups/promotion-popups.component';
import { ProductService } from './core/services/product.service';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'void-root',
  imports: [
    RouterOutlet,
    NavbarComponent,
    FooterComponent,
    MobileMenuComponent,
    ToastComponent,
    CookieBarComponent,
    CustomCursorComponent,
    AuthModalComponent,
    CartDrawerComponent,
    UserPanelComponent,
    ProductDetailComponent,
    WishlistModalComponent,
    OrdersModalComponent,
    CheckoutComponent,
    AllProductsModalComponent,
    PromotionPopupsComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class App implements OnInit {
  private productService = inject(ProductService);
  private authService = inject(AuthService);
  protected readonly title = signal('void-angular');

  ngOnInit() {
    this.authService.checkAuth();
    this.productService.loadProducts();
  }
}
