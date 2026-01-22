import { DELETE } from '@/app/api/cart/remove/route';
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
      CART_ITEM_NOT_FOUND: 404,
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

describe('/api/cart/remove', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('DELETE', () => {
    it('should remove item from cart successfully', async () => {
      const mockCart = {
        id: 'cart-user1',
        userId: 'user1',
        items: [],
        total: 0,
        itemCount: 0,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };

      const { parseJsonBody } = require('@/lib/api/utils');
      parseJsonBody.mockResolvedValue({
        success: true,
        data: { userId: 'user1', productId: '1' },
      });

      (CartService.removeFromCart as jest.Mock).mockReturnValue({
        success: true,
        data: mockCart,
      });

      const request = new NextRequest('http://localhost:3000/api/cart/remove', {
        method: 'DELETE',
        body: JSON.stringify({ userId: 'user1', productId: '1' }),
      });
      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(CartService.removeFromCart).toHaveBeenCalledWith('user1', '1');
    });

    it('should return 400 when userId is missing', async () => {
      const { parseJsonBody } = require('@/lib/api/utils');
      parseJsonBody.mockResolvedValue({
        success: true,
        data: { productId: '1' },
      });

      const request = new NextRequest('http://localhost:3000/api/cart/remove', {
        method: 'DELETE',
        body: JSON.stringify({ productId: '1' }),
      });
      const response = await DELETE(request);
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

      const request = new NextRequest('http://localhost:3000/api/cart/remove', {
        method: 'DELETE',
        body: JSON.stringify({ userId: 'user1' }),
      });
      const response = await DELETE(request);
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

      const request = new NextRequest('http://localhost:3000/api/cart/remove', {
        method: 'DELETE',
        body: 'invalid json',
      });
      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should handle exceptions', async () => {
      const { parseJsonBody } = require('@/lib/api/utils');
      parseJsonBody.mockResolvedValue({
        success: true,
        data: { userId: 'user1', productId: '1' },
      });

      (CartService.removeFromCart as jest.Mock).mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      const request = new NextRequest('http://localhost:3000/api/cart/remove', {
        method: 'DELETE',
        body: JSON.stringify({ userId: 'user1', productId: '1' }),
      });
      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INTERNAL_ERROR');
    });
  });
});
