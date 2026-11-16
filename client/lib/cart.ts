
// client/lib/cart.ts
// Cart utilities — persist to localStorage

export type CartItem = {
  cartKey: string;    // `${productId}-${variantLabel}`
  productId: string;
  name: string;
  variantLabel: string;
  unitPrice: number;
  quantity: number;
  image?: string;
};

const KEY = "chai_cart";

export const loadCart = (): CartItem[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
};

export const saveCart = (items: CartItem[]): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(items));
};

export const clearCart = (): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
};

export const addItem = (cart: CartItem[], item: Omit<CartItem, "cartKey">): CartItem[] => {
  const cartKey = `${item.productId}-${item.variantLabel}`;
  const existing = cart.find((c) => c.cartKey === cartKey);
  if (existing) {
    return cart.map((c) => c.cartKey === cartKey ? { ...c, quantity: c.quantity + item.quantity } : c);
  }
  return [...cart, { ...item, cartKey }];
};

export const removeItem = (cart: CartItem[], cartKey: string): CartItem[] =>
  cart.filter((c) => c.cartKey !== cartKey);

export const updateQty = (cart: CartItem[], cartKey: string, quantity: number): CartItem[] => {
  if (quantity <= 0) return removeItem(cart, cartKey);
  return cart.map((c) => c.cartKey === cartKey ? { ...c, quantity } : c);
};

export const cartSubtotal = (cart: CartItem[]): number =>
  cart.reduce((sum, c) => sum + c.unitPrice * c.quantity, 0);

export const cartItemCount = (cart: CartItem[]): number =>
  cart.reduce((sum, c) => sum + c.quantity, 0);
