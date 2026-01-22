'use client';

import { Gift } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { Discount } from '@/types';

interface DiscountBannerProps {
  discount: Discount;
  className?: string;
}

export function DiscountBanner({ discount, className }: DiscountBannerProps) {
  return (
    <Card
      className={`mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 ${className || ''}`}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Gift className="h-6 w-6 text-blue-600" />
            <div>
              <p className="text-sm font-semibold text-blue-900">
                Active Discount Code Available!
              </p>
              <p className="text-xs text-blue-700">
                Use this code at checkout to save {discount.percentage}%
              </p>
            </div>
          </div>
          <div className="bg-white border-2 border-blue-300 rounded-md px-4 py-2 shadow-sm">
            <p className="text-xl font-bold text-blue-700 tracking-wider">{discount.code}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
