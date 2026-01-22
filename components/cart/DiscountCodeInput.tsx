'use client';

import { Tag } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DiscountCodeInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function DiscountCodeInput({
  value,
  onChange,
  placeholder = 'Enter discount code',
  className,
}: DiscountCodeInputProps) {
  return (
    <div className={cn('bg-gray-50 border border-gray-300 rounded-md p-2', className)}>
      <div className="flex items-center gap-1.5 mb-1.5">
        <Tag className="h-3.5 w-3.5 text-gray-600" />
        <span className="text-xs font-semibold text-gray-700">Have a discount code?</span>
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value.toUpperCase())}
        placeholder={placeholder}
        className="w-full text-xs px-2 py-1.5 border border-gray-300 rounded bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
      />
    </div>
  );
}
