'use client';

import { ProductCard } from '@/components/ProductCard';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { Package } from 'lucide-react';
import type { Product } from '@/types';

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
  onAddToCart: (productId: string) => void;
  addingToCartId?: string | null;
}

export function ProductGrid({
  products,
  loading = false,
  onAddToCart,
  addingToCartId,
}: ProductGridProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" text="Loading products..." />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <EmptyState
        icon={<Package className="h-12 w-12" />}
        title="No products available"
        description="Check back later for new products"
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={onAddToCart}
          isLoading={addingToCartId === product.id}
        />
      ))}
    </div>
  );
}
