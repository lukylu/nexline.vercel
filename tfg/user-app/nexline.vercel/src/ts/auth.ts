import * as state from './state';
import { showToast } from './utils';
import { closeAuth, openCart } from './popups';
import * as cart from './cart';
import * as wishes from './wishes';
import { renderProducts } from './products';



// Pending action state moved to state.ts

// isLoggedIn moved to state.ts

export function updateAuthUI() {
  const loginBtn = document.getElementById('navLoginBtn');
  const userBtn = document.getElementById('navUserBtn');
  const mobAuthBtn = document.getElementById('mobAuthBtn');
  
  const user = state.currentUser;
  
  if (user) {
    if (loginBtn) loginBtn.style.display = 'none';
    if (userBtn) userBtn.classList.add('visible');
    
    const navUserName = document.getElementById('navUserName');
    if (navUserName) navUserName.textContent = user.name.toUpperCase().split(' ')[0];
    
    // Update user panel with current user data
    const upName = document.getElementById('userPanelName');
    const upEmail = document.getElementById('userPanelEmail');
    const upAvatar = document.getElementById('userPanelAvatar');
    if (upName) upName.textContent = user.name;
    if (upEmail) upEmail.textContent = user.email;
    if (upAvatar) upAvatar.textContent = user.name.charAt(0).toUpperCase();
    
    if (mobAuthBtn) {
      mobAuthBtn.textContent = `Hola, ${user.name.split(' ')[0]} · Salir`;
      // mobAuthBtn.onclick = () => { toggleMenu(); logoutUser(); }; // toggleMenu logic needed
    }
    
    // Update wishlist badge
    wishes.updateWishBadge();
  } else {

    if (loginBtn) loginBtn.style.display = '';
    if (userBtn) userBtn.classList.remove('visible');
    if (mobAuthBtn) {
      mobAuthBtn.textContent = 'Iniciar sesión';
      // mobAuthBtn.onclick = () => { toggleMenu(); openAuth('login'); };
    }
  }
}

export function switchAuthTab(tab: 'login' | 'register') {
  const tLogin = document.getElementById('tabLogin');
  const tReg = document.getElementById('tabRegister');
  const fLogin = document.getElementById('formLogin');
  const fReg = document.getElementById('formRegister');
  const title = document.getElementById('authTitle');
  const sub = document.getElementById('authSub');
  const eyebrow = document.getElementById('authEyebrow');

  if (tLogin) tLogin.classList.toggle('active', tab === 'login');
  if (tReg) tReg.classList.toggle('active', tab === 'register');
  if (fLogin) fLogin.style.display = tab === 'login' ? '' : 'none';
  if (fReg) fReg.style.display = tab === 'register' ? '' : 'none';

  if (tab === 'register') {
    if (title) title.innerHTML = 'ÚNETE<br>AL <span style="color:var(--accent)">VOID.</span>';
    if (sub) sub.textContent = 'Crea tu cuenta gratis y accede a drops exclusivos, tu wishlist y carrito guardado.';
    if (eyebrow) eyebrow.textContent = 'Nueva cuenta';
  } else {
    if (title) title.innerHTML = 'ENTRA<br>AL <span style="color:var(--accent)">VOID.</span>';
    if (sub) sub.textContent = 'Inicia sesión para guardar favoritos, acceder a tu carrito y drops exclusivos.';
    if (eyebrow) eyebrow.textContent = 'Acceso';
  }
}

export function setFieldError(inputId: string, errId: string, show: boolean) {
  const inp = document.getElementById(inputId);
  const err = document.getElementById(errId);
  if (inp) inp.classList.toggle('error', show);
  if (err) err.classList.toggle('show', show);
}

