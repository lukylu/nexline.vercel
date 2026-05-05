import * as state from './state';
import { productImgs } from './data';
import { cachedProducts } from './products';
import { addToCart } from './cart';
import { doWish, wishes, renderWishlistModal } from './wishes';
import { showToast, colorMap } from './utils';
import { switchAuthTab, logoutUser } from './auth';

export function openPd(id: number) {
  const p = cachedProducts.find(x => x.id === id);
  if (!p) return;
  
  state.setPdCurrentId(id);
  state.setPdSelectedSize(null);
  
  const sizeGuide = document.getElementById('pdSizeGuide');
  if (sizeGuide) sizeGuide.classList.remove('open');

  const imgs = (p.images && p.images.length > 0) ? p.images : ((productImgs[id] && productImgs[id].length > 0) ? productImgs[id] : [p.img]);

  const mainImg = document.getElementById('pdImg') as HTMLImageElement;
  if (mainImg) {
    mainImg.src = imgs[0];
    mainImg.alt = `${p.name} — vista principal`;
    mainImg.classList.remove('switching');
    if (p.category === 'sneakers') {
      mainImg.classList.add('pimg-contain');
      mainImg.style.background = '#f5f5f5';
    } else {
      mainImg.classList.remove('pimg-contain');
      mainImg.style.background = '';
    }
  }

  const thumbsEl = document.getElementById('pdThumbs');
  if (thumbsEl) {
    thumbsEl.innerHTML = imgs.map((src: any, i: number) => `
      <div class="popup-thumb${i === 0 ? ' active' : ''}" onclick="switchPdImg(this,${i})" onmouseenter="switchPdImg(this,${i})">
        <img src="${src}" alt="${p.name} — ángulo ${i + 1} de ${imgs.length}" loading="lazy">
      </div>
    `).join('');
    thumbsEl.dataset.pdid = id.toString();
  }

  const pdName = document.getElementById('pdName');
  if (pdName) pdName.innerHTML = `${p.name} ${p.color ? `<span style="font-size:12px; opacity:0.5; margin-left:10px; font-weight:400;">${p.color}</span>` : ''}`;
  
  const pdSub = document.getElementById('pdSub');
  if (pdSub) pdSub.textContent = p.sub;

  const pb = document.getElementById('pdBadge');
  if (pb) {
    if (p.badge) {
      pb.textContent = p.badge === 'new' ? 'NUEVO' : p.badge === 'sold' ? 'AGOTADO' : 'HOT';
      pb.className = 'popup-badge b-' + p.badge;
      pb.style.display = '';
    } else {
      pb.style.display = 'none';
    }
  }

  const pdPrice = document.getElementById('pdPrice');
  if (pdPrice) {
    pdPrice.innerHTML = p.old_price ? `<span class="old">${p.old_price}€</span><span class="sale">${p.price}€</span>` : `${p.price}€`;
  }

  const pdSizes = document.getElementById('pdSizes');
  if (pdSizes) {
    pdSizes.innerHTML = p.sizes.map((s: any) => `<button class="psz" onclick="selectPdSize(this,'${s}')">${s}</button>`).join('');
  }

  // Color variants in popup
  const baseName = p.name.trim();
  const variants = cachedProducts.filter(x => x.name.trim() === baseName);
  const colorSection = document.getElementById('pdColors');
  
  if (colorSection) {
    if (variants.length > 1) {
      colorSection.style.display = 'block';
      colorSection.style.minHeight = '30px'; // Ensure visibility
      colorSection.innerHTML = `
        <div class="pd-colors-label">Colores disponibles</div>
        <div class="pd-colors-list">
          ${variants.map(v => {
            const colorKey = (v.color || '').toUpperCase().trim();
            const colorStyle = colorMap[colorKey] || '#888';
            return `
              <div class="pd-color-opt ${v.id === p.id ? 'active' : ''}" 
                style="background: ${colorStyle}" 
                title="${v.color || 'Color'}"
                onclick="openPd(${v.id})">
              </div>
            `;
          }).join('')}
        </div>
      `;
    } else {
      colorSection.style.display = 'none';
      console.log('Solo se encontró una variante para:', baseName);
    }
  }

  const addBtn = document.querySelector('.popup-add span');
  if (addBtn) {
    if (!state.isLoggedIn()) {
      addBtn.textContent = 'INICIA SESIÓN PARA COMPRAR';
    } else {
      addBtn.textContent = p.badge === 'sold' ? 'AGOTADO' : '+ Añadir al carrito';
    }
  }

  const overlay = document.getElementById('pdOverlay');
  const box = document.getElementById('pdBox');
  if (overlay) overlay.classList.add('open');
  if (box) box.classList.add('open');
  document.body.style.overflow = 'hidden';
}

