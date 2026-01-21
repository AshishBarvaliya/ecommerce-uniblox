'use client';

import { useEffect, useState } from 'react';
import { ProductCard } from '@/components/ProductCard';
import { CartSummary } from '@/components/CartSummary';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';
import { CheckCircle2, XCircle, Gift } from 'lucide-react';
import type { Product, Discount } from '@/types';
import { Card, CardContent } from '@/components/ui/card';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [currentDiscount, setCurrentDiscount] = useState<Discount | null>(null);
  const [checkoutModal, setCheckoutModal] = useState<{
    open: boolean;
    type: 'success' | 'error';
    title: string;
    message: string;
    orderId?: string;
    total?: number;
    discountAmount?: number;
    generatedDiscountCode?: string;
  }>({
    open: false,
    type: 'success',
    title: '',
    message: '',
  });
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

  useEffect(() => {
    async function fetchDiscount() {
      try {
        const response = await fetch('/api/discount');
        const data = await response.json();
        if (data.success && data.data) {
          setCurrentDiscount(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch discount:', error);
      }
    }
    fetchDiscount();
    // Refresh discount after checkout
    const interval = setInterval(fetchDiscount, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const handleAddToCart = async (productId: string) => {
    setAddingToCart(productId);
    await addToCart(productId);
    setAddingToCart(null);
  };

  const handleRemoveFromCart = async (productId: string) => {
    try {
      await removeFromCart(productId);
    } catch (error) {
      console.error('Failed to remove from cart:', error);
    }
  };

  const handleUpdateQuantity = async (productId: string, quantity: number) => {
    try {
      if (quantity <= 0) {
        await removeFromCart(productId);
      } else {
        await updateQuantity(productId, quantity);
      }
    } catch (error) {
      console.error('Failed to update quantity:', error);
    }
  };

  const handleCheckout = async (discountCode?: string, finalTotal?: number) => {
    setCheckoutLoading(true);
    const result = await checkout({ type: 'card' }, discountCode);
    setCheckoutLoading(false);
    if (result.success && result.data) {
      const response = result.data;
      setCheckoutModal({
        open: true,
        type: 'success',
        title: 'Order Placed Successfully!',
        message: 'Your order has been placed successfully.',
        orderId: response.orderId,
        total: response.total || finalTotal || total,
        discountAmount: response.discountAmount,
        generatedDiscountCode: response.generatedDiscountCode,
      });
      // Refresh discount code after checkout
      const discountResponse = await fetch('/api/discount');
      const discountData = await discountResponse.json();
      if (discountData.success && discountData.data) {
        setCurrentDiscount(discountData.data);
      } else {
        setCurrentDiscount(null);
      }
    } else {
      setCheckoutModal({
        open: true,
        type: 'error',
        title: 'Checkout Failed',
        message: result.error || 'Unknown error occurred',
      });
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
      <Dialog open={checkoutModal.open} onOpenChange={(open) => setCheckoutModal({ ...checkoutModal, open })}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              {checkoutModal.type === 'success' ? (
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              ) : (
                <XCircle className="h-6 w-6 text-red-600" />
              )}
              {checkoutModal.title}
            </DialogTitle>
            {checkoutModal.type === 'success' ? (
              <DialogDescription className="text-base text-gray-600">
                {checkoutModal.message}
              </DialogDescription>
            ) : null}
          </DialogHeader>
          
          {checkoutModal.type === 'success' ? (
            <div className="space-y-4 py-4">
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                  <span className="text-sm font-medium text-gray-600">Order ID</span>
                  <span className="text-sm font-mono font-semibold text-gray-900">{checkoutModal.orderId}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                  <span className="text-sm font-medium text-gray-600">Total</span>
                  <span className="text-lg font-bold text-gray-900">${checkoutModal.total?.toFixed(2)}</span>
                </div>
                {checkoutModal.discountAmount && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">Discount Applied</span>
                    <span className="text-sm font-semibold text-green-600">-${checkoutModal.discountAmount.toFixed(2)}</span>
                  </div>
                )}
              </div>
              
              {checkoutModal.generatedDiscountCode && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Gift className="h-5 w-5 text-blue-600" />
                    <p className="font-semibold text-blue-900">New Discount Code Generated!</p>
                  </div>
                  <p className="text-sm text-blue-700 mb-3">Save this code for your next purchase:</p>
                  <div className="bg-white border-2 border-blue-300 rounded-md p-3 shadow-sm">
                    <p className="text-2xl font-bold text-blue-700 text-center tracking-wider">
                      {checkoutModal.generatedDiscountCode}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="py-4">
              <p className="text-red-600 font-medium">{checkoutModal.message}</p>
            </div>
          )}
          
          <DialogFooter className="mt-4">
            <Button 
              onClick={() => setCheckoutModal({ ...checkoutModal, open: false })}
              className={checkoutModal.type === 'success' ? 'w-full bg-blue-600 hover:bg-blue-700 text-white' : ''}
              size="lg"
            >
              {checkoutModal.type === 'success' ? 'Continue Shopping' : 'Close'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Current Discount Code Banner */}
        {currentDiscount && (
          <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Gift className="h-6 w-6 text-blue-600" />
                  <div>
                    <p className="text-sm font-semibold text-blue-900">Active Discount Code Available!</p>
                    <p className="text-xs text-blue-700">Use this code at checkout to save {currentDiscount.percentage}%</p>
                  </div>
                </div>
                <div className="bg-white border-2 border-blue-300 rounded-md px-4 py-2 shadow-sm">
                  <p className="text-xl font-bold text-blue-700 tracking-wider">
                    {currentDiscount.code}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

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
