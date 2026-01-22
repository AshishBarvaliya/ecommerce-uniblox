import { GET } from '@/app/api/admin/orders/route';
import { orders } from '@/lib/store';
import { NextRequest } from 'next/server';

// Mock the store
jest.mock('@/lib/store', () => ({
  orders: new Map(),
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

describe('/api/admin/orders', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear orders before each test
    const { orders } = require('@/lib/store');
    orders.clear();
  });

  describe('GET', () => {
    it('should return all orders with statistics successfully', async () => {
      const { orders } = require('@/lib/store');
      
      const mockOrder1 = {
        id: 'ORD-1',
        userId: 'user1',
        items: [{ productId: '1', quantity: 2, addedAt: '2024-01-01' }],
        total: 200,
        status: 'completed',
        paymentMethod: { type: 'card' },
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };

      const mockOrder2 = {
        id: 'ORD-2',
        userId: 'user2',
        items: [{ productId: '2', quantity: 1, addedAt: '2024-01-01' }],
        total: 100,
        discountCode: 'DISCOUNT10',
        discountAmount: 10,
        status: 'completed',
        paymentMethod: { type: 'paypal' },
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };

      orders.set('ORD-1', mockOrder1);
      orders.set('ORD-2', mockOrder2);

      const request = new NextRequest('http://localhost:3000/api/admin/orders');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.orders).toHaveLength(2);
      expect(data.data.statistics.totalOrders).toBe(2);
      expect(data.data.statistics.totalItemsPurchased).toBe(3); // 2 + 1
      expect(data.data.statistics.totalPurchaseAmount).toBe(300); // 200 + 100
      expect(data.data.statistics.discountCodesUsed).toContain('DISCOUNT10');
      expect(data.data.statistics.totalDiscountAmount).toBe(10);
    });

    it('should return empty orders array when no orders exist', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/orders');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.orders).toEqual([]);
      expect(data.data.statistics.totalOrders).toBe(0);
      expect(data.data.statistics.totalItemsPurchased).toBe(0);
      expect(data.data.statistics.totalPurchaseAmount).toBe(0);
    });

    it('should handle orders with multiple items', async () => {
      const { orders } = require('@/lib/store');
      
      const mockOrder = {
        id: 'ORD-1',
        userId: 'user1',
        items: [
          { productId: '1', quantity: 2, addedAt: '2024-01-01' },
          { productId: '2', quantity: 3, addedAt: '2024-01-01' },
        ],
        total: 500,
        status: 'completed',
        paymentMethod: { type: 'card' },
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };

      orders.set('ORD-1', mockOrder);

      const request = new NextRequest('http://localhost:3000/api/admin/orders');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.statistics.totalItemsPurchased).toBe(5); // 2 + 3
    });

    it('should handle exceptions', async () => {
      // Mock orders to throw an error
      const { orders } = require('@/lib/store');
      const originalValues = orders.values;
      orders.values = jest.fn(() => {
        throw new Error('Unexpected error');
      });

      const request = new NextRequest('http://localhost:3000/api/admin/orders');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INTERNAL_ERROR');
      expect(data.error.message).toBe('Failed to get orders');

      // Restore original
      orders.values = originalValues;
    });
  });
});
