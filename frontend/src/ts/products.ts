import { products, productImgs } from './data';
import { doWish, syncAllWishUI, renderWishlistModal } from './wishes';
import { colorMap } from './utils';
import * as state from './state';
import { API_URL, BASE_URL } from './config';

export let cachedProducts: any[] = [];

export async function loadProducts() {
  try {
    const res = await fetch(`${API_URL}/products`);
    const data = await res.json();
    const apiProducts = Array.isArray(data) ? data : (data.products || []);
    
    // Normalize API products
    const apiNormalized = apiProducts.map((p: any) => {
      const local = (products.find(lp => lp.name === p.name) || {}) as any;
      return {
        ...local,
        ...p,
        id: p.id || p._id || local.id || Math.floor(Math.random() * 1000000),
        sub: p.description || local.sub || '',
        cat: (p.category || p.cat || local.cat || 'all').toLowerCase(),
        sizes: Array.isArray(p.sizes) ? p.sizes : (p.sizes ? JSON.parse(p.sizes) : (local.sizes || [])),
        images: (Array.isArray(p.images) ? p.images : (p.images ? JSON.parse(p.images) : [])).map((img: string) => {
          const fullPath = img.startsWith('http') ? img : `${BASE_URL}${img}`;
          return encodeURI(fullPath);
        }),
        img: p.image_url || local.img || ''
      };
    });

    // Find local products NOT in API (matching by name)
    const apiNames = new Set(apiNormalized.map((p: any) => p.name));
    const localOnly = products.filter(lp => !apiNames.has(lp.name));

    cachedProducts = [...apiNormalized, ...localOnly].map(p => ({
      ...p,
      is_featured: p.is_featured ?? (p.badge?.toLowerCase().includes('hot') ? 1 : 0),
      is_new: p.is_new ?? (p.badge?.toLowerCase().includes('new') ? 1 : 0),
    }));
    console.log('✅ Catálogo combinado:', cachedProducts.length, 'productos');
    return cachedProducts;
  } catch (err) {
    console.error('❌ Error API, usando local:', err);
    cachedProducts = products.map(p => ({
      ...p,
      is_featured: p.is_featured ?? (p.badge?.toLowerCase().includes('hot') ? 1 : 0),
      is_new: p.is_new ?? (p.badge?.toLowerCase().includes('new') ? 1 : 0),
    }));
    return cachedProducts;
  }
}


// Helper to generate HTML card
function buildCardHtml(p: any, i: number, groups: Record<string, any[]>) {
  const images = p.images || [];
  const mainImg = images.length > 0 ? p.images[0] : ((productImgs[p.id] && productImgs[p.id][0]) || p.img);
  const variants = groups[p.name] || [p];
  // Deduplicate variants by color to avoid repeated swatches
  const seenColors = new Set();
  const uniqueVariants = variants.filter((v: any) => {
    const c = (v.color || '').toUpperCase();
    if (seenColors.has(c)) return false;
    seenColors.add(c);
    return true;
  });
  
  return `
  <div class="pc" data-id="${p.id}" style="transition-delay:${i * 0.05}s">
    <div class="pimg-wrap" onclick="openPd('${p.id}')">
      <img class="pimg ${p.category === 'sneakers' ? 'pimg-contain' : ''}" id="pimg-${p.id}" src="${mainImg}" alt="Fotografía de producto: ${p.name}" loading="lazy">
      ${p.badge ? `<span class="pbadge b-${p.badge.toLowerCase()}">${p.badge}</span>` : ''}
      ${p.stock <= 0 ? `<span class="pbadge b-sold">AGOTADO</span>` : ''}
      <button class="pwish" onclick="toggleWish(event,'${p.id}')" id="wish-${p.id}" aria-label="Guardar ${p.name} en wishlist">♡</button>
      ${p.stock > 0 ? `<button class="pqa" onclick="fastAdd(event,'${p.id}')" aria-label="Añadir ${p.name} al carrito rápidamente"><span>+</span> ${state.isLoggedIn() ? 'AÑADIR RÁPIDO' : 'INICIAR SESIÓN'}</button>` : ''}
    </div>
    <div class="pinfo">
      <div class="pname" onclick="openPd('${p.id}')">${p.name}</div>
      <div class="psub">${p.sub.split('.')[0]}</div>
      <div class="pfooter">
        <div class="pprice">${p.old_price ? `<span class="old">${p.old_price}€</span><span class="sale">${p.price}€</span>` : `${p.price}€`}</div>
        <div class="pswaches">
          ${uniqueVariants.map((v: any) => `
            <div class="psw" 
              style="background: ${colorMap[v.color.toUpperCase()] || '#ccc'}" 
              title="${v.color}"
              onclick="event.stopPropagation(); updateCardVariant('${p.id}', '${v.id}')">
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  </div>
`}

export async function renderProducts(f = 'all') {
  if (cachedProducts.length === 0) {
    await loadProducts();
  }
  
  const groups: Record<string, any[]> = {};
  cachedProducts.forEach(p => {
    if (!groups[p.name]) groups[p.name] = [];
    groups[p.name].push(p);
  });
  const allUnique = Object.values(groups).map(group => {
    const main = { ...group[0] };
    main.is_new = group.some(p => p.is_new) ? 1 : 0;
    main.is_featured = group.some(p => p.is_featured) ? 1 : 0;
    return main;
  });

  const catOrder: Record<string, number> = { 'hoodies': 1, 'tees': 2, 'jackets': 3, 'sneakers': 4 };
  allUnique.sort((a, b) => {
    const diff = (catOrder[a.cat] || 99) - (catOrder[b.cat] || 99);
    return diff !== 0 ? diff : b.id - a.id;
  });

  const bestSellers = allUnique.filter(p => p.is_featured);
  const newArrivals = allUnique.filter(p => p.is_new);
  const filteredCatalog = f === 'all' ? allUnique : allUnique.filter(p => p.cat.toLowerCase() === f.toLowerCase());

  const bsGrid = document.getElementById('bsGrid');
  if (bsGrid) bsGrid.innerHTML = bestSellers.map((p, i) => buildCardHtml(p, i, groups)).join('');

  const naGrid = document.getElementById('naGrid');
  if (naGrid) naGrid.innerHTML = newArrivals.map((p, i) => buildCardHtml(p, i, groups)).join('');

  const carGrid = document.getElementById('pgrid-carousel');
  if (carGrid) carGrid.innerHTML = filteredCatalog.map((p, i) => buildCardHtml(p, i, groups)).join('');

  const modalGrid = document.getElementById('modalGrid');
  if (modalGrid) modalGrid.innerHTML = filteredCatalog.map((p, i) => buildCardHtml(p, i, groups)).join('');

  const prodCount = document.getElementById('prodCount');
  if (prodCount) prodCount.textContent = filteredCatalog.length + ' productos';

  (window as any).updateCardVariant = (baseId: string, variantId: string) => {
    const v = cachedProducts.find(x => x.id === variantId);
    if (!v) return;
    const imgs = document.querySelectorAll(`#pimg-${baseId}`);
    imgs.forEach(img => {
      if (img && v.images && v.images.length > 0) {
        (img as HTMLImageElement).src = v.images[0];
      }
      const card = img.closest('.pc') as HTMLElement;
      if (card) {
        card.onclick = () => (window as any).openPd(variantId);
        const name = card.querySelector('.pname') as HTMLElement;
        if (name) name.onclick = () => (window as any).openPd(variantId);
        const imgWrap = card.querySelector('.pimg-wrap') as HTMLElement;
        if (imgWrap) imgWrap.onclick = () => (window as any).openPd(variantId);
      }
    });
  };
  
  (window as any).scrollCar = (dir: number) => {
    const car = document.getElementById('pgrid-carousel');
    if (car) {
      const cardWidth = (car.querySelector('.pc') as HTMLElement)?.offsetWidth || 300;
      car.scrollBy({ left: dir * cardWidth, behavior: 'smooth' });
    }
  };

  requestAnimationFrame(() => {
    document.querySelectorAll('.pc').forEach((el, i) => setTimeout(() => el.classList.add('visible'), i * 50));
    setTimeout(() => {
      syncAllWishUI();
      renderWishlistModal();
    }, 100);
  });
}

