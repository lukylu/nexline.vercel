import * as state from './state';
import { showToast } from './utils';
import { updateCart } from './cart';

export let chkStep = 1;
export const chkData = {
  name: '', email: '', address: '', city: '', zip: '',
  country: 'ES', cardNum: '', cardHolder: '', expiry: '', cvv: ''
};

export function openCheckout() {
  chkStep = 1;
  renderChkStep();
  const modal = document.getElementById('chkModal');
  if (modal) modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

export function closeCheckout() {
  const modal = document.getElementById('chkModal');
  if (modal) modal.classList.remove('open');
  document.body.style.overflow = '';
}

export function renderChkStep() {
  const modal = document.getElementById('chkModal');
  if (!modal) return;

  const stepsEl = modal.querySelector('.chk-steps');
  if (stepsEl) {
    stepsEl.innerHTML = `
      <div class="chk-step-dot ${chkStep >= 1 ? 'active' : ''}" data-n="1">1</div>
      <div class="chk-step-line ${chkStep >= 2 ? 'active' : ''}"></div>
      <div class="chk-step-dot ${chkStep >= 2 ? 'active' : ''}" data-n="2">2</div>
      <div class="chk-step-line ${chkStep >= 3 ? 'active' : ''}"></div>
      <div class="chk-step-dot ${chkStep >= 3 ? 'active' : ''}" data-n="3">3</div>
    `;
  }

  const titles = ['RESUMEN', 'ENVÍO', 'PAGO'];
  const titleEl = modal.querySelector('.chk-title');
  if (titleEl) titleEl.textContent = titles[chkStep - 1];

  const body = modal.querySelector('.chk-body') as HTMLElement;
  if (body) {
    if (chkStep === 1) body.innerHTML = renderStepResumen();
    else if (chkStep === 2) body.innerHTML = renderStepEnvio();
    else body.innerHTML = renderStepPago();
  }

  const foot = modal.querySelector('.chk-foot');
  if (foot) {
    foot.innerHTML = '';
    if (chkStep > 1) {
      const back = document.createElement('button');
      back.className = 'chk-back-btn';
      back.textContent = '← Volver';
      back.onclick = () => { chkStep--; renderChkStep(); };
      foot.appendChild(back);
    }
    const next = document.createElement('button');
    next.className = 'chk-next-btn';
    next.textContent = chkStep === 3 ? 'CONFIRMAR PAGO →' : (chkStep === 2 ? 'CONTINUAR AL PAGO →' : 'CONTINUAR →');
    next.onclick = chkAdvance;
    foot.appendChild(next);
  }

  if (chkStep === 3) initCardPreview();
}

function renderStepResumen() {
  const disc = state.discountApplied;
  const subtotal = state.cart_.reduce((s, i) => s + i.price * i.qty, 0);
  const descuento = disc ? subtotal * 0.1 : 0;
  const total = subtotal - descuento;
  
  return `<div class="chk-summary">
    <div class="chk-summary-items">
      ${state.cart_.map(i => `<div class="chk-item">
        <div class="chk-item-img" style="background-image:url('${i.img}')"></div>
        <div class="chk-item-info">
          <span class="chk-item-name">${i.name}</span>
          <span class="chk-item-meta">Talla ${i.size} · x${i.qty}</span>
        </div>
        <span class="chk-item-price">${(i.price * i.qty).toFixed(2)} €</span>
      </div>`).join('')}
    </div>
    <div class="chk-totals">
      <div class="chk-total-row"><span>Subtotal</span><span>${subtotal.toFixed(2)} €</span></div>
      ${disc ? `<div class="chk-total-row disc"><span>Descuento VOID10</span><span>−${descuento.toFixed(2)} €</span></div>` : ''}
      <div class="chk-total-row"><span>Envío</span><span>${total >= 60 ? '<em>GRATIS</em>' : '4,95 €'}</span></div>
      <div class="chk-total-row total"><span>TOTAL</span><span>${(total + (total < 60 ? 4.95 : 0)).toFixed(2)} €</span></div>
    </div>
    ${total < 60 ? '<p class="chk-free-ship-hint">Añade <strong>' + (60 - total).toFixed(2) + ' €</strong> más para envío gratis</p>' : '<p class="chk-free-ship-hint ok">✓ Envío gratuito aplicado</p>'}
  </div>`;
}

function renderStepEnvio() {
  return `<div class="chk-form">
    <div class="chk-field-row">
      <div class="chk-field"><label>Nombre completo</label><input id="f-name" type="text" placeholder="Lucas García" value="${chkData.name}" autocomplete="name"/></div>
      <div class="chk-field"><label>Email</label><input id="f-email" type="email" placeholder="tu@email.com" value="${chkData.email}" autocomplete="email"/></div>
    </div>
    <div class="chk-field"><label>Dirección</label><input id="f-address" type="text" placeholder="Calle Mayor 1, 2ºA" value="${chkData.address}" autocomplete="street-address"/></div>
    <div class="chk-field-row">
      <div class="chk-field"><label>Ciudad</label><input id="f-city" type="text" placeholder="Madrid" value="${chkData.city}" autocomplete="address-level2"/></div>
      <div class="chk-field chk-field--sm"><label>CP</label><input id="f-zip" type="text" placeholder="28001" value="${chkData.zip}" maxlength="5" autocomplete="postal-code"/></div>
    </div>
    <div class="chk-field"><label>País</label>
      <select id="f-country" autocomplete="country">
        <option value="ES" ${chkData.country === 'ES' ? 'selected' : ''}>🇪🇸 España</option>
        <option value="PT" ${chkData.country === 'PT' ? 'selected' : ''}>🇵🇹 Portugal</option>
        <option value="FR" ${chkData.country === 'FR' ? 'selected' : ''}>🇫🇷 Francia</option>
        <option value="DE" ${chkData.country === 'DE' ? 'selected' : ''}>🇩🇪 Alemania</option>
        <option value="IT" ${chkData.country === 'IT' ? 'selected' : ''}>🇮🇹 Italia</option>
        <option value="GB" ${chkData.country === 'GB' ? 'selected' : ''}>🇬🇧 Reino Unido</option>
      </select>
    </div>
  </div>`;
}

function renderStepPago() {
  return `<div class="chk-pay-wrap">
    <div class="chk-card-preview" id="cardPreview">
      <div class="chk-card-front" id="cardFront">
        <div class="chk-card-logo">VOID</div>
        <div class="chk-card-chip"><div class="chip-row"></div><div class="chip-row"></div><div class="chip-row"></div></div>
        <div class="chk-card-num" id="previewNum">•••• •••• •••• ••••</div>
        <div class="chk-card-bot">
          <div><div class="chk-card-lbl">TITULAR</div><div class="chk-card-val" id="previewHolder">NOMBRE APELLIDO</div></div>
          <div><div class="chk-card-lbl">VENCE</div><div class="chk-card-val" id="previewExp">MM/AA</div></div>
        </div>
      </div>
      <div class="chk-card-back" id="cardBack">
        <div class="chk-card-stripe"></div>
        <div class="chk-card-cvv-wrap"><div class="chk-card-cvv-lbl">CVV</div><div class="chk-card-cvv-val" id="previewCvv">•••</div></div>
      </div>
    </div>
    <div class="chk-form">
      <div class="chk-field"><label>Número de tarjeta</label>
        <input id="f-cardnum" type="text" placeholder="0000 0000 0000 0000" maxlength="19" inputmode="numeric" value="${chkData.cardNum}"/>
      </div>
      <div class="chk-field"><label>Nombre del titular</label><input id="f-holder" type="text" placeholder="LUCAS GARCIA" value="${chkData.cardHolder}" style="text-transform:uppercase"/></div>
      <div class="chk-field-row">
        <div class="chk-field"><label>Fecha de vencimiento</label><input id="f-expiry" type="text" placeholder="MM/AA" maxlength="5" value="${chkData.expiry}" inputmode="numeric"/></div>
        <div class="chk-field chk-field--sm"><label>CVV</label><input id="f-cvv" type="password" placeholder="•••" maxlength="4" value="${chkData.cvv}" inputmode="numeric"/></div>
      </div>
    </div>
  </div>`;
}

export function chkAdvance() {
  if (chkStep === 1) { chkStep = 2; renderChkStep(); return; }
  if (chkStep === 2) {
    const n = document.getElementById('f-name') as HTMLInputElement;
    const em = document.getElementById('f-email') as HTMLInputElement;
    const ad = document.getElementById('f-address') as HTMLInputElement;
    const ci = document.getElementById('f-city') as HTMLInputElement;
    const zi = document.getElementById('f-zip') as HTMLInputElement;
    if (!n.value.trim() || !em.value.trim() || !ad.value.trim() || !ci.value.trim() || !zi.value.trim()) {
      chkShake();
      showToast('⚠ COMPLETA TODOS LOS CAMPOS');
      return;
    }
    chkData.name = n.value; chkData.email = em.value; chkData.address = ad.value; chkData.city = ci.value; chkData.zip = zi.value;
    chkData.country = (document.getElementById('f-country') as HTMLSelectElement).value;
    chkStep = 3; renderChkStep(); return;
  }
  if (chkStep === 3) {
    const cn = document.getElementById('f-cardnum') as HTMLInputElement;
    const ch = document.getElementById('f-holder') as HTMLInputElement;
    const ex = document.getElementById('f-expiry') as HTMLInputElement;
    const cv = document.getElementById('f-cvv') as HTMLInputElement;

    if (!cn.value.trim() || !ch.value.trim() || !ex.value.trim() || !cv.value.trim()) {
      chkShake();
      showToast('⚠ COMPLETA LOS DATOS DE PAGO');
      return;
    }

    chkData.cardNum = cn.value;
    chkData.cardHolder = ch.value;
    chkData.expiry = ex.value;
    chkData.cvv = cv.value;

    processPayment();
  }
}

function chkShake() {
  const body = document.querySelector('.chk-body') as HTMLElement;
  if (!body) return;
  body.style.animation = 'none';
  void body.offsetHeight;
  body.style.animation = 'chkShake .4s ease';
}

function initCardPreview() {
  const numEl = document.getElementById('f-cardnum') as HTMLInputElement;
  // const holderEl = document.getElementById('f-holder') as HTMLInputElement;
  // const expEl = document.getElementById('f-expiry') as HTMLInputElement;
  // const cvvEl = document.getElementById('f-cvv') as HTMLInputElement;
  // const card = document.getElementById('cardPreview');

  if (numEl) {
    numEl.addEventListener('input', e => {
      let v = (e.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, 16);
      (e.target as HTMLInputElement).value = v.replace(/(.{4})/g, '$1 ').trim();
      const preview = document.getElementById('previewNum');
      if (preview) preview.textContent = (e.target as HTMLInputElement).value.padEnd(19, '•').replace(/ /g, ' ') || '•••• •••• •••• ••••';
    });
  }
  // ... rest of preview logic
}

function processPayment() {
  const btn = document.querySelector('.chk-next-btn') as HTMLButtonElement;
  if (btn) { btn.disabled = true; btn.textContent = 'PROCESANDO...'; }

  const orderData = {
    items: state.cart_.map(item => ({
      id: item.id,
      size: item.size,
      quantity: item.qty,
      price: item.price
    })),
    shippingAddress: {
      name: chkData.name,
      email: chkData.email,
      address: chkData.address,
      city: chkData.city,
      zip: chkData.zip,
      country: chkData.country
    },
    paymentData: {
      cardHolder: chkData.cardHolder,
      // En un entorno real no enviaríamos el número completo ni CVV
      last4: chkData.cardNum.slice(-4)
    }
  };

  fetch('http://localhost:3000/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData)
  })
  .then(res => res.json())
  .then(data => {
    if (data.error) {
      showToast(`⚠ ${data.error.toUpperCase()}`);
      if (btn) { btn.disabled = false; btn.textContent = 'CONFIRMAR PAGO →'; }
    } else {
      showToast('✓ PEDIDO REALIZADO CON ÉXITO');
      state.setCart([]);
      updateCart();
      closeCheckout();
      showReceipt();
    }
  })
  .catch(err => {
    console.error('Order error:', err);
    showToast('⚠ ERROR AL CONECTAR CON EL SERVIDOR');
    if (btn) { btn.disabled = false; btn.textContent = 'CONFIRMAR PAGO →'; }
  });
}

export function showReceipt() {
  // Receipt logic
  const overlay = document.getElementById('receiptOverlay');
  if (overlay) overlay.classList.add('open');
}
