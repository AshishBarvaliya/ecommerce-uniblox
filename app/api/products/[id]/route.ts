import { NextRequest } from 'next/server';
import { ProductService } from '@/lib/services/product.service';
import { handleServiceResponse } from '@/lib/api/utils';

// GET /api/products/[id] - Get product by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const response = ProductService.getProductById(id);
    return handleServiceResponse(response);
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch product',
        },
      },
      { status: 500 }
    );
  }
}
