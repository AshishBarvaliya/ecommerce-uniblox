import { NextRequest } from 'next/server';
import { DiscountService } from '@/lib/services/discount.service';
import { handleServiceResponse, errorResponse } from '@/lib/api/utils';

// GET /api/discount - Get current discount code (if available and not expired)
export async function GET(request: NextRequest) {
  try {
    const discount = DiscountService.getCurrentDiscount();
    
    return handleServiceResponse({
      success: true,
      data: discount,
    });
  } catch (error) {
    return errorResponse(
      'INTERNAL_ERROR',
      'Failed to get discount code',
      500
    );
  }
}
