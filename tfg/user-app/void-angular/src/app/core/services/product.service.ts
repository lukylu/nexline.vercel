import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Product, CATEGORY_ORDER } from '../models/product.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private http = inject(HttpClient);

  products = signal<Product[]>([]);
  loading = signal(false);

  // Grouped unique products (first variant of each name)
  uniqueProducts = computed(() => {
    const groups: Record<string, Product[]> = {};
    this.products().forEach(p => {
      if (!groups[p.name]) groups[p.name] = [];
      groups[p.name].push(p);
    });
    const unique = Object.values(groups).map(g => g[0]);
    unique.sort((a, b) => {
      const diff = (CATEGORY_ORDER[a.cat] || 99) - (CATEGORY_ORDER[b.cat] || 99);
      return diff !== 0 ? diff : b.id - a.id;
    });
    return unique;
  });

  // Variant groups keyed by name
  variantGroups = computed(() => {
    const groups: Record<string, Product[]> = {};
    this.products().forEach(p => {
      if (!groups[p.name]) groups[p.name] = [];
      groups[p.name].push(p);
    });
    return groups;
  });

  bestSellers = computed(() => this.uniqueProducts().filter(p => p.is_featured === 1));
  newArrivals = computed(() => this.uniqueProducts().filter(p => p.is_new === 1));

  getByCategory(cat: string) {
    if (cat === 'all') return this.uniqueProducts();
    return this.uniqueProducts().filter(p => p.cat === cat);
  }

  getById(id: number): Product | undefined {
    return this.products().find(p => p.id === id);
  }

  getVariants(name: string): Product[] {
    return this.variantGroups()[name] || [];
  }

  async loadProducts() {
    if (this.products().length > 0) return;
    this.loading.set(true);
    try {
      const data = await this.http.get<any>(`${environment.apiUrl}/api/products`).toPromise();
      const apiProducts = Array.isArray(data) ? data : (data?.products || []);
      const normalized: Product[] = apiProducts.map((p: any) => ({
        id: p.id,
        name: p.name,
        sub: p.description || '',
        price: p.price,
        old_price: p.old_price,
        cat: p.category || 'all',
        badge: p.badge,
        color: p.color || '',
        img: p.image_url || '',
        images: (Array.isArray(p.images) ? p.images : (p.images ? JSON.parse(p.images) : [])).map((img: string) => {
          const fullPath = img.startsWith('http') ? img : `${environment.apiUrl}${img}`;
          return encodeURI(fullPath);
        }),
        sizes: Array.isArray(p.sizes) ? p.sizes : (p.sizes ? JSON.parse(p.sizes) : []),
        stock: p.stock ?? 100,
        is_featured: p.is_featured ?? 0,
        is_new: p.is_new ?? 0,
        created_at: p.created_at
      }));
      this.products.set(normalized);
      console.log('✅ Catálogo cargado:', normalized.length, 'productos');
    } catch (err) {
      console.error('❌ Error cargando productos:', err);
    } finally {
      this.loading.set(false);
    }
  }
}
