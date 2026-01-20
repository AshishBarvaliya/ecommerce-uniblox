import { products, orders } from '@/lib/store';
import { CartService } from './cart.service';
import { DiscountService } from './discount.service';
import type { CheckoutRequest, CheckoutResponse, ApiResponse, Order } from '@/types';
import { ErrorCode as EC } from '@/types';

// Checkout Service - handles checkout and order processing
export class CheckoutService {
  // Process checkout
  public static async processCheckout(
    request: CheckoutRequest
  ): Promise<ApiResponse<CheckoutResponse>> {
    try {
      // Validate request
      const validation = this.validateCheckoutRequest(request);
      if (!validation.success) {
        return {
          success: false,
          error: validation.error,
        };
      }

      // Get user's cart
      const cartResponse = CartService.getCart(request.userId);
      if (!cartResponse.success || !cartResponse.data) {
        return {
          success: false,
          error: {
            code: EC.CART_NOT_FOUND,
            message: 'Cart not found or empty',
          },
        };
      }

      const cart = cartResponse.data;

      // Validate cart is not empty
      if (!cart || !cart.items || cart.items.length === 0) {
        return {
          success: false,
          error: {
            code: EC.INVALID_REQUEST,
            message: `Cannot checkout with an empty cart. Cart has ${cart?.items?.length || 0} items.`,
          },
        };
      }

      // Validate all items exist
      for (const item of cart.items) {
        const product = products.get(item.productId);
        if (!product) {
          return {
            success: false,
            error: {
              code: EC.PRODUCT_NOT_FOUND,
              message: `Product ${item.productId} no longer exists`,
            },
          };
        }
      }

      // Validate and apply discount code if provided
      let discountAmount = 0;
      let finalTotal = cart.total;
      
      if (request.discountCode) {
        const discountValidation = DiscountService.validateDiscountCode(
          request.discountCode
        );
        if (!discountValidation.success) {
          return {
            success: false,
            error: discountValidation.error,
          };
        }

        const discount = discountValidation.data!;
        discountAmount = Math.round((cart.total * discount.percentage) / 100);
        finalTotal = cart.total - discountAmount;
      }

      // Process payment (simulated) - use final total after discount
      const paymentResult = await this.processPayment(finalTotal);
      if (!paymentResult.success) {
        return {
          success: false,
          error: {
            code: EC.CHECKOUT_FAILED,
            message: 'Payment processing failed',
          },
        };
      }

      // Create order
      const orderId = this.generateOrderId();
      const now = new Date();

      const order: Order = {
        id: orderId,
        userId: request.userId,
        items: [...cart.items],
        total: finalTotal,
        status: 'processing',
        paymentMethod: request.paymentMethod,
        transactionId: paymentResult.transactionId,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      };

      // Add discount info to order if discount was used
      if (request.discountCode && discountAmount > 0) {
        order.discountCode = request.discountCode;
        order.discountAmount = discountAmount;
        DiscountService.markDiscountAsUsed();
      }

      // Store order
      orders.set(orderId, order);

      // Generate new discount if eligible (checks orders.size after storing)
      const discountGenerationResult = DiscountService.generateDiscountIfEligible();
      const generatedDiscount = discountGenerationResult.success ? discountGenerationResult.data : null;

      const checkoutResponse: CheckoutResponse = {
        orderId,
        total: finalTotal,
        status: 'processing',
        createdAt: now.toISOString(),
      };

      if (discountAmount > 0) {
        checkoutResponse.discountAmount = discountAmount;
      }

      if (generatedDiscount && !generatedDiscount.isUsed) {
        checkoutResponse.generatedDiscountCode = generatedDiscount.code;
      }

      // Clear cart after successful checkout
      CartService.clearCart(request.userId);

      return {
        success: true,
        data: checkoutResponse,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: EC.INTERNAL_ERROR,
          message: 'Failed to process checkout',
        },
      };
    }
  }

  // Validate checkout request
  private static validateCheckoutRequest(
    request: CheckoutRequest
  ): ApiResponse<boolean> {
    if (!request.userId || typeof request.userId !== 'string') {
      return {
        success: false,
        error: {
          code: EC.INVALID_REQUEST,
          message: 'Invalid userId',
        },
      };
    }

    if (!request.paymentMethod) {
      return {
        success: false,
        error: {
          code: EC.INVALID_REQUEST,
          message: 'Payment method is required',
        },
      };
    }

    const validPaymentTypes = ['card', 'paypal', 'apple_pay'];
    if (!validPaymentTypes.includes(request.paymentMethod.type)) {
      return {
        success: false,
        error: {
          code: EC.INVALID_REQUEST,
          message: `Invalid payment method type. Must be one of: ${validPaymentTypes.join(', ')}`,
        },
      };
    }

    return {
      success: true,
      data: true,
    };
  }

  // Simulate payment processing
  private static async processPayment(amount: number): Promise<{
    success: boolean;
    transactionId?: string;
  }> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const success = Math.random() > 0.05;

    if (success) {
      return {
        success: true,
        transactionId: `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      };
    }

    return {
      success: false,
    };
  }

  // Generate unique order ID
  private static generateOrderId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9).toUpperCase();
    return `ORD-${timestamp}-${random}`;
  }
}
