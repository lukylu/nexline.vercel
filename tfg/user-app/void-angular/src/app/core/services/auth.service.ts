import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User, PendingAction } from '../models/product.model';
import { ToastService } from './toast.service';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private toast = inject(ToastService);

  currentUser = signal<User | null>(this.loadUser());
  isLoggedIn = computed(() => !!this.currentUser());
  pendingAction = signal<PendingAction | null>(null);
  showAuthModal = signal(false);
  authMode = signal<'login' | 'register'>('login');

  private loadUser(): User | null {
    try {
      const saved = localStorage.getItem('voidUser');
      if (!saved || saved === 'undefined' || saved === 'null') return null;
      return JSON.parse(saved);
    } catch {
      return null;
    }
  }

  checkAuth() {
    this.http.get<any>(`${environment.apiUrl}/api/auth/me`).subscribe({
      next: (data) => {
        if (data.user) {
          this.currentUser.set(data.user);
          localStorage.setItem('voidUser', JSON.stringify(data.user));
        } else {
          this.currentUser.set(null);
          localStorage.removeItem('voidUser');
        }
      },
      error: () => {
        this.currentUser.set(null);
        localStorage.removeItem('voidUser');
      }
    });
  }

  openAuth(mode: 'login' | 'register' = 'login', pending: PendingAction | null = null) {
    this.authMode.set(mode);
    this.showAuthModal.set(true);
    if (pending) this.pendingAction.set(pending);
  }

  closeAuth() {
    this.showAuthModal.set(false);
  }

  login(email: string, password: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.post<any>(`${environment.apiUrl}/api/auth/login`, { email, password }).subscribe({
        next: (data) => {
          if (data.error) {
            reject(data.error);
          } else {
            this.loginSuccess(data.user);
            resolve(data.user);
          }
        },
        error: (err) => {
          this.toast.show('Error al conectar con el servidor');
          reject(err);
        }
      });
    });
  }

  register(name: string, email: string, password: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.post<any>(`${environment.apiUrl}/api/auth/register`, { name, email, password }).subscribe({
        next: (data) => {
          if (data.error) {
            reject(data.error);
          } else {
            this.loginSuccess(data.user);
            resolve(data.user);
          }
        },
        error: (err) => {
          this.toast.show('Error al conectar con el servidor');
          reject(err);
        }
      });
    });
  }

  loginSuccess(user: User) {
    this.currentUser.set(user);
    localStorage.setItem('voidUser', JSON.stringify(user));
    this.closeAuth();
    this.toast.show(`✓ BIENVENIDO, ${user.name.toUpperCase().split(' ')[0]}`);
  }

  logout() {
    this.http.post(`${environment.apiUrl}/api/auth/logout`, {}).subscribe({
      complete: () => this.doLogout(),
      error: () => this.doLogout()
    });
  }

  private doLogout() {
    this.currentUser.set(null);
    localStorage.removeItem('voidUser');
    this.toast.show('✓ SESIÓN CERRADA');
  }

  requireAuth(actionType: PendingAction['type'], id?: number, size?: string | null): boolean {
    if (this.isLoggedIn()) return true;
    const pending: PendingAction = { type: actionType };
    if (id !== undefined) pending.id = id;
    if (size !== undefined) pending.size = size;
    this.openAuth('login', pending);
    const msgs: Record<string, string> = {
      'cart': '⚠ INICIA SESIÓN PARA COMPRAR',
      'wish': '⚠ INICIA SESIÓN PARA GUARDAR',
      'cart-open': '⚠ INICIA SESIÓN PARA VER TU CARRITO',
      'wish-open': '⚠ INICIA SESIÓN PARA VER TU WISHLIST'
    };
    this.toast.show(msgs[actionType] || '⚠ INICIA SESIÓN');
    return false;
  }

  executePendingAction() {
    const action = this.pendingAction();
    if (action) {
      this.pendingAction.set(null);
    }
    return action;
  }
}
