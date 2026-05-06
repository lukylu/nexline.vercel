import { Directive, ElementRef, OnInit, inject } from '@angular/core';

@Directive({ selector: '[voidReveal]', standalone: true })
export class RevealDirective implements OnInit {
  private el = inject(ElementRef);

  ngOnInit() {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          console.log('👁️ Reveal triggered for:', entry.target);
          entry.target.classList.add('vis');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    observer.observe(this.el.nativeElement);
  }
}
