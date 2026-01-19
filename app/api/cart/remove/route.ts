import { NextRequest } from 'next/server';
import { CartService } from '@/lib/services/cart.service';
import { handleServiceResponse, parseJsonBody, errorResponse } from '@/lib/api/utils';

// DELETE /api/cart/remove - Remove item from cart
export async function DELETE(request: NextRequest) {
  try {
    const bodyResult = await parseJsonBody<{
      userId: string;
      productId: string;
    }>(request);

    if (!bodyResult.success) {
      return errorResponse('INVALID_REQUEST', bodyResult.error, 400);
    }

    const { userId, productId } = bodyResult.data;

    if (!userId || !productId) {
      return errorResponse(
        'INVALID_REQUEST',
        'userId and productId are required',
        400
      );
    }

    const response = CartService.removeFromCart(userId, productId);
    return handleServiceResponse(response);
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to remove item from cart',
        },
      },
      { status: 500 }
    );
  }
}
