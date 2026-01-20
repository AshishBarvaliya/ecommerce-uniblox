import { NextRequest } from 'next/server';
import { DiscountService } from '@/lib/services/discount.service';
import { handleServiceResponse, errorResponse } from '@/lib/api/utils';

// POST /api/admin/discount/generate - Generate discount code if condition is satisfied
export async function POST(request: NextRequest) {
  try {
    const response = DiscountService.generateDiscountIfEligible();
    
    if (!response.success) {
      return handleServiceResponse(response);
    }

    // If no discount was generated (condition not met), return appropriate message
    if (!response.data) {
      return Response.json(
        {
          success: true,
          data: null,
          message: 'Discount code generation condition not satisfied. Next discount will be available on the next Nth order.',
        },
        { status: 200 }
      );
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