export async function filterP(btn: HTMLElement, cat: string) {
  document.querySelectorAll('#products .fb').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  await renderProducts(cat);
}

let currentModalCat = 'all';

export async function filterModal(btn: HTMLElement, cat: string) {
  document.querySelectorAll('#allProductsBox .mf-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  currentModalCat = cat;
  await (window as any).applyModalFilters();
}

(window as any).applyModalFilters = async () => {
  const searchInput = document.getElementById('modalSearch') as HTMLInputElement;
  const sortSelect = document.getElementById('modalSort') as HTMLSelectElement;
  const searchTerm = searchInput?.value.toLowerCase() || '';
  const sortBy = sortSelect?.value || 'newest';
  
  if (cachedProducts.length === 0) await loadProducts();
  
  const groups: Record<string, any[]> = {};
  cachedProducts.forEach(p => {
    if (!groups[p.name]) groups[p.name] = [];
    groups[p.name].push(p);
  });
  const allUnique = Object.values(groups).map(group => group[0]);

  const catOrder: Record<string, number> = { 'hoodies': 1, 'tees': 2, 'jackets': 3, 'sneakers': 4 };
  allUnique.sort((a, b) => {
    const diff = (catOrder[a.cat] || 99) - (catOrder[b.cat] || 99);
    return diff !== 0 ? diff : b.id - a.id;
  });

  let filtered = allUnique;
  if (currentModalCat !== 'all') {
    filtered = filtered.filter(p => p.cat === currentModalCat);
  }
  if (searchTerm) {
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(searchTerm) || 
      p.sub.toLowerCase().includes(searchTerm) ||
      p.cat.toLowerCase().includes(searchTerm)
    );
  }
  
  if (sortBy === 'price-low') filtered.sort((a, b) => a.price - b.price);
  else if (sortBy === 'price-high') filtered.sort((a, b) => b.price - a.price);

  const modalGrid = document.getElementById('modalGrid');
  if (modalGrid) {
    modalGrid.innerHTML = filtered.map((p, i) => buildCardHtml(p, i, groups)).join('');
    requestAnimationFrame(() => {
      modalGrid.querySelectorAll('.pc').forEach((el, i) => {
        setTimeout(() => el.classList.add('visible'), i * 20);
      });
    });
  }
  
  const modalCount = document.getElementById('modalCount');
  if (modalCount) modalCount.textContent = `${filtered.length} PRODUCTOS ENCONTRADOS`;
};

export function toggleWish(e: Event, id: number) {
  e.stopPropagation();
  doWish(id);
}

// Global modal handlers
(window as any).openAllProductsModal = () => {
  const overlay = document.getElementById('allProductsOverlay');
  const box = document.getElementById('allProductsBox');
  if (overlay && box) {
    overlay.classList.add('open');
    box.classList.add('open');
    document.body.style.overflow = 'hidden';
    (window as any).applyModalFilters();
  }
};

(window as any).closeAllProductsModal = () => {
  const overlay = document.getElementById('allProductsOverlay');
  const box = document.getElementById('allProductsBox');
  if (overlay && box) {
    overlay.classList.remove('open');
    box.classList.remove('open');
    document.body.style.overflow = '';
  }
};
