'use client';

import { useEffect, useState } from 'react';
import { ProductCard } from '@/components/ProductCard';
import { CartSummary } from '@/components/CartSummary';
import { useCart } from '@/hooks/useCart';
import type { Product } from '@/types';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const { cart, addToCart, removeFromCart, updateQuantity, checkout, itemCount, total } = useCart();

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch('/api/products');
        const data = await response.json();
        if (data.success && data.data) {
          setProducts(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const handleAddToCart = async (productId: string) => {
    setAddingToCart(productId);
    await addToCart(productId);
    setAddingToCart(null);
  };

  const handleRemoveFromCart = async (productId: string) => {
    await removeFromCart(productId);
  };

  const handleUpdateQuantity = async (productId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(productId);
    } else {
      await updateQuantity(productId, quantity);
    }
  };

  const handleCheckout = async (discountCode?: string, finalTotal?: number) => {
    setCheckoutLoading(true);
    const result = await checkout({ type: 'card' }, discountCode);
    setCheckoutLoading(false);
    if (result.success && result.data) {
      const response = result.data;
      let message = `Order placed successfully!\nOrder ID: ${response.orderId}\nTotal: $${response.total || finalTotal || total}`;
      
      if (response.discountAmount) {
        message += `\nDiscount Applied: -$${response.discountAmount}`;
      }
      
      if (response.generatedDiscountCode) {
        message += `\n\n🎉 New Discount Code Generated!\nCode: ${response.generatedDiscountCode}\nSave this code for your next purchase!`;
      }
      
      alert(message);
    } else {
      alert(`Checkout failed: ${result.error || 'Unknown error'}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-sm text-muted-foreground">Loading products...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1 text-gray-900">Products</h1>
          <p className="text-xs text-gray-600">Browse and add items to your cart</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                  isLoading={addingToCart === product.id}
                />
              ))}
            </div>
          </div>

          <div className="lg:col-span-1">
            <CartSummary
              cart={cart}
              total={total}
              onCheckout={handleCheckout}
              onRemove={handleRemoveFromCart}
              onUpdateQuantity={handleUpdateQuantity}
              isLoading={checkoutLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
