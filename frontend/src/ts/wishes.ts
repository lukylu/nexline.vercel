import { showToast } from './utils';
import { openAuth } from './popups';
import * as state from './state';
import { cachedProducts } from './products';
import { productImgs } from './data';

// Load wishlist from localStorage
function loadWishes(): Set<string | number> {
  try {
    const saved = localStorage.getItem('voidWishlist');
    if (saved) return new Set(JSON.parse(saved));
  } catch {}
  return new Set();
}

export const wishes = loadWishes();

function saveWishes() {
  localStorage.setItem('voidWishlist', JSON.stringify([...wishes]));
}

export function doWish(id: string | number) {
  if (!state.isLoggedIn()) {
    openAuth('login', { type: 'wish', id });
    showToast('⚠ INICIA SESIÓN PARA GUARDAR');
    return;
  }

  if (wishes.has(id)) {
    wishes.delete(id);
    showToast('× ELIMINADO DE WISHLIST');
  } else {
    wishes.add(id);
    showToast('♥ GUARDADO EN WISHLIST');
  }

  saveWishes();
  syncWishUI(id);
  updateWishBadge();
  renderWishlistModal();
}

/** Sync all heart buttons for a given product id across every grid */
export function syncWishUI(id: string | number) {
  const liked = wishes.has(id);
  // All wish buttons with matching id
  document.querySelectorAll(`#wish-${id}`).forEach(btn => {
    btn.textContent = liked ? '♥' : '♡';
    btn.classList.toggle('liked', liked);
  });
  // Also update duplicate cards (same id rendered in multiple grids)
  document.querySelectorAll(`.pwish[id="wish-${id}"]`).forEach(btn => {
    btn.textContent = liked ? '♥' : '♡';
    btn.classList.toggle('liked', liked);
  });
}

/** Sync all wish buttons after a full render */
export function syncAllWishUI() {
  wishes.forEach(id => {
    document.querySelectorAll(`#wish-${id}`).forEach(btn => {
      btn.textContent = '♥';
      btn.classList.add('liked');
    });
  });
}

export function updateWishBadge() {
  const wishBadge = document.getElementById('userWishCount');
  if (wishBadge) {
    wishBadge.textContent = wishes.size.toString();
    wishBadge.style.display = wishes.size > 0 ? 'inline-block' : 'none';
  }
}

/** Render wishlist items inside the wishlist modal */
export function renderWishlistModal() {
  const container = document.getElementById('wishlistItems');
  if (!container) return;

  if (wishes.size === 0) {
    container.innerHTML = `<p style="font-family:var(--fm);font-size:9px;color:var(--muted);letter-spacing:.2em;text-align:center;margin-top:3rem;text-transform:uppercase;">— tu wishlist está vacía —</p>`;
    return;
  }

  const items = [...wishes].map(id => cachedProducts.find(p => p.id === id)).filter(Boolean);

  if (items.length === 0) {
    container.innerHTML = `<p style="font-family:var(--fm);font-size:9px;color:var(--muted);letter-spacing:.2em;text-align:center;margin-top:3rem;text-transform:uppercase;">— tu wishlist está vacía —</p>`;
    return;
  }

  container.innerHTML = items.map(p => {
    const mainImg = (p.images && p.images.length > 0) ? p.images[0] : ((productImgs[p.id] && productImgs[p.id][0]) || p.img);
    return `
      <div class="wish-item" style="display:flex;align-items:center;gap:1rem;padding:1rem 0;border-bottom:1px solid var(--gray2);">
        <div style="width:64px;height:80px;overflow:hidden;flex-shrink:0;border:1px solid var(--gray2);cursor:pointer;" onclick="openPd('${p.id}');closeWishlist();">
          <img src="${mainImg}" alt="${p.name}" style="width:100%;height:100%;object-fit:cover;filter:grayscale(20%) contrast(1.05);">
        </div>
        <div style="flex:1;">
          <div style="font-family:var(--fm);font-size:9px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;margin-bottom:3px;color:var(--white);">${p.name}</div>
          <div style="font-size:10px;color:var(--muted);margin-bottom:4px;">${p.sub ? p.sub.split('.')[0] : ''}</div>
          <div style="font-family:var(--fm);font-size:12px;font-weight:700;">${p.old_price ? `<span style="font-size:9px;color:var(--muted);text-decoration:line-through;margin-right:5px;">${p.old_price}€</span><span style="color:var(--accent);">${p.price}€</span>` : `${p.price}€`}</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:.5rem;align-items:flex-end;">
          <button onclick="fastAdd(event,'${p.id}')" style="background:var(--accent);color:var(--black);border:none;font-family:var(--fm);font-size:8px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;padding:8px 14px;cursor:pointer;transition:background .2s;" onmouseover="this.style.background='var(--lime)'" onmouseout="this.style.background='var(--accent)'">${p.stock > 0 ? '+ CARRITO' : 'AGOTADO'}</button>
          <button onclick="doWish('${p.id}')" style="background:none;border:none;color:var(--accent);font-family:var(--fm);font-size:8px;letter-spacing:.12em;cursor:pointer;transition:color .2s;" onmouseover="this.style.color='var(--white)'" onmouseout="this.style.color='var(--accent)'">✕ ELIMINAR</button>
        </div>
      </div>
    `;
  }).join('');
}
