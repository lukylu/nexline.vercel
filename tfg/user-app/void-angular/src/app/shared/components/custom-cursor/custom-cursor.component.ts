import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'void-cursor',
  standalone: true,
  template: `<div id="cur"></div><div id="curring"></div>`
})
export class CustomCursorComponent implements OnInit, OnDestroy {
  private animId = 0;
  private mx = 0; private my = 0; private rx = 0; private ry = 0;
  private moveHandler = (e: MouseEvent) => {
    this.mx = e.clientX; this.my = e.clientY;
    const cur = document.getElementById('cur');
    if (cur) { cur.style.left = this.mx + 'px'; cur.style.top = this.my + 'px'; }
  };
  private hoverHandler = (e: MouseEvent) => {
    const cur = document.getElementById('cur');
    if (!cur) return;
    if ((e.target as HTMLElement).closest('a,button')) cur.classList.add('big');
    else cur.classList.remove('big');
  };

  ngOnInit() {
    document.addEventListener('mousemove', this.moveHandler);
    document.addEventListener('mouseover', this.hoverHandler);
    const ring = document.getElementById('curring');
    const animate = () => {
      this.rx += (this.mx - this.rx) * 0.11;
      this.ry += (this.my - this.ry) * 0.11;
      if (ring) { ring.style.left = this.rx + 'px'; ring.style.top = this.ry + 'px'; }
      this.animId = requestAnimationFrame(animate);
    };
    animate();
  }

  ngOnDestroy() {
    document.removeEventListener('mousemove', this.moveHandler);
    document.removeEventListener('mouseover', this.hoverHandler);
    cancelAnimationFrame(this.animId);
  }
}
