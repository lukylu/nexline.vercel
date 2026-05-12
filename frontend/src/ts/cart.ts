import * as state from './state';
import { productImgs } from './data';
import { cachedProducts } from './products';
import { showToast } from './utils';
import { openAuth } from './popups';

export function updateCart() {
  const count = state.cart_.reduce((s, i) => s + i.qty, 0);
  const total = state.cart_.reduce((s, i) => s + i.price * i.qty * (state.discountApplied ? 0.9 : 1), 0);
  
  const cc = document.getElementById('cartCount');
  if (cc) cc.textContent = count.toString();
  
  const ccM = document.getElementById('ccM');
  if (ccM) ccM.textContent = count.toString();
  
  const cdTotal = document.getElementById('cdTotal');
  if (cdTotal) cdTotal.textContent = total.toFixed(2).replace('.', ',') + ' €';
  
  const el = document.getElementById('cdItems');
  if (el) {
    el.innerHTML = state.cart_.length ? state.cart_.map(i => `
      <div class="ci">
        <img src="${(productImgs[i.id] && productImgs[i.id][0]) || i.img}" alt="${i.name}">
        <div><div class="ci-name">${i.name}</div><div class="ci-sub">${i.size} · Qty: ${i.qty}</div></div>
        <div class="ci-right">
          <div class="ci-price">${(i.price * i.qty).toFixed(2).replace('.', ',')}€</div>
          <button class="ci-remove" onclick="removeFromCart('${i.id}', '${i.size}')">eliminar</button>
        </div>
      </div>
    `).join('') + (state.discountApplied ? '<p style="font-family:var(--fm);font-size:8px;color:var(--lime);letter-spacing:.15em;text-align:right;margin-top:1rem;text-transform:uppercase;">✓ VOID10 aplicado (−10%)</p>' : '')
    : `<p style="font-family:var(--fm);font-size:9px;color:var(--muted);letter-spacing:.2em;text-align:center;margin-top:3rem;text-transform:uppercase;">— vacío —</p>`;
  }
}

export function addToCart(id: string | number, size: string | null) {
  if (!state.isLoggedIn()) {
    openAuth('login', { type: 'cart', id, size });
    showToast('⚠ INICIA SESIÓN PARA COMPRAR');
    return;
  }
  
  const p = cachedProducts.find(x => x.id === id);
  if (!p || p.badge === 'sold') return;
  
  const selectedSize = size || p.sizes[0];
  const ex = state.cart_.find(x => x.id === id && x.size === selectedSize);
  
  if (ex) {
    ex.qty++;
  } else {
    state.cart_.push({ ...p, qty: 1, size: selectedSize });
  }
  
  updateCart();
  showToast('✓ AÑADIDO AL CARRITO');
  
  const cc = document.getElementById('cartCount');
  if (cc) {
    cc.classList.remove('bump');
    void cc.offsetWidth;
    cc.classList.add('bump');
  }
}

export function removeFromCart(id: string | number, size: string) {
  state.setCart(state.cart_.filter(x => !(x.id === id && x.size === size)));
  updateCart();
}

export function fastAdd(e: Event, id: string | number) {
  e.stopPropagation();
  addToCart(id, null);
}
