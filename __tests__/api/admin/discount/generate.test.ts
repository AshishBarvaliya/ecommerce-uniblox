import { POST } from '@/app/api/admin/discount/generate/route';
import { DiscountService } from '@/lib/services/discount.service';
import { NextRequest } from 'next/server';

// Mock the services
jest.mock('@/lib/services/discount.service');
jest.mock('@/lib/api/utils', () => ({
  handleServiceResponse: jest.fn((response, status = 200) => {
    return Response.json(response, { status });
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

describe('/api/admin/discount/generate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST', () => {
    it('should generate discount code successfully', async () => {
      const mockDiscount = {
        code: 'DISCOUNT10',
        percentage: 10,
        isUsed: false,
        createdAt: '2024-01-01',
        generatedAtOrder: 0,
      };

      (DiscountService.generateDiscountManually as jest.Mock).mockReturnValue({
        success: true,
        data: mockDiscount,
      });

      const request = new NextRequest('http://localhost:3000/api/admin/discount/generate', {
        method: 'POST',
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockDiscount);
      expect(DiscountService.generateDiscountManually).toHaveBeenCalledTimes(1);
    });

    it('should handle service errors', async () => {
      (DiscountService.generateDiscountManually as jest.Mock).mockReturnValue({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to generate discount code',
        },
      });

      const request = new NextRequest('http://localhost:3000/api/admin/discount/generate', {
        method: 'POST',
      });
      const response = await POST(request);
      const data = await response.json();

      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
    });

    it('should handle exceptions', async () => {
      (DiscountService.generateDiscountManually as jest.Mock).mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      const request = new NextRequest('http://localhost:3000/api/admin/discount/generate', {
        method: 'POST',
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INTERNAL_ERROR');
      expect(data.error.message).toBe('Failed to generate discount code');
    });
  });
});
