import { GET } from '@/app/api/products/[id]/route';
import { ProductService } from '@/lib/services/product.service';
import { NextRequest } from 'next/server';

// Mock the services
jest.mock('@/lib/services/product.service');
jest.mock('@/lib/api/utils', () => ({
  handleServiceResponse: jest.fn((response) => {
    if (response.success) {
      return Response.json(response, { status: 200 });
    }
    return Response.json(response, { status: 404 });
  }),
}));

describe('/api/products/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('should return a product by ID successfully', async () => {
      const mockProduct = {
        id: '1',
        name: 'Test Product',
        description: 'Test Description',
        price: 100,
        category: 'test',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };

      (ProductService.getProductById as jest.Mock).mockReturnValue({
        success: true,
        data: mockProduct,
      });

      const request = new NextRequest('http://localhost:3000/api/products/1');
      const params = Promise.resolve({ id: '1' });
      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockProduct);
      expect(ProductService.getProductById).toHaveBeenCalledWith('1');
    });

    it('should return 404 when product not found', async () => {
      (ProductService.getProductById as jest.Mock).mockReturnValue({
        success: false,
        error: {
          code: 'PRODUCT_NOT_FOUND',
          message: 'Product with ID 999 not found',
        },
      });

      const request = new NextRequest('http://localhost:3000/api/products/999');
      const params = Promise.resolve({ id: '999' });
      const response = await GET(request, { params });
      const data = await response.json();

      expect(data.success).toBe(false);
      expect(data.error.code).toBe('PRODUCT_NOT_FOUND');
    });

    it('should handle exceptions', async () => {
      (ProductService.getProductById as jest.Mock).mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      const request = new NextRequest('http://localhost:3000/api/products/1');
      const params = Promise.resolve({ id: '1' });
      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INTERNAL_ERROR');
      expect(data.error.message).toBe('Failed to fetch product');
    });
  });
});
