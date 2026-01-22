'use client';

import { X, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { CartItem as CartItemType, Product } from '@/types';

interface CartItemProps {
  item: CartItemType;
  product: Product;
  onRemove: (productId: string) => void;
  onUpdateQuantity?: (productId: string, quantity: number) => void;
}

export function CartItem({ item, product, onRemove, onUpdateQuantity }: CartItemProps) {
  const itemTotal = product.price * item.quantity;

  const handleDecrease = () => {
    if (item.quantity === 1) {
      onRemove(item.productId);
    } else {
      onUpdateQuantity?.(item.productId, item.quantity - 1);
    }
  };

  const handleIncrease = () => {
    onUpdateQuantity?.(item.productId, item.quantity + 1);
  };

  return (
    <div className="bg-gray-50 rounded-lg p-2.5 border border-gray-200 hover:border-primary/40 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-gray-900 truncate">{product.name}</p>
          <p className="text-xs text-gray-600 mt-0.5">${product.price} each</p>
          <div className="flex items-center gap-2 mt-1.5">
            {onUpdateQuantity ? (
              <div className="flex items-center gap-1.5 bg-white border border-gray-300 rounded-md p-0.5">
                <Button
                  type="button"
                  variant="quantity"
                  size="xs"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleDecrease();
                  }}
                  title="Decrease quantity or remove"
                >
                  <Minus className="text-blue-600 font-bold" strokeWidth={3} />
                </Button>
                <span className="text-sm font-semibold text-gray-900 min-w-[2rem] text-center">
                  {item.quantity}
                </span>
                <Button
                  type="button"
                  variant="quantity"
                  size="xs"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleIncrease();
                  }}
                  title="Increase quantity"
                >
                  <Plus className="text-blue-600 font-bold" strokeWidth={3} />
                </Button>
              </div>
            ) : (
              <span className="text-xs text-gray-600">Qty: {item.quantity}</span>
            )}
          </div>
          <p className="text-xs font-semibold text-primary mt-1">${itemTotal.toFixed(2)}</p>
        </div>
        <Button
          type="button"
          variant="iconGhost"
          size="xs"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRemove(item.productId);
          }}
          title="Remove item"
        >
          <X className="text-destructive" />
        </Button>
      </div>
    </div>
  );
}
