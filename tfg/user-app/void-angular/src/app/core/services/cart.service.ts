import { Injectable, signal, computed, inject } from '@angular/core';
import { CartItem, Product } from '../models/product.model';
import { AuthService } from './auth.service';
import { ToastService } from './toast.service';
import { ProductService } from './product.service';

@Injectable({ providedIn: 'root' })
export class CartService {
  private auth = inject(AuthService);
  private toast = inject(ToastService);
  private productService = inject(ProductService);

  items = signal<CartItem[]>([]);
  discountApplied = signal(false);
  showDrawer = signal(false);

  count = computed(() => this.items().reduce((s, i) => s + i.qty, 0));
  subtotal = computed(() => this.items().reduce((s, i) => s + i.price * i.qty, 0));
  total = computed(() => {
    const sub = this.subtotal();
    return this.discountApplied() ? sub * 0.9 : sub;
  });

  openCart() {
    if (!this.auth.requireAuth('cart-open')) return;
    this.showDrawer.set(true);
  }

  closeCart() {
    this.showDrawer.set(false);
  }

  addToCart(id: number, size: string | null) {
    if (!this.auth.requireAuth('cart', id, size)) return;

    const p = this.productService.getById(id);
    if (!p || p.badge === 'sold') return;

    const selectedSize = size || p.sizes[0];
    const current = this.items();
    const existing = current.find(x => x.id === id && x.size === selectedSize);

    if (existing) {
      this.items.set(current.map(x =>
        x.id === id && x.size === selectedSize ? { ...x, qty: x.qty + 1 } : x
      ));
    } else {
      const mainImg = (p.images && p.images.length > 0) ? p.images[0] : p.img;
      this.items.set([...current, {
        id: p.id,
        name: p.name,
        price: p.price,
        img: mainImg,
        size: selectedSize,
        qty: 1
      }]);
    }

    this.toast.show('✓ AÑADIDO AL CARRITO');
  }

  fastAdd(id: number) {
    this.addToCart(id, null);
  }

  removeFromCart(id: number, size: string) {
    this.items.set(this.items().filter(x => !(x.id === id && x.size === size)));
  }

  clearCart() {
    this.items.set([]);
  }
}
