import { products, productImgs } from './data';
import { doWish, syncAllWishUI, renderWishlistModal } from './wishes';
import { colorMap } from './utils';
import * as state from './state';


export let cachedProducts: any[] = [];

export async function loadProducts() {
  try {
    const res = await fetch('http://localhost:3000/api/products');
    const data = await res.json();
    const apiProducts = Array.isArray(data) ? data : (data.products || []);
    
    // Merge API data with local data (enrichment)
    cachedProducts = apiProducts.map((p: any) => {
      const local = (products.find(lp => lp.name === p.name) || {}) as any;
      return {
        ...local,
        ...p,
        // Map backend fields to frontend expectations
        sub: p.description || local.sub || '',
        cat: p.category || local.cat || 'all',
        sizes: Array.isArray(p.sizes) ? p.sizes : (p.sizes ? JSON.parse(p.sizes) : (local.sizes || [])),
        images: (Array.isArray(p.images) ? p.images : (p.images ? JSON.parse(p.images) : [])).map((img: string) => {
          const fullPath = img.startsWith('http') ? img : `http://localhost:3000${img}`;
          return encodeURI(fullPath);
        }),
        // Use local img if backend has none
        img: local.img || ''
      };
    });
    
    console.log('✅ Catálogo dinámico cargado:', cachedProducts.length, 'productos');
    return cachedProducts;
  } catch (err) {
    console.error('❌ Error cargando productos de la API:', err);
    cachedProducts = products; // Fallback to local
    return products;
  }
}


export async function renderProducts(f = 'all') {
  if (cachedProducts.length === 0) {
    await loadProducts();
  }
  
  // Group by name for the complete catalog
  const groups: Record<string, any[]> = {};
  cachedProducts.forEach(p => {
    if (!groups[p.name]) groups[p.name] = [];
    groups[p.name].push(p);
  });
  const allUnique = Object.values(groups).map(group => group[0]); // Primary variants

  // Split into collections
  const bestSellers = allUnique.filter(p => p.is_featured === 1);
  const newArrivals = allUnique.filter(p => p.is_new === 1);
  const filteredCatalog = f === 'all' ? allUnique : allUnique.filter(p => p.cat === f);

  // Helper to generate HTML card
  const buildCardHtml = (p: any, i: number) => {
    const variants = groups[p.name];
    const images = p.images || [];
    const mainImg = images.length > 0 ? p.images[0] : ((productImgs[p.id] && productImgs[p.id][0]) || p.img);
    
    return `
    <div class="pc" data-id="${p.id}" style="transition-delay:${i * 0.05}s">
      <div class="pimg-wrap" onclick="openPd(${p.id})">
        <img class="pimg ${p.category === 'sneakers' ? 'pimg-contain' : ''}" id="pimg-${p.id}" src="${mainImg}" alt="Fotografía de producto: ${p.name}" loading="lazy">
        ${p.badge ? `<span class="pbadge b-${p.badge.toLowerCase()}">${p.badge}</span>` : ''}
        ${p.stock <= 0 ? `<span class="pbadge b-sold">AGOTADO</span>` : ''}
        <button class="pwish" onclick="toggleWish(event,${p.id})" id="wish-${p.id}" aria-label="Guardar ${p.name} en wishlist">♡</button>
        ${p.stock > 0 ? `<button class="pqa" onclick="fastAdd(event,${p.id})" aria-label="Añadir ${p.name} al carrito rápidamente"><span>+</span> ${state.isLoggedIn() ? 'AÑADIR RÁPIDO' : 'INICIAR SESIÓN'}</button>` : ''}
      </div>
      <div class="pinfo">
        <div class="pname" onclick="openPd(${p.id})">${p.name}</div>
        <div class="psub">${p.sub.split('.')[0]}</div>
        <div class="pfooter">
          <div class="pprice">${p.old_price ? `<span class="old">${p.old_price}€</span><span class="sale">${p.price}€</span>` : `${p.price}€`}</div>
          <div class="pswaches">
            ${variants.map((v: any) => `
              <div class="psw" 
                style="background: ${colorMap[v.color.toUpperCase()] || '#ccc'}" 
                title="${v.color}"
                onclick="event.stopPropagation(); updateCardVariant(${p.id}, ${v.id})">
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `};

  // Render Grids
  const bsGrid = document.getElementById('bsGrid');
  if (bsGrid) bsGrid.innerHTML = bestSellers.map(buildCardHtml).join('');

  const naGrid = document.getElementById('naGrid');
  if (naGrid) naGrid.innerHTML = newArrivals.map(buildCardHtml).join('');

  const carGrid = document.getElementById('pgrid-carousel');
  if (carGrid) carGrid.innerHTML = filteredCatalog.map(buildCardHtml).join('');

  const modalGrid = document.getElementById('modalGrid');
  if (modalGrid) modalGrid.innerHTML = filteredCatalog.map(buildCardHtml).join('');

  // Update counter
  const prodCount = document.getElementById('prodCount');
  if (prodCount) prodCount.textContent = filteredCatalog.length + ' productos';

  // Add global helper for variant switching in grid
  (window as any).updateCardVariant = (baseId: number, variantId: number) => {
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
  
  // Carousel Scroll Helper
  (window as any).scrollCar = (dir: number) => {
    const car = document.getElementById('pgrid-carousel');
    if (car) {
      const cardWidth = (car.querySelector('.pc') as HTMLElement)?.offsetWidth || 300;
      car.scrollBy({ left: dir * cardWidth, behavior: 'smooth' });
    }
  };

  requestAnimationFrame(() => {
    document.querySelectorAll('.pc').forEach((el, i) => setTimeout(() => el.classList.add('visible'), i * 50));
    // Sync wish hearts after cards are in DOM
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

export async function filterModal(btn: HTMLElement, cat: string) {
  document.querySelectorAll('#allProductsBox .fb').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  await renderProducts(cat);
}

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
