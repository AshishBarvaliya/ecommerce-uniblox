'use client';

import { CheckCircle2, XCircle, Gift } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export interface CheckoutModalState {
  open: boolean;
  type: 'success' | 'error';
  title: string;
  message: string;
  orderId?: string;
  total?: number;
  discountAmount?: number;
  generatedDiscountCode?: string;
}

interface CheckoutModalProps {
  state: CheckoutModalState;
  onClose: () => void;
}

export function CheckoutModal({ state, onClose }: CheckoutModalProps) {
  return (
    <Dialog open={state.open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            {state.type === 'success' ? (
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            ) : (
              <XCircle className="h-6 w-6 text-red-600" />
            )}
            {state.title}
          </DialogTitle>
          {state.type === 'success' && (
            <DialogDescription className="text-base text-gray-600">
              {state.message}
            </DialogDescription>
          )}
        </DialogHeader>

        {state.type === 'success' ? (
          <div className="space-y-4 py-4">
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                <span className="text-sm font-medium text-gray-600">Order ID</span>
                <span className="text-sm font-mono font-semibold text-gray-900">
                  {state.orderId}
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                <span className="text-sm font-medium text-gray-600">Total</span>
                <span className="text-lg font-bold text-gray-900">
                  ${state.total?.toFixed(2)}
                </span>
              </div>
              {state.discountAmount && (
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Discount Applied</span>
                  <span className="text-sm font-semibold text-green-600">
                    -${state.discountAmount.toFixed(2)}
                  </span>
                </div>
              )}
            </div>

            {state.generatedDiscountCode && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Gift className="h-5 w-5 text-blue-600" />
                  <p className="font-semibold text-blue-900">New Discount Code Generated!</p>
                </div>
                <p className="text-sm text-blue-700 mb-3">
                  Save this code for your next purchase:
                </p>
                <div className="bg-white border-2 border-blue-300 rounded-md p-3 shadow-sm">
                  <p className="text-2xl font-bold text-blue-700 text-center tracking-wider">
                    {state.generatedDiscountCode}
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="py-4">
            <p className="text-red-600 font-medium">{state.message}</p>
          </div>
        )}

        <DialogFooter className="mt-4">
          <Button
            onClick={onClose}
            className={state.type === 'success' ? 'w-full' : ''}
            size="lg"
            variant={state.type === 'success' ? 'gradient' : 'outline'}
          >
            {state.type === 'success' ? 'Continue Shopping' : 'Close'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
