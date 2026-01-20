'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Cart } from '@/types';

const USER_ID_KEY = 'ecommerce_user_id';

function getUserId(): string {
  if (typeof window === 'undefined') return 'user-1';
  const stored = localStorage.getItem(USER_ID_KEY);
  if (stored) return stored;
  const userId = `user-${Date.now()}`;
  localStorage.setItem(USER_ID_KEY, userId);
  return userId;
}

export function useCart() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const userId = getUserId();

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/cart?userId=${userId}`);
      const data = await response.json();
      if (data.success && data.data) {
        setCart(data.data);
        setError(null);
      } else {
        setError(data.error?.message || 'Failed to fetch cart');
      }
    } catch (err) {
      setError('Failed to fetch cart');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const addToCart = useCallback(
    async (productId: string, quantity: number = 1) => {
      try {
        const response = await fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, productId, quantity }),
        });
        const data = await response.json();
        if (data.success && data.data) {
          setCart(data.data);
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
    },
    [userId]
  );

  const removeFromCart = useCallback(
    async (productId: string) => {
      try {
        const response = await fetch('/api/cart/remove', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, productId }),
        });
        const data = await response.json();
        if (data.success && data.data) {
          setCart(data.data);
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
    },
    [userId]
  );

  const updateQuantity = useCallback(
    async (productId: string, quantity: number) => {
      try {
        const response = await fetch('/api/cart/update', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, productId, quantity }),
        });
        const data = await response.json();
        if (data.success && data.data) {
          setCart(data.data);
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
    },
    [userId]
  );

  const checkout = useCallback(
    async (paymentMethod: { type: 'card' | 'paypal' | 'apple_pay' }, discountCode?: string) => {
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
    },
    [userId, fetchCart]
  );

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

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
