'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart } from 'lucide-react';
import { useProductMap } from '@/hooks/useProductMap';
import { CartItem } from '@/components/cart/CartItem';
import { DiscountCodeInput } from '@/components/cart/DiscountCodeInput';
import { EmptyCartModal } from '@/components/cart/EmptyCartModal';
import { EmptyState } from '@/components/common/EmptyState';
import { ShoppingBag } from 'lucide-react';
import type { CartItem as CartItemType } from '@/types';

interface CartSummaryProps {
  cart: { items: CartItemType[]; total: number; itemCount: number } | null;
  total: number;
  onCheckout: (discountCode?: string, finalTotal?: number) => void;
  onRemove: (productId: string) => void;
  onUpdateQuantity?: (productId: string, quantity: number) => void;
  isLoading?: boolean;
}

export function CartSummary({
  cart,
  total,
  onCheckout,
  onRemove,
  onUpdateQuantity,
  isLoading,
}: CartSummaryProps) {
  const products = useProductMap();
  const [discountCode, setDiscountCode] = useState<string>('');
  const [showEmptyCartModal, setShowEmptyCartModal] = useState(false);

  const handleCheckout = () => {
    if (!cart || !cart.items || cart.items.length === 0) {
      setShowEmptyCartModal(true);
      return;
    }
    onCheckout(discountCode.trim() || undefined, total);
  };

  const items = cart?.items || [];

  return (
    <>
      <EmptyCartModal open={showEmptyCartModal} onClose={() => setShowEmptyCartModal(false)} />

      <Card className="sticky top-4 bg-white border-2 border-gray-200 shadow-lg max-h-[calc(100vh-2rem)] flex flex-col">
        <CardHeader className="pb-2 px-4 pt-4 bg-gradient-to-r from-blue-50 to-transparent rounded-t-lg flex-shrink-0">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold text-gray-900">
            <ShoppingCart className="h-4 w-4 text-primary" />
            Cart Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col px-4 pb-4 overflow-hidden">
          {items.length === 0 ? (
            <EmptyState
              icon={<ShoppingBag className="h-8 w-8" />}
              title="Your cart is empty"
              description="Add items to get started"
            />
          ) : (
            <>
              <div className="flex-1 overflow-y-auto space-y-2 pr-2 mb-3">
                {items.map((item) => {
                  const product = products.get(item.productId);
                  if (!product) return null;

                  return (
                    <CartItem
                      key={item.productId}
                      item={item}
                      product={product}
                      onRemove={onRemove}
                      onUpdateQuantity={onUpdateQuantity}
                    />
                  );
                })}
              </div>
              <div className="flex-shrink-0 space-y-2.5 pt-2 border-t border-gray-200">
                <DiscountCodeInput
                  value={discountCode}
                  onChange={setDiscountCode}
                  className="mb-2"
                />
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-600">Items:</span>
                  <span className="font-bold text-gray-900">{cart?.itemCount || 0}</span>
                </div>
                <div className="flex justify-between items-center text-base font-bold">
                  <span className="text-gray-900">Total:</span>
                  <span className="text-blue-700 text-lg font-extrabold">${total.toFixed(2)}</span>
                </div>
                <Button
                  onClick={handleCheckout}
                  disabled={items.length === 0 || isLoading}
                  variant="gradient"
                  className="w-full h-10 mt-3"
                  size="sm"
                >
                  {isLoading ? 'Processing...' : 'Checkout'}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </>
  );
}
