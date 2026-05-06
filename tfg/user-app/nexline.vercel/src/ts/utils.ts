export function showToast(msg: string) {
  const t = document.getElementById('toast');
  const msgEl = document.getElementById('toastMsg');
  if (!t || !msgEl) return;
  
  msgEl.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

export function acceptCookies() {
  localStorage.setItem('cookies', 'true');
  const cookieBar = document.getElementById('cookieBar');
  if (cookieBar) cookieBar.classList.remove('show');
}

export function declineCookies() {
  localStorage.setItem('cookies', 'declined');
  const cookieBar = document.getElementById('cookieBar');
  if (cookieBar) cookieBar.classList.remove('show');
}

export const colorMap: Record<string, string> = {
  'BLACK': '#000000',
  'NEGRAS': '#000000',
  'WHITE': '#ffffff',
  'BLANCAS': '#ffffff',
  'RED': '#ff0000',
  'ROJO': '#ff0000',
  'ROSE': '#ffc0cb',
  'ROSAS': '#ffc0cb',
  'LIGHT CREAM': '#f5f5dc',
  'CREAM': '#f5f5dc',
  'CREMA': '#f5f5dc',
  'GREY': '#808080',
  'GRIS': '#808080',
  'NAVY': '#000080',
  'AZUL': '#0000ff',
  'AZULES': '#0000ff',
  'MORADAS': '#800080',
  'CIAN': '#00ffff',
  'BLUE': '#1e90ff',
  'GREEN': '#2e8b57',
  'BEIGE': '#d2b48c',
  'ASH': '#b2beb5',
  'IVORY': '#fffff0',
  'MARRONES': '#8b4513',
  'OG': '#bcbcbc',
  'MULTICOLOR': 'linear-gradient(45deg, red, blue, green)',
  'AZUL BLANCAS': 'linear-gradient(to right, #0000ff, #ffffff)',
  'AZUL NEGRAS': 'linear-gradient(to right, #0000ff, #000000)',
  'MULTICOLOR BLANCAS': 'linear-gradient(45deg, #ff0000, #00ff00, #ffffff)'
};
