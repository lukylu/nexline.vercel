import { Injectable, signal, computed, inject } from '@angular/core';
import { AuthService } from './auth.service';
import { ToastService } from './toast.service';

@Injectable({ providedIn: 'root' })
export class WishlistService {
  private auth = inject(AuthService);
  private toast = inject(ToastService);

  wishes = signal<Set<number>>(this.loadWishes());
  showModal = signal(false);

  count = computed(() => this.wishes().size);

  private loadWishes(): Set<number> {
    try {
      const saved = localStorage.getItem('voidWishlist');
      if (saved) return new Set(JSON.parse(saved));
    } catch {}
    return new Set();
  }

  private saveWishes() {
    localStorage.setItem('voidWishlist', JSON.stringify([...this.wishes()]));
  }

  has(id: number): boolean {
    return this.wishes().has(id);
  }

  toggle(id: number) {
    if (!this.auth.requireAuth('wish', id)) return;

    const current = new Set(this.wishes());
    if (current.has(id)) {
      current.delete(id);
      this.toast.show('× ELIMINADO DE WISHLIST');
    } else {
      current.add(id);
      this.toast.show('♥ GUARDADO EN WISHLIST');
    }
    this.wishes.set(current);
    this.saveWishes();
  }

  openWishlist() {
    if (!this.auth.requireAuth('wish-open')) return;
    this.showModal.set(true);
  }

  closeWishlist() {
    this.showModal.set(false);
  }

  clearAll() {
    this.wishes.set(new Set());
    localStorage.removeItem('voidWishlist');
  }
}
