import { NextRequest } from 'next/server';
import { CheckoutService } from '@/lib/services/checkout.service';
import { handleServiceResponse, parseJsonBody, errorResponse } from '@/lib/api/utils';

// POST /api/checkout - Process checkout
export async function POST(request: NextRequest) {
  try {
    const bodyResult = await parseJsonBody<{
      userId: string;
      paymentMethod: {
        type: 'card' | 'paypal' | 'apple_pay';
      };
    }>(request);

    if (!bodyResult.success) {
      return errorResponse('INVALID_REQUEST', bodyResult.error, 400);
    }

    const response = await CheckoutService.processCheckout(bodyResult.data);
    return handleServiceResponse(response, 201);
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to process checkout',
        },
      },
      { status: 500 }
    );
  }
}