export function submitLogin() {
  const emailEl = document.getElementById('loginEmail') as HTMLInputElement;
  const passEl = document.getElementById('loginPass') as HTMLInputElement;
  if (!emailEl || !passEl) return;

  const email = emailEl.value.trim();
  const pass = passEl.value;
  let ok = true;
  
  if (!email || !email.includes('@')) { setFieldError('loginEmail', 'loginEmailErr', true); ok = false; }
  else setFieldError('loginEmail', 'loginEmailErr', false);
  
  if (!pass) { setFieldError('loginPass', 'loginPassErr', true); ok = false; }
  else setFieldError('loginPass', 'loginPassErr', false);
  
  if (!ok) return;
  
  fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: pass })
  })
  .then(res => res.json())
  .then(data => {
    if (data.error) {
      setFieldError('loginPass', 'loginPassErr', true);
      const errEl = document.getElementById('loginPassErr');
      if (errEl) errEl.textContent = data.error;
    } else {
      loginSuccess(data.user);
    }
  })
  .catch(err => {
    console.error('Login error:', err);
    showToast('Error al conectar con el servidor');
  });
}

export function submitRegister() {
  const nameEl = document.getElementById('regName') as HTMLInputElement;
  const emailEl = document.getElementById('regEmail') as HTMLInputElement;
  const passEl = document.getElementById('regPass') as HTMLInputElement;
  if (!nameEl || !emailEl || !passEl) return;

  const name = nameEl.value.trim();
  const email = emailEl.value.trim();
  const pass = passEl.value;
  let ok = true;

  if (!name) { setFieldError('regName', 'regNameErr', true); ok = false; }
  else setFieldError('regName', 'regNameErr', false);
  
  if (!email || !email.includes('@')) { setFieldError('regEmail', 'regEmailErr', true); ok = false; }
  else setFieldError('regEmail', 'regEmailErr', false);
  
  if (pass.length < 6) { setFieldError('regPass', 'regPassErr', true); ok = false; }
  else setFieldError('regPass', 'regPassErr', false);
  
  if (!ok) return;

  fetch('http://localhost:3000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password: pass })
  })
  .then(res => res.json())
  .then(data => {
    if (data.error) {
      setFieldError('regEmail', 'regEmailErr', true);
      const errEl = document.getElementById('regEmailErr');
      if (errEl) errEl.textContent = data.error;
    } else {
      loginSuccess(data.user);
    }
  })
  .catch(err => {
    console.error('Register error:', err);
    showToast('Error al conectar con el servidor');
  });
}

export function loginSuccess(user: any) {
  state.setCurrentUser(user);
  closeAuth();
  updateAuthUI();
  wishes.updateWishBadge();
  wishes.renderWishlistModal();
  showToast(`✓ BIENVENIDO, ${user.name.toUpperCase().split(' ')[0]}`);
  renderProducts();
  
  if (state.authPendingAction) {
    const a = state.authPendingAction;
    state.setAuthPendingAction(null);
    // Execute actions based on type
    if (a.type === 'cart-open') openCart();
    if (a.type === 'cart') cart.addToCart(a.id, a.size);
    if (a.type === 'wish') wishes.doWish(a.id);
  }
}

export function logoutUser() {
  fetch('http://localhost:3000/api/auth/logout', { method: 'POST' })
    .finally(() => {
      state.setCurrentUser(null);
      updateAuthUI();
      state.setCart([]);
      cart.updateCart();
      // Clear wishlist from memory and localStorage
      wishes.wishes.clear();
      localStorage.removeItem('voidWishlist');
      wishes.updateWishBadge();
      wishes.renderWishlistModal();
      // Reset all heart icons
      document.querySelectorAll('.pwish').forEach(btn => {
        btn.textContent = '♡';
        btn.classList.remove('liked');
      });
      showToast('✓ SESIÓN CERRADA');
      renderProducts();
    });
}

export function checkAuth() {
  fetch('http://localhost:3000/api/auth/me')
    .then(res => res.json())
    .then(data => {
      if (data.user) {
        state.setCurrentUser(data.user);
        updateAuthUI();
      }
    })
    .catch(() => {
      // Not logged in or error
      state.setCurrentUser(null);
      updateAuthUI();
    });
}


