import { NextRequest } from 'next/server';
import { DiscountService } from '@/lib/services/discount.service';
import { handleServiceResponse, errorResponse } from '@/lib/api/utils';

// GET /api/admin/stats - Get discount statistics
export async function GET(request: NextRequest) {
  try {
    const response = DiscountService.getStats();
    return handleServiceResponse(response);
  } catch (error) {
    return errorResponse('INTERNAL_ERROR', 'Failed to get stats', 500);
  }
}
