'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { Product } from '@/types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (productId: string) => void;
  isLoading?: boolean;
}

export function ProductCard({ product, onAddToCart, isLoading }: ProductCardProps) {
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Electronics: 'from-blue-500 to-cyan-500',
      Clothing: 'from-purple-500 to-pink-500',
      Accessories: 'from-orange-500 to-amber-500',
    };
    return colors[category] || 'from-slate-500 to-gray-500';
  };

  return (
    <Card className="flex flex-col h-full bg-white border-2 border-gray-200 hover:border-primary/40 transition-all duration-300 shadow-md hover:shadow-xl relative overflow-hidden">
      <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${getCategoryColor(product.category)}`} />
      <CardHeader className="pb-2 px-4 pt-4 relative">
        <CardTitle className="text-base leading-tight font-semibold text-gray-900">{product.name}</CardTitle>
        <CardDescription className="text-xs mt-0.5 text-primary font-medium">{product.category}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between pb-2 px-4">
        <p className="text-xs text-gray-600 mb-2 line-clamp-3 leading-relaxed">{product.description}</p>
        <p className="text-lg font-bold text-primary">${product.price}</p>
      </CardContent>
      <CardFooter className="pt-0 px-4 pb-4">
        <Button
          onClick={() => onAddToCart(product.id)}
          disabled={isLoading}
          className="w-full h-10 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 hover:from-blue-700 hover:via-blue-600 hover:to-blue-700 text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed border-0"
          size="sm"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Adding...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <span>Add to Cart</span>
            </span>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