export function closePd() {
  const overlay = document.getElementById('pdOverlay');
  const box = document.getElementById('pdBox');
  if (overlay) overlay.classList.remove('open');
  if (box) box.classList.remove('open');
  document.body.style.overflow = '';
}

export function switchPdImg(_thumb: HTMLElement, idx: number) {
  const thumbsEl = document.getElementById('pdThumbs');
  if (!thumbsEl) return;
  const pid = +(thumbsEl.dataset.pdid || 0);
  const p = cachedProducts.find(x => x.id === pid);
  const mainImg = document.getElementById('pdImg') as HTMLImageElement;
  if (!mainImg || !p) return;
  
  const imgs = (p.images && p.images.length > 0) ? p.images : ((productImgs[pid] && productImgs[pid].length > 0) ? productImgs[pid] : [mainImg.src]);
  const src = imgs[idx];
  if (!src) return;
  
  mainImg.classList.add('switching');
  setTimeout(() => {
    mainImg.src = src;
    mainImg.classList.remove('switching');
  }, 200);
  
  document.querySelectorAll('.popup-thumb').forEach((t, i) => t.classList.toggle('active', i === idx));
}

export function toggleSizeGuide() {
  const sg = document.getElementById('pdSizeGuide');
  if (sg) sg.classList.toggle('open');
}

export function selectPdSize(btn: HTMLElement, size: string) {
  document.querySelectorAll('.psz').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  state.setPdSelectedSize(size);
}

export function pdAddCart() {
  if (!state.pdCurrentId) return;
  const p = cachedProducts.find(x => x.id === state.pdCurrentId);
  if (p && p.badge === 'sold') {
    showToast('PRODUCTO AGOTADO');
    return;
  }
  if (!state.isLoggedIn()) {
    closePd();
    openAuth('login', { type: 'cart', id: state.pdCurrentId, size: state.pdSelectedSize });
    showToast('⚠ INICIA SESIÓN PARA COMPRAR');
    return;
  }
  addToCart(state.pdCurrentId, state.pdSelectedSize);
  closePd();
}

export function pdWish() {
  if (!state.pdCurrentId) return;
  if (!state.isLoggedIn()) {
    openAuth('login', { type: 'wish', id: state.pdCurrentId });
    showToast('⚠ INICIA SESIÓN PARA GUARDAR');
    return;
  }
  doWish(state.pdCurrentId);
  const wBtn = document.querySelector('.popup-wish');
  if (wBtn) wBtn.textContent = wishes.has(state.pdCurrentId) ? '♥ En tu wishlist' : '♡ Guardar en wishlist';
}

export function openNlPopup() {
  const overlay = document.getElementById('nlPopupOverlay');
  const modal = document.getElementById('nlPopup');
  if (overlay) overlay.classList.add('open');
  if (modal) modal.classList.add('open');
}

export function closeNlPopup() {
  const overlay = document.getElementById('nlPopupOverlay');
  const modal = document.getElementById('nlPopup');
  if (overlay) overlay.classList.remove('open');
  if (modal) modal.classList.remove('open');
  localStorage.setItem('nlDismissed', 'true');
}

