import { Component, signal, OnInit } from '@angular/core';

@Component({
  selector: 'void-loader',
  standalone: true,
  template: `
    <div id="loader" [class.hidden]="hidden()">
      <div class="ld-logo">VOID</div>
      <div class="ld-sub">Streetwear SS25</div>
      <div class="ld-bar"><div class="ld-fill"></div></div>
    </div>
  `
})
export class LoaderComponent implements OnInit {
  hidden = signal(false);

  ngOnInit() {
    setTimeout(() => this.hidden.set(true), 1700);
    // Fallback
    setTimeout(() => this.hidden.set(true), 5000);
  }
}
