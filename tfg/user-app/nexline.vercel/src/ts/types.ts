export interface Product {
  id: number;
  name: string;
  sub: string;
  price: number;
  old: number | null;
  cat: string;
  badge: string | null;
  color: string;
  img: string;
  sizes: string[];
  is_featured?: number;
  is_new?: number;
}

export interface CartItem {
  id: number;
  name: string;
  price: number;
  img: string;
  size: string;
  qty: number;
}