let exitShown = false;
export function openExit() {
  if (exitShown || localStorage.getItem('exitShown')) return;
  exitShown = true;
  const overlay = document.getElementById('exitOverlay');
  const modal = document.getElementById('exitModal');
  if (overlay) overlay.classList.add('open');
  if (modal) modal.classList.add('open');
  localStorage.setItem('exitShown', 'true');
}

export function closeExit() {
  const overlay = document.getElementById('exitOverlay');
  const modal = document.getElementById('exitModal');
  if (overlay) overlay.classList.remove('open');
  if (modal) modal.classList.remove('open');
}

export function openSg() {
  const overlay = document.getElementById('sgOverlay');
  const modal = document.getElementById('sgPopup');
  if (overlay) overlay.classList.add('open');
  if (modal) modal.classList.add('open');
}

export function closeSg() {
  const overlay = document.getElementById('sgOverlay');
  const modal = document.getElementById('sgPopup');
  if (overlay) overlay.classList.remove('open');
  if (modal) modal.classList.remove('open');
}

export function openCart() {
  if (!state.isLoggedIn()) {
    openAuth('login', { type: 'cart-open' });
    showToast('⚠ INICIA SESIÓN PARA VER TU CARRITO');
    return;
  }
  const cart = document.getElementById('cd');
  if (cart) cart.classList.add('open');
}

export function closeCart() {
  const cart = document.getElementById('cd');
  if (cart) cart.classList.remove('open');
}

export function openAuth(mode: 'login' | 'register' = 'login', pending: any = null) {
  const authOverlay = document.getElementById('authOverlay');
  const authModal = document.getElementById('authModal');
  if (authOverlay) authOverlay.classList.add('open');
  if (authModal) authModal.classList.add('open');
  document.body.style.overflow = 'hidden';
  switchAuthTab(mode);
  if (pending) state.setAuthPendingAction(pending);
}

export function closeAuth() {
  const authOverlay = document.getElementById('authOverlay');
  const authModal = document.getElementById('authModal');
  if (authOverlay) authOverlay.classList.remove('open');
  if (authModal) authModal.classList.remove('open');
  document.body.style.overflow = '';
}

export function toggleUserPanel() {
  if (!state.isLoggedIn()) {
    openAuth('login');
    return;
  }
  const overlay = document.getElementById('userPanelOverlay');
  const panel = document.getElementById('userPanel');
  if (overlay) overlay.classList.toggle('open');
  if (panel) panel.classList.toggle('open');
}

export function closeUserPanel() {
  const overlay = document.getElementById('userPanelOverlay');
  const panel = document.getElementById('userPanel');
  if (overlay) overlay.classList.remove('open');
  if (panel) panel.classList.remove('open');
}

export function logoutUserPanel() {
  logoutUser();
  closeUserPanel();
}

export function openOrders() {
  const overlay = document.getElementById('ordersOverlay');
  const box = document.getElementById('ordersBox');
  if (overlay) overlay.classList.add('open');
  if (box) box.classList.add('open');
}

export function closeOrders() {
  const overlay = document.getElementById('ordersOverlay');
  const box = document.getElementById('ordersBox');
  if (overlay) overlay.classList.remove('open');
  if (box) box.classList.remove('open');
}

export function openWishlist() {
  if (!state.isLoggedIn()) {
    openAuth('login', { type: 'wish-open' });
    showToast('⚠ INICIA SESIÓN PARA VER TU WISHLIST');
    return;
  }
  renderWishlistModal();
  const overlay = document.getElementById('wishlistOverlay');
  const box = document.getElementById('wishlistBox');
  if (overlay) overlay.classList.add('open');
  if (box) box.classList.add('open');
}

export function closeWishlist() {
  const overlay = document.getElementById('wishlistOverlay');
  const box = document.getElementById('wishlistBox');
  if (overlay) overlay.classList.remove('open');
  if (box) box.classList.remove('open');
}

