import { Component, inject, signal, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'void-promotion-popups',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './promotion-popups.component.html',
  styleUrl: './promotion-popups.component.css'
})
export class PromotionPopupsComponent implements OnInit {
  toastService = inject(ToastService);

  showNewsletter = signal(false);
  showExit = signal(false);
  private exitShown = false;

  ngOnInit() {
    // Newsletter delay
    if (!localStorage.getItem('nlDismissed')) {
      setTimeout(() => {
        this.showNewsletter.set(true);
      }, 5000);
    }

    if (localStorage.getItem('exitShown')) {
      this.exitShown = true;
    }
  }

  @HostListener('document:mouseleave', ['$event'])
  onMouseLeave(event: MouseEvent) {
    if (this.exitShown) return;
    if (event.clientY <= 0) {
      this.showExit.set(true);
      this.exitShown = true;
      localStorage.setItem('exitShown', 'true');
    }
  }

  closeNewsletter() {
    this.showNewsletter.set(false);
    localStorage.setItem('nlDismissed', 'true');
  }

  closeExit() {
    this.showExit.set(false);
  }

  submitNewsletter(event: Event) {
    event.preventDefault();
    this.toastService.show('✓ ¡TE HAS UNIDO AL VOID! REVISA TU EMAIL.');
    this.closeNewsletter();
  }

  applyDiscount() {
    this.toastService.show('✓ CÓDIGO VOID10 APLICADO');
    this.closeExit();
  }
}
