import * as ui from './ui-interactions';
import * as popups from './popups';
import * as utils from './utils';
import * as state from './state';
import * as auth from './auth';
import * as cart from './cart';
import * as wishes from './wishes';
import * as checkout from './checkout';
import * as productsModule from './products';






// Initialize UI
ui.initCursor();
ui.initLoader();
ui.initNavScroll();
ui.initHeroParallax();
ui.initHeroWordCycle();
ui.initHeroCounter();
ui.initReveal();
ui.initCounterAnim();

// Expose functions to window for legacy HTML handlers
(window as any).openPd = popups.openPd;
(window as any).closePd = popups.closePd;
(window as any).switchPdImg = popups.switchPdImg;
(window as any).selectPdSize = popups.selectPdSize;
(window as any).pdAddCart = popups.pdAddCart;
(window as any).pdWish = popups.pdWish;
(window as any).toggleSizeGuide = popups.toggleSizeGuide;

(window as any).openNlPopup = popups.openNlPopup;
(window as any).closeNlPopup = popups.closeNlPopup;
(window as any).openExit = popups.openExit;
(window as any).closeExit = popups.closeExit;
(window as any).openSg = popups.openSg;
(window as any).closeSg = popups.closeSg;
(window as any).openCart = popups.openCart;
(window as any).closeCart = popups.closeCart;
(window as any).openAuth = popups.openAuth;
(window as any).closeAuth = popups.closeAuth;
(window as any).toggleUserPanel = popups.toggleUserPanel;
(window as any).closeUserPanel = popups.closeUserPanel;
(window as any).logoutUserPanel = popups.logoutUserPanel;
(window as any).openOrders = popups.openOrders;
(window as any).closeOrders = popups.closeOrders;
(window as any).openWishlist = popups.openWishlist;
(window as any).closeWishlist = popups.closeWishlist;
(window as any).switchAuthTab = auth.switchAuthTab;
(window as any).submitLogin = auth.submitLogin;
(window as any).submitRegister = auth.submitRegister;
(window as any).logoutUser = auth.logoutUser;
(window as any).updateAuthUI = auth.updateAuthUI;
(window as any).addToCart = cart.addToCart;
(window as any).removeFromCart = cart.removeFromCart;
(window as any).fastAdd = cart.fastAdd;
(window as any).updateCart = cart.updateCart;
(window as any).doWish = wishes.doWish;
(window as any).openCheckout = checkout.openCheckout;
(window as any).closeCheckout = checkout.closeCheckout;
(window as any).renderChkStep = checkout.renderChkStep;
(window as any).chkAdvance = checkout.chkAdvance;
(window as any).showReceipt = checkout.showReceipt;
(window as any).renderProducts = productsModule.renderProducts;
(window as any).filterP = productsModule.filterP;
(window as any).filterModal = productsModule.filterModal;
(window as any).toggleWish = productsModule.toggleWish;
(window as any).toggleMenu = ui.toggleMenu;
(window as any).openAdminLogin = () => popups.openNlPopup(); // Placeholder or specific logic






(window as any).acceptCookies = utils.acceptCookies;
(window as any).declineCookies = utils.declineCookies;
(window as any).showToast = utils.showToast;

// Expose state
Object.defineProperty(window, 'currentUser', {
  get: () => state.currentUser,
  set: (v) => state.setCurrentUser(v)
});

Object.defineProperty(window, 'cart_', {
  get: () => state.cart_,
  set: (v) => state.setCart(v)
});

// Initialize Auth UI
auth.checkAuth();
productsModule.renderProducts();

console.log('Nexline Modernized Entry Point Initialized');


