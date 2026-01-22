'use client';

import { useState, useEffect } from 'react';
import type { Cart } from '@/types';

const USER_ID_KEY = 'ecommerce_user_id';
const CART_STORAGE_KEY = 'ecommerce_cart';

function getUserId(): string {
  if (typeof window === 'undefined') return 'user-1';
  const stored = localStorage.getItem(USER_ID_KEY);
  if (stored) return stored;
  const userId = `user-${Date.now()}`;
  localStorage.setItem(USER_ID_KEY, userId);
  return userId;
}

function saveCartToStorage(cart: Cart | null): void {
  if (typeof window === 'undefined') return;
  if (cart) {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } else {
    localStorage.removeItem(CART_STORAGE_KEY);
  }
}

function getCartFromStorage(): Cart | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as Cart;
    }
  } catch (error) {
    console.error('Failed to parse cart from localStorage:', error);
  }
  return null;
}

export function useCart() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const userId = getUserId();

  const fetchCart = async () => {
    try {
      setLoading(true);
      
      // First, fetch the cart from server
      const response = await fetch(`/api/cart?userId=${userId}`);
      const data = await response.json();
      
      if (data.success && data.data) {
        const serverCart = data.data;
        
        // If server cart is empty, check localStorage and restore if needed
        if (serverCart.items.length === 0) {
          const storedCart = getCartFromStorage();
          
          // If we have a stored cart with items, restore it to the server
          if (storedCart && storedCart.items && storedCart.items.length > 0) {
            // Restore cart items to server (addToCart handles duplicates correctly)
            for (const item of storedCart.items) {
              try {
                await fetch('/api/cart', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ 
                    userId, 
                    productId: item.productId, 
                    quantity: item.quantity 
                  }),
                });
              } catch (err) {
                console.error('Failed to restore cart item:', err);
              }
            }
            
            // Fetch the restored cart
            const restoreResponse = await fetch(`/api/cart?userId=${userId}`);
            const restoreData = await restoreResponse.json();
            if (restoreData.success && restoreData.data) {
              setCart(restoreData.data);
              saveCartToStorage(restoreData.data);
              setError(null);
              return;
            }
          }
        }
        
        // Use server cart (either it had items, or restore failed)
        setCart(serverCart);
        saveCartToStorage(serverCart);
        setError(null);
      } else {
        // Server error - try to use stored cart
        const storedCart = getCartFromStorage();
        if (storedCart && storedCart.items && storedCart.items.length > 0) {
          setCart(storedCart);
          setError(null);
        } else {
          setError(data.error?.message || 'Failed to fetch cart');
        }
      }
    } catch (err) {
      // On error, try to use stored cart
      const storedCart = getCartFromStorage();
      if (storedCart) {
        setCart(storedCart);
        setError(null);
      } else {
        setError('Failed to fetch cart');
      }
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId: string, quantity: number = 1) => {
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, productId, quantity }),
      });
      const data = await response.json();
      if (data.success && data.data) {
        setCart(data.data);
        saveCartToStorage(data.data);
        setError(null);
        return true;
      } else {
        setError(data.error?.message || 'Failed to add to cart');
        return false;
      }
    } catch (err) {
      setError('Failed to add to cart');
      return false;
    }
  };

  const removeFromCart = async (productId: string) => {
    try {
      const response = await fetch('/api/cart/remove', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, productId }),
      });
      const data = await response.json();
      if (data.success && data.data) {
        setCart(data.data);
        saveCartToStorage(data.data);
        setError(null);
        return true;
      } else {
        setError(data.error?.message || 'Failed to remove from cart');
        return false;
      }
    } catch (err) {
      setError('Failed to remove from cart');
      return false;
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    try {
      const response = await fetch('/api/cart/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, productId, quantity }),
      });
      const data = await response.json();
      if (data.success && data.data) {
        setCart(data.data);
        saveCartToStorage(data.data);
        setError(null);
        return true;
      } else {
        setError(data.error?.message || 'Failed to update quantity');
        return false;
      }
    } catch (err) {
      setError('Failed to update quantity');
      return false;
    }
  };

  const checkout = async (paymentMethod: { type: 'card' | 'paypal' | 'apple_pay' }, discountCode?: string) => {
    try {
      // Verify cart has items before checkout
      const cartCheckResponse = await fetch(`/api/cart?userId=${userId}`);
      const cartCheckData = await cartCheckResponse.json();
      
      if (!cartCheckData.success || !cartCheckData.data || !cartCheckData.data.items || cartCheckData.data.items.length === 0) {
        return { success: false, error: 'Cart is empty. Please add items before checkout.' };
      }

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          paymentMethod,
          discountCode,
        }),
      });
      const data = await response.json();
      if (data.success) {
        // Clear cart after successful checkout
        const emptyCart: Cart = {
          id: `cart-${userId}`,
          userId,
          items: [],
          total: 0,
          itemCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setCart(emptyCart);
        saveCartToStorage(emptyCart);
        await fetchCart();
        return { success: true, data: data.data };
      } else {
        setError(data.error?.message || 'Checkout failed');
        return { success: false, error: data.error?.message };
      }
    } catch (err) {
      setError('Checkout failed');
      return { success: false, error: 'Checkout failed' };
    }
  };

  useEffect(() => {
    fetchCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount - userId is stable from localStorage

  return {
    cart,
    loading,
    error,
    addToCart,
    removeFromCart,
    updateQuantity,
    checkout,
    refreshCart: fetchCart,
    itemCount: cart?.itemCount || 0,
    total: cart?.total || 0,
  };
}
