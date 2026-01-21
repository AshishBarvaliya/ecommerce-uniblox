import { NextRequest } from 'next/server';
import { orders } from '@/lib/store';
import { handleServiceResponse, errorResponse } from '@/lib/api/utils';
import type { Order } from '@/types';

// GET /api/admin/orders - Get all orders with statistics
export async function GET(request: NextRequest) {
  try {
    // Convert Map to array
    const ordersArray = Array.from(orders.values());

    // Calculate statistics
    let totalItemsPurchased = 0;
    let totalPurchaseAmount = 0;
    const discountCodesUsed: string[] = [];
    let totalDiscountAmount = 0;

    ordersArray.forEach((order: Order) => {
      // Count items purchased (sum of all quantities)
      order.items.forEach((item) => {
        totalItemsPurchased += item.quantity;
      });

      // Sum total purchase amount
      totalPurchaseAmount += order.total;

      // Collect discount codes and sum discount amounts
      if (order.discountCode) {
        discountCodesUsed.push(order.discountCode);
        if (order.discountAmount) {
          totalDiscountAmount += order.discountAmount;
        }
      }
    });

    // Remove duplicate discount codes
    const uniqueDiscountCodes = Array.from(new Set(discountCodesUsed));

    const response = {
      success: true as const,
      data: {
        orders: ordersArray,
        statistics: {
          totalOrders: ordersArray.length,
          totalItemsPurchased,
          totalPurchaseAmount,
          discountCodesUsed: uniqueDiscountCodes,
          totalDiscountAmount,
        },
      },
    };

    return handleServiceResponse(response);
  } catch (error) {
    return errorResponse('INTERNAL_ERROR', 'Failed to get orders', 500);
  }
}
