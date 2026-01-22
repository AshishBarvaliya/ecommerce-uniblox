import { POST } from '@/app/api/admin/reset/route';
import { orders, carts, setCurrentDiscount } from '@/lib/store';
import { NextRequest } from 'next/server';

// Mock the store
jest.mock('@/lib/store', () => ({
  orders: new Map(),
  carts: new Map(),
  setCurrentDiscount: jest.fn(),
}));

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

describe('/api/admin/reset', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const { orders, carts } = require('@/lib/store');
    orders.clear();
    carts.clear();
  });

  describe('POST', () => {
    it('should reset store successfully', async () => {
      const { orders, carts, setCurrentDiscount } = require('@/lib/store');
      
      // Add some data
      orders.set('ORD-1', { id: 'ORD-1', userId: 'user1' });
      carts.set('user1', { id: 'cart-1', userId: 'user1', items: [] });

      const request = new NextRequest('http://localhost:3000/api/admin/reset', {
        method: 'POST',
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.message).toContain('Store reset successfully');
      expect(orders.size).toBe(0);
      expect(carts.size).toBe(0);
      expect(setCurrentDiscount).toHaveBeenCalledWith(null);
    });

    it('should clear all orders', async () => {
      const { orders } = require('@/lib/store');
      
      orders.set('ORD-1', { id: 'ORD-1' });
      orders.set('ORD-2', { id: 'ORD-2' });

      const request = new NextRequest('http://localhost:3000/api/admin/reset', {
        method: 'POST',
      });
      await POST(request);

      expect(orders.size).toBe(0);
    });

    it('should clear all carts', async () => {
      const { carts } = require('@/lib/store');
      
      carts.set('user1', { id: 'cart-1' });
      carts.set('user2', { id: 'cart-2' });

      const request = new NextRequest('http://localhost:3000/api/admin/reset', {
        method: 'POST',
      });
      await POST(request);

      expect(carts.size).toBe(0);
    });

    it('should reset discount to null', async () => {
      const { setCurrentDiscount } = require('@/lib/store');

      const request = new NextRequest('http://localhost:3000/api/admin/reset', {
        method: 'POST',
      });
      await POST(request);

      expect(setCurrentDiscount).toHaveBeenCalledWith(null);
    });

    it('should handle exceptions', async () => {
      const { setCurrentDiscount } = require('@/lib/store');
      setCurrentDiscount.mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      const request = new NextRequest('http://localhost:3000/api/admin/reset', {
        method: 'POST',
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INTERNAL_ERROR');
      expect(data.error.message).toBe('Failed to reset store');
    });
  });
});
