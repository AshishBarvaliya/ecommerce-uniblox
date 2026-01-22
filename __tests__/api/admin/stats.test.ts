import { GET } from '@/app/api/admin/stats/route';
import { DiscountService } from '@/lib/services/discount.service';
import { NextRequest } from 'next/server';

// Mock the services
jest.mock('@/lib/services/discount.service');
jest.mock('@/lib/api/utils', () => ({
  handleServiceResponse: jest.fn((response) => {
    return Response.json(response, { status: 200 });
  }),
  errorResponse: jest.fn((code, message, status) => {
    return Response.json(
      {
        success: false,
        error: { code, message },
      },
      { status }
    );
  }),
}));

describe('/api/admin/stats', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('should return discount statistics successfully', async () => {
      const mockStats = {
        currentDiscount: {
          code: 'DISCOUNT10',
          percentage: 10,
          isUsed: false,
          createdAt: '2024-01-01',
          generatedAtOrder: 5,
        },
        orderCount: 5,
        n: 5,
        nextDiscountAt: null,
        totalDiscountsUsed: 1,
        totalOrders: 5,
        ordersWithDiscount: 1,
      };

      (DiscountService.getStats as jest.Mock).mockReturnValue({
        success: true,
        data: mockStats,
      });

      const request = new NextRequest('http://localhost:3000/api/admin/stats');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockStats);
      expect(DiscountService.getStats).toHaveBeenCalledTimes(1);
    });

    it('should handle service errors', async () => {
      (DiscountService.getStats as jest.Mock).mockReturnValue({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get stats',
        },
      });

      const request = new NextRequest('http://localhost:3000/api/admin/stats');
      const response = await GET(request);
      const data = await response.json();

      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
    });

    it('should handle exceptions', async () => {
      (DiscountService.getStats as jest.Mock).mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      const request = new NextRequest('http://localhost:3000/api/admin/stats');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INTERNAL_ERROR');
      expect(data.error.message).toBe('Failed to get stats');
    });
  });
});
