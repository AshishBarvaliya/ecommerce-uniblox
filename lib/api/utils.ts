import type { NextRequest } from 'next/server';
import type { ApiResponse } from '@/types';

// API utility functions

// Parse JSON request body with error handling
export async function parseJsonBody<T>(
  request: NextRequest
): Promise<{ success: true; data: T } | { success: false; error: string }> {
  try {
    const body = await request.json();
    return { success: true, data: body as T };
  } catch (error) {
    return {
      success: false,
      error: 'Invalid JSON in request body',
    };
  }
}

// Create success response
export function successResponse<T>(
  data: T,
  status: number = 200
): Response {
  const response: ApiResponse<T> = {
    success: true,
    data,
  };
  return Response.json(response, { status });
}

// Create error response
export function errorResponse(
  code: string,
  message: string,
  status: number = 400
): Response {
  const response: ApiResponse<never> = {
    success: false,
    error: {
      code,
      message,
    },
  };
  return Response.json(response, { status });
}

// Handle service response
export function handleServiceResponse<T>(
  serviceResponse: ApiResponse<T>,
  successStatus: number = 200
): Response {
  if (serviceResponse.success && serviceResponse.data !== undefined) {
    return successResponse(serviceResponse.data, successStatus);
  }

  const error = serviceResponse.error || {
    code: 'UNKNOWN_ERROR',
    message: 'An unknown error occurred',
  };

  const statusMap: Record<string, number> = {
    PRODUCT_NOT_FOUND: 404,
    CART_NOT_FOUND: 404,
    CART_ITEM_NOT_FOUND: 404,
    PRODUCT_OUT_OF_STOCK: 409,
    INVALID_QUANTITY: 400,
    INVALID_REQUEST: 400,
    CHECKOUT_FAILED: 402,
    INTERNAL_ERROR: 500,
  };

  const status = statusMap[error.code] || 400;
  return errorResponse(error.code, error.message, status);
}
