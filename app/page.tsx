'use client';

import { useState } from 'react';
import { CartSummary } from '@/components/CartSummary';
import { CheckoutModal, type CheckoutModalState } from '@/components/checkout/CheckoutModal';
import { DiscountBanner } from '@/components/discount/DiscountBanner';
import { ProductGrid } from '@/components/products/ProductGrid';
import { PageHeader } from '@/components/common/PageHeader';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useCart } from '@/hooks/useCart';
import { useProducts } from '@/hooks/useProducts';
import { useDiscount } from '@/hooks/useDiscount';

export default function Home() {
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutModal, setCheckoutModal] = useState<CheckoutModalState>({
    open: false,
    type: 'success',
    title: '',
    message: '',
  });

  const { products, loading: productsLoading } = useProducts();
  const { discount, refetch: refetchDiscount } = useDiscount();
  const { cart, addToCart, removeFromCart, updateQuantity, checkout, total } = useCart();

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
      // Refresh discount code after successful checkout
      await refetchDiscount();
    } else {
      setCheckoutModal({
        open: true,
        type: 'error',
        title: 'Checkout Failed',
        message: result.error || 'Unknown error occurred',
      });
    }
  };

  const handleCloseCheckoutModal = () => {
    setCheckoutModal((prev) => ({ ...prev, open: false }));
  };

  if (productsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading products..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CheckoutModal state={checkoutModal} onClose={handleCloseCheckoutModal} />

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {discount && <DiscountBanner discount={discount} />}

        <PageHeader
          title="Products"
          description="Browse and add items to your cart"
        />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-3">
            <ProductGrid
              products={products}
              loading={productsLoading}
              onAddToCart={handleAddToCart}
              addingToCartId={addingToCart}
            />
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
