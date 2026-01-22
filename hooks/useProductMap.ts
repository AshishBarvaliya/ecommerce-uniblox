'use client';

import { useState, useEffect } from 'react';
import { useProducts } from './useProducts';
import type { Product } from '@/types';

export function useProductMap(): Map<string, Product> {
  const { products } = useProducts();
  const [productMap, setProductMap] = useState<Map<string, Product>>(new Map());

  useEffect(() => {
    const map = new Map<string, Product>();
    products.forEach((product) => {
      map.set(product.id, product);
    });
    setProductMap(map);
  }, [products]);

  return productMap;
}
