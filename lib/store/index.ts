import type { Product, Cart, Order } from '@/types';
import { dummyProducts } from './products';

// In-memory store - simple data structures
export const products = new Map<string, Product>();
export const carts = new Map<string, Cart>();
export const orders = new Map<string, Order>();

// Initialize with static dummy products
dummyProducts.forEach((product) => {
  products.set(product.id, product);
});
