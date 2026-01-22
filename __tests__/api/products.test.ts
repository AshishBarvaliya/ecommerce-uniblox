import { GET } from '@/app/api/products/route';
import { ProductService } from '@/lib/services/product.service';
import { NextRequest } from 'next/server';

// Mock the services
jest.mock('@/lib/services/product.service');
jest.mock('@/lib/api/utils', () => ({
  handleServiceResponse: jest.fn((response) => {
    if (response.success) {
      return Response.json(response, { status: 200 });
    }
    return Response.json(response, { status: 400 });
  }),
}));

describe('/api/products', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('should return all products successfully', async () => {
      const mockProducts = [
        {
          id: '1',
          name: 'Test Product',
          description: 'Test Description',
          price: 100,
          category: 'test',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        },
      ];

      (ProductService.getAllProducts as jest.Mock).mockReturnValue({
        success: true,
        data: mockProducts,
      });

      const request = new NextRequest('http://localhost:3000/api/products');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockProducts);
      expect(ProductService.getAllProducts).toHaveBeenCalledTimes(1);
    });

    it('should handle service errors', async () => {
      (ProductService.getAllProducts as jest.Mock).mockReturnValue({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch products',
        },
      });

      const request = new NextRequest('http://localhost:3000/api/products');
      const response = await GET(request);
      const data = await response.json();

      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
    });

    it('should handle exceptions', async () => {
      (ProductService.getAllProducts as jest.Mock).mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      const request = new NextRequest('http://localhost:3000/api/products');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INTERNAL_ERROR');
      expect(data.error.message).toBe('Failed to fetch products');
    });
  });
});
