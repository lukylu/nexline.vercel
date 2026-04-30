import { CartItem } from './types';

function loadUser() {
  const saved = localStorage.getItem('voidUser');
  if (!saved || saved === 'undefined' || saved === 'null') return null;
  try {
    return JSON.parse(saved);
  } catch {
    return null;
  }
}

export let currentUser = loadUser();
export let cart_: CartItem[] = [];
export let pdCurrentId: number | null = null;
export let pdSelectedSize: string | null = null;
export let discountApplied = false;
export let authPendingAction: any = null;

export function setCurrentUser(user: any) {
  currentUser = user;
  localStorage.setItem('voidUser', JSON.stringify(user));
}

export function setCart(newCart: CartItem[]) {
  cart_ = newCart;
}

export function setPdCurrentId(id: number | null) {
  pdCurrentId = id;
}

export function setPdSelectedSize(size: string | null) {
  pdSelectedSize = size;
}

export function setDiscountApplied(applied: boolean) {
  discountApplied = applied;
}

export function setAuthPendingAction(action: any) {
  authPendingAction = action;
}

export function isLoggedIn() {
  return !!currentUser;
}
