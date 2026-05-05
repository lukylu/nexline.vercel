import { Component, signal } from '@angular/core';
@Component({
  selector: 'void-cookie-bar', standalone: true,
  template: `<div class="cookie-bar" [class.show]="show()"><p class="cookie-text">Usamos cookies para mejorar tu experiencia. Al continuar, aceptas nuestra <a href="#">política de cookies</a>.</p><div class="cookie-btns"><button class="cookie-accept" (click)="accept()">Aceptar todo</button><button class="cookie-decline" (click)="decline()">Solo esenciales</button></div></div>`
})
export class CookieBarComponent {
  show = signal(!localStorage.getItem('cookies'));
  accept() { localStorage.setItem('cookies','true'); this.show.set(false); }
  decline() { localStorage.setItem('cookies','declined'); this.show.set(false); }
}
