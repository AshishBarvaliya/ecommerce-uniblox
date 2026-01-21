import {
  getCurrentDiscount,
  setCurrentDiscount,
  orders,
} from '@/lib/store';
import type { Discount, ApiResponse } from '@/types';
import { ErrorCode as EC } from '@/types';

// Discount Service - handles discount code generation and validation
export class DiscountService {
  // Configuration: Every Nth order gets a discount code
  private static readonly N = 3; 

  public static generateDiscountIfEligible(): ApiResponse<Discount | null> {
    try {
      // Count total orders from the orders Map
      const orderCount = orders.size;
      const currentDiscount = getCurrentDiscount();

      // Check if order count is a multiple of N (and not zero)
      if (orderCount === 0 || orderCount % this.N !== 0) {
        return {
          success: true,
          data: currentDiscount,
        };
      }

      // Generate new discount code (replaces any existing discount)
      const code = this.generateDiscountCode();
      const now = new Date().toISOString();

      const discount: Discount = {
        code,
        percentage: 10,
        isUsed: false,
        createdAt: now,
      };

      setCurrentDiscount(discount);

      return {
        success: true,
        data: discount,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: EC.INTERNAL_ERROR,
          message: 'Failed to generate discount code',
        },
      };
    }
  }

  /**
   * Validate a discount code
   */
  public static validateDiscountCode(code: string): ApiResponse<Discount> {
    try {
      const currentDiscount = getCurrentDiscount();

      if (!currentDiscount) {
        return {
          success: false,
          error: {
            code: EC.DISCOUNT_NOT_FOUND,
            message: 'No discount code available',
          },
        };
      }

      if (currentDiscount.code !== code) {
        return {
          success: false,
          error: {
            code: EC.INVALID_DISCOUNT_CODE,
            message: 'Invalid discount code',
          },
        };
      }

      if (currentDiscount.isUsed) {
        return {
          success: false,
          error: {
            code: EC.DISCOUNT_ALREADY_USED,
            message: 'Discount code has already been used',
          },
        };
      }

      return {
        success: true,
        data: currentDiscount,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: EC.INTERNAL_ERROR,
          message: 'Failed to validate discount code',
        },
      };
    }
  }

  /**
   * Mark discount as used
   */
  public static markDiscountAsUsed(): void {
    const currentDiscount = getCurrentDiscount();
    if (currentDiscount && !currentDiscount.isUsed) {
      currentDiscount.isUsed = true;
      currentDiscount.usedAt = new Date().toISOString();
      setCurrentDiscount(currentDiscount);
    }
  }

  /**
   * Get discount statistics
   */
  public static getStats(): ApiResponse<{
    currentDiscount: Discount | null;
    orderCount: number;
    n: number;
    nextDiscountAt: number | null;
    totalDiscountsUsed: number;
    totalOrders: number;
    ordersWithDiscount: number;
  }> {
    try {
      const currentDiscount = getCurrentDiscount();
      
      // Count total orders from orders Map
      const orderCount = orders.size;

      // Count how many orders used discount codes
      let totalDiscountsUsed = 0;
      orders.forEach((order) => {
        if (order.discountCode) {
          totalDiscountsUsed++;
        }
      });

      // Calculate when next discount will be available
      const nextDiscountAt =
        orderCount % this.N === 0
          ? null
          : this.N - (orderCount % this.N);

      return {
        success: true,
        data: {
          currentDiscount,
          orderCount,
          n: this.N,
          nextDiscountAt,
          totalDiscountsUsed,
          totalOrders: orderCount,
          ordersWithDiscount: totalDiscountsUsed,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: EC.INTERNAL_ERROR,
          message: 'Failed to get discount stats',
        },
      };
    }
  }

  /**
   * Get current discount (if exists and unused)
   */
  public static getCurrentDiscount(): Discount | null {
    const currentDiscount = getCurrentDiscount();
    return currentDiscount && !currentDiscount.isUsed ? currentDiscount : null;
  }

  /**
   * Manually generate a discount code (admin function)
   */
  public static generateDiscountManually(): ApiResponse<Discount> {
    try {
      // Generate new discount code (replaces any existing discount)
      const code = this.generateDiscountCode();
      const now = new Date().toISOString();

      const discount: Discount = {
        code,
        percentage: 10,
        isUsed: false,
        createdAt: now,
      };

      setCurrentDiscount(discount);

      return {
        success: true,
        data: discount,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: EC.INTERNAL_ERROR,
          message: 'Failed to generate discount code',
        },
      };
    }
  }

  /**
   * Generate a random discount code
   */
  private static generateDiscountCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }
}
