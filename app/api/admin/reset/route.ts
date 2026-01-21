import { NextRequest } from 'next/server';
import { orders, carts, setCurrentDiscount } from '@/lib/store';
import { handleServiceResponse, errorResponse } from '@/lib/api/utils';

// POST /api/admin/reset - Reset store (orders, carts, discounts) but keep products
export async function POST(request: NextRequest) {
  try {
    // Clear orders
    orders.clear();
    
    // Clear carts
    carts.clear();
    
    // Reset discount
    setCurrentDiscount(null);

    return handleServiceResponse({
      success: true,
      data: {
        message: 'Store reset successfully. All orders, carts, and discount codes have been cleared.',
      },
    });
  } catch (error) {
    return errorResponse('INTERNAL_ERROR', 'Failed to reset store', 500);
  }
}
