import { GET, POST } from '@/app/api/cart/route';
import { CartService } from '@/lib/services/cart.service';
import { NextRequest } from 'next/server';

// Mock the services
jest.mock('@/lib/services/cart.service');
jest.mock('@/lib/api/utils', () => ({
  handleServiceResponse: jest.fn((response) => {
    if (response.success) {
      return Response.json(response, { status: 200 });
    }
    const statusMap: Record<string, number> = {
      CART_NOT_FOUND: 404,
      INVALID_REQUEST: 400,
    };
    const status = statusMap[response.error?.code] || 400;
    return Response.json(response, { status });
  }),
  parseJsonBody: jest.fn(),
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

describe('/api/cart', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('should return cart successfully with userId', async () => {
      const mockCart = {
        id: 'cart-user1',
        userId: 'user1',
        items: [],
        total: 0,
        itemCount: 0,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };

      (CartService.getCart as jest.Mock).mockReturnValue({
        success: true,
        data: mockCart,
      });

      const request = new NextRequest('http://localhost:3000/api/cart?userId=user1');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockCart);
      expect(CartService.getCart).toHaveBeenCalledWith('user1');
    });

    it('should return 400 when userId is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/cart');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INVALID_REQUEST');
      expect(CartService.getCart).not.toHaveBeenCalled();
    });

    it('should handle exceptions', async () => {
      (CartService.getCart as jest.Mock).mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      const request = new NextRequest('http://localhost:3000/api/cart?userId=user1');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('POST', () => {
    it('should add item to cart successfully', async () => {
      const mockCart = {
        id: 'cart-user1',
        userId: 'user1',
        items: [{ productId: '1', quantity: 1, addedAt: '2024-01-01' }],
        total: 100,
        itemCount: 1,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };

      const { parseJsonBody } = require('@/lib/api/utils');
      parseJsonBody.mockResolvedValue({
        success: true,
        data: { userId: 'user1', productId: '1', quantity: 1 },
      });

      (CartService.addToCart as jest.Mock).mockReturnValue({
        success: true,
        data: mockCart,
      });

      const request = new NextRequest('http://localhost:3000/api/cart', {
        method: 'POST',
        body: JSON.stringify({ userId: 'user1', productId: '1', quantity: 1 }),
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(CartService.addToCart).toHaveBeenCalledWith('user1', '1', 1);
    });

    it('should return 400 when userId is missing', async () => {
      const { parseJsonBody } = require('@/lib/api/utils');
      parseJsonBody.mockResolvedValue({
        success: true,
        data: { productId: '1' },
      });

      const request = new NextRequest('http://localhost:3000/api/cart', {
        method: 'POST',
        body: JSON.stringify({ productId: '1' }),
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INVALID_REQUEST');
    });

    it('should return 400 when productId is missing', async () => {
      const { parseJsonBody } = require('@/lib/api/utils');
      parseJsonBody.mockResolvedValue({
        success: true,
        data: { userId: 'user1' },
      });

      const request = new NextRequest('http://localhost:3000/api/cart', {
        method: 'POST',
        body: JSON.stringify({ userId: 'user1' }),
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should return 400 when JSON is invalid', async () => {
      const { parseJsonBody } = require('@/lib/api/utils');
      parseJsonBody.mockResolvedValue({
        success: false,
        error: 'Invalid JSON in request body',
      });

      const request = new NextRequest('http://localhost:3000/api/cart', {
        method: 'POST',
        body: 'invalid json',
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should handle exceptions', async () => {
      const { parseJsonBody } = require('@/lib/api/utils');
      parseJsonBody.mockResolvedValue({
        success: true,
        data: { userId: 'user1', productId: '1', quantity: 1 },
      });

      (CartService.addToCart as jest.Mock).mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      const request = new NextRequest('http://localhost:3000/api/cart', {
        method: 'POST',
        body: JSON.stringify({ userId: 'user1', productId: '1' }),
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INTERNAL_ERROR');
    });
  });
});
