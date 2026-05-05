import { Component, inject, signal } from '@angular/core';
import { ModalService } from '../../../core/services/modal.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'void-auth-modal',
  imports: [],
  templateUrl: './auth-modal.component.html',
  styleUrl: './auth-modal.component.css'
})
export class AuthModalComponent {
  modalService = inject(ModalService);
  authService = inject(AuthService);
  
  tab = signal<'login' | 'register'>('login');

  isOpen() {
    return this.modalService.activeModal() === 'auth';
  }

  close() {
    this.modalService.close();
  }

  submitLogin() {
    this.authService.login('test@email.com', 'password').then(() => {
      this.close();
    });
  }

  submitRegister() {
    // To be implemented fully
    this.close();
  }
}
