import { POST } from '@/app/api/checkout/route';
import { CheckoutService } from '@/lib/services/checkout.service';
import { NextRequest } from 'next/server';

// Mock the services
jest.mock('@/lib/services/checkout.service');
jest.mock('@/lib/api/utils', () => ({
  handleServiceResponse: jest.fn((response, status = 200) => {
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

describe('/api/checkout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST', () => {
    it('should process checkout successfully', async () => {
      const mockCheckoutResponse = {
        orderId: 'ORD-123',
        total: 100,
        status: 'processing',
        createdAt: '2024-01-01',
      };

      const { parseJsonBody } = require('@/lib/api/utils');
      parseJsonBody.mockResolvedValue({
        success: true,
        data: {
          userId: 'user1',
          paymentMethod: { type: 'card' },
        },
      });

      (CheckoutService.processCheckout as jest.Mock).mockResolvedValue({
        success: true,
        data: mockCheckoutResponse,
      });

      const request = new NextRequest('http://localhost:3000/api/checkout', {
        method: 'POST',
        body: JSON.stringify({
          userId: 'user1',
          paymentMethod: { type: 'card' },
        }),
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockCheckoutResponse);
      expect(CheckoutService.processCheckout).toHaveBeenCalledWith({
        userId: 'user1',
        paymentMethod: { type: 'card' },
      });
    });

    it('should process checkout with discount code', async () => {
      const mockCheckoutResponse = {
        orderId: 'ORD-123',
        total: 90,
        discountAmount: 10,
        status: 'processing',
        createdAt: '2024-01-01',
      };

      const { parseJsonBody } = require('@/lib/api/utils');
      parseJsonBody.mockResolvedValue({
        success: true,
        data: {
          userId: 'user1',
          paymentMethod: { type: 'card' },
          discountCode: 'DISCOUNT10',
        },
      });

      (CheckoutService.processCheckout as jest.Mock).mockResolvedValue({
        success: true,
        data: mockCheckoutResponse,
      });

      const request = new NextRequest('http://localhost:3000/api/checkout', {
        method: 'POST',
        body: JSON.stringify({
          userId: 'user1',
          paymentMethod: { type: 'card' },
          discountCode: 'DISCOUNT10',
        }),
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(CheckoutService.processCheckout).toHaveBeenCalledWith({
        userId: 'user1',
        paymentMethod: { type: 'card' },
        discountCode: 'DISCOUNT10',
      });
    });

    it('should return 400 when JSON is invalid', async () => {
      const { parseJsonBody } = require('@/lib/api/utils');
      parseJsonBody.mockResolvedValue({
        success: false,
        error: 'Invalid JSON in request body',
      });

      const request = new NextRequest('http://localhost:3000/api/checkout', {
        method: 'POST',
        body: 'invalid json',
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should handle checkout failures', async () => {
      const { parseJsonBody } = require('@/lib/api/utils');
      parseJsonBody.mockResolvedValue({
        success: true,
        data: {
          userId: 'user1',
          paymentMethod: { type: 'card' },
        },
      });

      (CheckoutService.processCheckout as jest.Mock).mockResolvedValue({
        success: false,
        error: {
          code: 'CHECKOUT_FAILED',
          message: 'Payment processing failed',
        },
      });

      const request = new NextRequest('http://localhost:3000/api/checkout', {
        method: 'POST',
        body: JSON.stringify({
          userId: 'user1',
          paymentMethod: { type: 'card' },
        }),
      });
      const response = await POST(request);
      const data = await response.json();

      expect(data.success).toBe(false);
      expect(data.error.code).toBe('CHECKOUT_FAILED');
    });

    it('should handle exceptions', async () => {
      const { parseJsonBody } = require('@/lib/api/utils');
      parseJsonBody.mockResolvedValue({
        success: true,
        data: {
          userId: 'user1',
          paymentMethod: { type: 'card' },
        },
      });

      (CheckoutService.processCheckout as jest.Mock).mockRejectedValue(
        new Error('Unexpected error')
      );

      const request = new NextRequest('http://localhost:3000/api/checkout', {
        method: 'POST',
        body: JSON.stringify({
          userId: 'user1',
          paymentMethod: { type: 'card' },
        }),
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INTERNAL_ERROR');
    });
  });
});
