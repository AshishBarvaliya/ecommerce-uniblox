import type { Product, Cart, Order, Discount } from '@/types';
import { dummyProducts } from './products';

// In-memory store - simple data structures
export const products = new Map<string, Product>();
export const carts = new Map<string, Cart>();
export const orders = new Map<string, Order>();

// Discount state (private)
let currentDiscount: Discount | null = null;

// Discount getters and setters
export function getCurrentDiscount(): Discount | null {
  return currentDiscount;
}

export function setCurrentDiscount(discount: Discount | null): void {
  currentDiscount = discount;
}

// Initialize with static dummy products
dummyProducts.forEach((product) => {
  products.set(product.id, product);
});
