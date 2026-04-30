/* ── LOADER ── */
export function initLoader() {
  const hideLoader = () => {
    setTimeout(() => {
      const loader = document.getElementById('loader');
      if (loader) loader.classList.add('hidden');
      
      // Show popups after load
      if (!localStorage.getItem('cookies')) {
        setTimeout(() => {
          const cookieBar = document.getElementById('cookieBar');
          if (cookieBar) cookieBar.classList.add('show');
        }, 1200);
      }
    }, 1700);
  };

  if (document.readyState === 'complete') {
    hideLoader();
  } else {
    window.addEventListener('load', hideLoader);
  }

  // Fallback: hide loader anyway after 5 seconds to prevent infinite hang
  setTimeout(hideLoader, 5000);
}

/* ── NAV SCROLL ── */
export function initNavScroll() {
  window.addEventListener('scroll', () => {
    const mainNav = document.getElementById('mainNav');
    if (mainNav) mainNav.classList.toggle('scrolled', window.scrollY > 60);
  });
}

/* ── HERO PARALLAX ── */
export function initHeroParallax() {
  document.addEventListener('mousemove', e => {
    const x = (e.clientX / window.innerWidth - .5) * 10;
    const y = (e.clientY / window.innerHeight - .5) * 7;
    const img = document.getElementById('heroImg');
    if (img) img.style.transform = `scale(1.06) translate(${x * .28}px, ${y * .28}px)`;
  });
}

/* ── HERO WORD CYCLE ── */
export function initHeroWordCycle() {
  const words = ['DEFINE', 'CREATE', 'OWN', 'BREAK', 'WEAR'];
  let wi = 0;
  setInterval(() => {
    wi = (wi + 1) % words.length;
    const el = document.getElementById('heroWord');
    if (!el) return;
    el.style.transition = 'transform .28s ease';
    el.style.transform = 'translateY(-115%)';
    setTimeout(() => {
      el.textContent = words[wi];
      el.style.transition = 'none';
      el.style.transform = 'translateY(115%)';
      setTimeout(() => {
        el.style.transition = 'transform .5s cubic-bezier(.16,1,.3,1)';
        el.style.transform = 'translateY(0)';
      }, 30);
    }, 290);
  }, 3800);
}

/* ── HERO COUNTER ── */
export function initHeroCounter() {
  let hc = 47;
  setInterval(() => {
    if (Math.random() < .04 && hc > 1) {
      hc--;
      const el = document.getElementById('heroCount');
      if (el) {
        el.style.color = 'var(--accent)';
        el.textContent = hc.toString();
        setTimeout(() => el.style.color = 'var(--white)', 600);
      }
    }
  }, 2200);
}

/* ── REVEAL ── */
export function initReveal() {
  const io = new IntersectionObserver(e => e.forEach(x => {
    if (x.isIntersecting) {
      x.target.classList.add('vis');
      io.unobserve(x.target);
    }
  }), { threshold: .1 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
}

/* ── COUNTER ANIM ── */
export function initCounterAnim() {
  const io2 = new IntersectionObserver(e => e.forEach(x => {
    if (x.isIntersecting) {
      const el = x.target as HTMLElement;
      const target = +(el.dataset.to || 0);
      let c = 0;
      const step = target / 60;
      const iv = setInterval(() => {
        c = Math.min(c + step, target);
        el.textContent = Math.floor(c).toLocaleString('es') + (target === 100 ? '%' : '');
        if (c >= target) clearInterval(iv);
      }, 16);
      io2.unobserve(el);
    }
  }), { threshold: .5 });
  document.querySelectorAll('.stat-num[data-to]').forEach(el => io2.observe(el));
}

/* ── CURSOR ── */
export function initCursor() {
  const cur = document.getElementById('cur');
  const ring = document.getElementById('curring');
  if (!cur || !ring) return;
  
  let mx = 0, my = 0, rx = 0, ry = 0;
  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    cur.style.left = mx + 'px';
    cur.style.top = my + 'px';
  });
  
  function animRing() {
    rx += (mx - rx) * .11;
    ry += (my - ry) * .11;
    ring!.style.left = rx + 'px';
    ring!.style.top = ry + 'px';
    requestAnimationFrame(animRing);
  }
  animRing();
  
  document.addEventListener('mouseover', e => {
    if ((e.target as HTMLElement).closest('a,button')) cur.classList.add('big');
    else cur.classList.remove('big');
  });
}

export function toggleMenu() {
  const menu = document.getElementById('mobMenu');
  const ham = document.getElementById('ham');
  if (menu) menu.classList.toggle('open');
  if (ham) ham.classList.toggle('open');
}
