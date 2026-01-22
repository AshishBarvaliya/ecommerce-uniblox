'use client';

import { useState, useEffect } from 'react';
import type { Discount, ApiResponse } from '@/types';

interface UseDiscountReturn {
  discount: Discount | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useDiscount(): UseDiscountReturn {
  const [discount, setDiscount] = useState<Discount | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDiscount = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/discount');
      const data: ApiResponse<Discount> = await response.json();
      
      if (data.success && data.data) {
        setDiscount(data.data);
      } else {
        setDiscount(null);
        // Not an error if no discount is available
      }
    } catch (err) {
      setError('Failed to fetch discount');
      console.error('Failed to fetch discount:', err);
      setDiscount(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscount();
  }, []);

  return {
    discount,
    loading,
    error,
    refetch: fetchDiscount,
  };
}
