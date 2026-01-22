'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: ReactNode;
  title?: string;
  description?: string;
  className?: string;
}

export function EmptyState({ icon, title, description, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-8 text-center', className)}>
      {icon && <div className="mb-4 text-muted-foreground">{icon}</div>}
      {title && <h3 className="text-sm font-semibold text-gray-900 mb-1">{title}</h3>}
      {description && <p className="text-xs text-gray-500">{description}</p>}
    </div>
  );
}
