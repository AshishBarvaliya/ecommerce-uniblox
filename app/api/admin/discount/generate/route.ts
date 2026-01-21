import { NextRequest } from 'next/server';
import { DiscountService } from '@/lib/services/discount.service';
import { handleServiceResponse, errorResponse } from '@/lib/api/utils';

// POST /api/admin/discount/generate - Manually generate discount code (admin function)
export async function POST(request: NextRequest) {
  try {
    // Use manual generation to allow admins to create codes at any time
    const response = DiscountService.generateDiscountManually();
    
    if (!response.success) {
      return handleServiceResponse(response);
    }

    return handleServiceResponse(response, 201);
  } catch (error) {
    return errorResponse(
      'INTERNAL_ERROR',
      'Failed to generate discount code',
      500
    );
  }
}
