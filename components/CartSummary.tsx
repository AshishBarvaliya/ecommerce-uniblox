'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, X, Plus, Minus, Tag } from 'lucide-react';
import type { CartItem, Product } from '@/types';

interface CartSummaryProps {
  cart: { items: CartItem[]; total: number; itemCount: number } | null;
  total: number;
  onCheckout: (discountCode?: string, finalTotal?: number) => void;
  onRemove: (productId: string) => void;
  onUpdateQuantity?: (productId: string, quantity: number) => void;
  isLoading?: boolean;
}

export function CartSummary({ cart, total, onCheckout, onRemove, onUpdateQuantity, isLoading }: CartSummaryProps) {
  const [products, setProducts] = useState<Map<string, Product>>(new Map());
  const [discountCode, setDiscountCode] = useState<string>('');

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch('/api/products');
        const data = await response.json();
        if (data.success && data.data) {
          const productMap = new Map<string, Product>();
          data.data.forEach((product: Product) => {
            productMap.set(product.id, product);
          });
          setProducts(productMap);
        }
      } catch (error) {
        console.error('Failed to fetch products:', error);
      }
    }
    fetchProducts();
  }, []);

  const handleCheckout = () => {
    if (!cart || !cart.items || cart.items.length === 0) {
      alert('Your cart is empty. Please add items before checkout.');
      return;
    }
    onCheckout(discountCode.trim() || undefined, total);
  };

  const items = cart?.items || [];

  return (
    <Card className="sticky top-4 bg-white border-2 border-gray-200 shadow-lg max-h-[calc(100vh-2rem)] flex flex-col">
      <CardHeader className="pb-2 px-4 pt-4 bg-gradient-to-r from-blue-50 to-transparent rounded-t-lg flex-shrink-0">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold text-gray-900">
          <ShoppingCart className="h-4 w-4 text-primary" />
          Cart Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col px-4 pb-4 overflow-hidden">
        {items.length === 0 ? (
          <div className="text-center py-8 text-xs text-gray-500">
            Your cart is empty
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto space-y-2 pr-2 mb-3">
              {items.map((item) => {
                const product = products.get(item.productId);
                if (!product) return null;
                const itemTotal = product.price * item.quantity;

                return (
                  <div
                    key={item.productId}
                    className="bg-gray-50 rounded-lg p-2.5 border border-gray-200 hover:border-primary/40 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-900 truncate">{product.name}</p>
                        <p className="text-xs text-gray-600 mt-0.5">${product.price} each</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          {onUpdateQuantity ? (
                            <div className="flex items-center gap-1.5 bg-white border border-gray-300 rounded-md p-0.5">
                              <button
                                onClick={() => {
                                  if (item.quantity === 1) {
                                    onRemove(item.productId);
                                  } else {
                                    onUpdateQuantity?.(item.productId, item.quantity - 1);
                                  }
                                }}
                                className="w-6 h-6 flex items-center justify-center rounded bg-blue-50 hover:bg-blue-100 active:bg-blue-200 border border-blue-200 hover:border-blue-300 transition-all"
                                title="Decrease quantity or remove"
                              >
                                <Minus className="h-4 w-4 text-blue-600 font-bold" strokeWidth={3} />
                              </button>
                              <span className="text-sm font-semibold text-gray-900 min-w-[2rem] text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
                                className="w-6 h-6 flex items-center justify-center rounded bg-blue-50 hover:bg-blue-100 active:bg-blue-200 border border-blue-200 hover:border-blue-300 transition-all"
                                title="Increase quantity"
                              >
                                <Plus className="h-4 w-4 text-blue-600 font-bold" strokeWidth={3} />
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-600">Qty: {item.quantity}</span>
                          )}
                        </div>
                        <p className="text-xs font-semibold text-primary mt-1">${itemTotal}</p>
                      </div>
                      <button
                        onClick={() => onRemove(item.productId)}
                        className="p-1 rounded hover:bg-red-100 transition-colors flex-shrink-0"
                        title="Remove item"
                      >
                        <X className="h-3.5 w-3.5 text-destructive" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex-shrink-0 space-y-2.5 pt-2 border-t border-gray-200">
              <div className="bg-gray-50 border border-gray-300 rounded-md p-2 mb-2">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Tag className="h-3.5 w-3.5 text-gray-600" />
                  <span className="text-xs font-semibold text-gray-700">Have a discount code?</span>
                </div>
                <input
                  type="text"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                  placeholder="Enter discount code"
                  className="w-full text-xs px-2 py-1.5 border border-gray-300 rounded bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-600">Items:</span>
                <span className="font-bold text-gray-900">{cart?.itemCount || 0}</span>
              </div>
              <div className="flex justify-between items-center text-base font-bold">
                <span className="text-gray-900">Total:</span>
                <span className="text-blue-700 text-lg font-extrabold">${total}</span>
              </div>
              <Button
                onClick={handleCheckout}
                disabled={items.length === 0 || isLoading}
                className="w-full h-10 mt-3 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 hover:from-blue-700 hover:via-blue-600 hover:to-blue-700 text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                size="sm"
              >
                Checkout
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
