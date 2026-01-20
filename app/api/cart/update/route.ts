import { NextRequest } from 'next/server';
import { CartService } from '@/lib/services/cart.service';
import { handleServiceResponse, parseJsonBody, errorResponse } from '@/lib/api/utils';

export async function PATCH(request: NextRequest) {
  try {
    const bodyResult = await parseJsonBody<{
      userId: string;
      productId: string;
      quantity: number;
    }>(request);

    if (!bodyResult.success) {
      return errorResponse('INVALID_REQUEST', bodyResult.error, 400);
    }

    const { userId, productId, quantity } = bodyResult.data;

    if (!userId || !productId || quantity === undefined) {
      return errorResponse(
        'INVALID_REQUEST',
        'userId, productId, and quantity are required',
        400
      );
    }

    const response = CartService.updateCartItemQuantity(userId, productId, quantity);
    return handleServiceResponse(response);
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update cart item',
        },
      },
      { status: 500 }
    );
  }
}
