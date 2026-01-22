'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function PageHeader({ title, description, action, className }: PageHeaderProps) {
  return (
    <div className={cn('mb-6', className)}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-1 text-gray-900">{title}</h1>
          {description && <p className="text-xs text-gray-600">{description}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
    </div>
  );
}
