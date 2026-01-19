import { NextRequest } from 'next/server';
import { CartService } from '@/lib/services/cart.service';
import { handleServiceResponse, parseJsonBody, errorResponse } from '@/lib/api/utils';

// GET /api/cart?userId=xxx - Get user's cart
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return errorResponse('INVALID_REQUEST', 'userId query parameter is required', 400);
    }

    const response = CartService.getCart(userId);
    return handleServiceResponse(response);
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch cart',
        },
      },
      { status: 500 }
    );
  }
}

// POST /api/cart - Add item to cart
export async function POST(request: NextRequest) {
  try {
    const bodyResult = await parseJsonBody<{
      userId: string;
      productId: string;
      quantity?: number;
    }>(request);

    if (!bodyResult.success) {
      return errorResponse('INVALID_REQUEST', bodyResult.error, 400);
    }

    const { userId, productId, quantity = 1 } = bodyResult.data;

    if (!userId || !productId) {
      return errorResponse(
        'INVALID_REQUEST',
        'userId and productId are required',
        400
      );
    }

    const response = CartService.addToCart(userId, productId, quantity);
    return handleServiceResponse(response);
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to add item to cart',
        },
      },
      { status: 500 }
    );
  }
}
