export interface Product {
  id: number;
  name: string;
  sub: string;
  description?: string;
  price: number;
  old_price?: number | null;
  cat: string;
  category?: string;
  badge?: string | null;
  color: string;
  img: string;
  image_url?: string;
  images?: string[];
  sizes: string[];
  stock?: number;
  is_featured?: number;
  is_new?: number;
  created_at?: string;
}

export interface CartItem {
  id: number;
  name: string;
  price: number;
  img: string;
  size: string;
  qty: number;
  [key: string]: any;
}

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface PendingAction {
  type: 'cart' | 'wish' | 'cart-open' | 'wish-open';
  id?: number;
  size?: string | null;
}

export const COLOR_MAP: Record<string, string> = {
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
  'OG': '#bcbcbc',
  'MULTICOLOR': 'linear-gradient(45deg, red, blue, green)',
  'AZUL BLANCAS': 'linear-gradient(to right, #0000ff, #ffffff)',
  'AZUL NEGRAS': 'linear-gradient(to right, #0000ff, #000000)',
  'MULTICOLOR BLANCAS': 'linear-gradient(45deg, #ff0000, #00ff00, #ffffff)'
};

export const CATEGORY_ORDER: Record<string, number> = {
  'hoodies': 1,
  'tees': 2,
  'jackets': 3,
  'sneakers': 4
};
