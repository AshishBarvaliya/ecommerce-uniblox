import { NextRequest } from 'next/server';
import { ProductService } from '@/lib/services/product.service';
import { handleServiceResponse } from '@/lib/api/utils';

// GET /api/products - Get all products
export async function GET(request: NextRequest) {
  try {
    const response = ProductService.getAllProducts();
    return handleServiceResponse(response);
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch products',
        },
      },
      { status: 500 }
    );
  }
}
