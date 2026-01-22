import { GET } from '@/app/api/discount/route';
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

describe('/api/discount', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('should return current discount successfully', async () => {
      const mockDiscount = {
        code: 'DISCOUNT10',
        percentage: 10,
        isUsed: false,
        createdAt: '2024-01-01',
        generatedAtOrder: 5,
      };

      (DiscountService.getCurrentDiscount as jest.Mock).mockReturnValue(mockDiscount);

      const request = new NextRequest('http://localhost:3000/api/discount');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockDiscount);
      expect(DiscountService.getCurrentDiscount).toHaveBeenCalledTimes(1);
    });

    it('should return null when no discount is available', async () => {
      (DiscountService.getCurrentDiscount as jest.Mock).mockReturnValue(null);

      const request = new NextRequest('http://localhost:3000/api/discount');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toBeNull();
    });

    it('should handle exceptions', async () => {
      (DiscountService.getCurrentDiscount as jest.Mock).mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      const request = new NextRequest('http://localhost:3000/api/discount');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INTERNAL_ERROR');
      expect(data.error.message).toBe('Failed to get discount code');
    });
  });
});
