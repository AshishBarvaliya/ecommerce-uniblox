import { carts, products } from '@/lib/store';
import { ProductService } from './product.service';
import type { Cart, CartItem, ApiResponse, ErrorCode } from '@/types';
import { ErrorCode as EC } from '@/types';

// Cart Service - handles all cart-related business logic
export class CartService {
  // Get user's cart
  public static getCart(userId: string): ApiResponse<Cart> {
    try {
      let cart = carts.get(userId);
      if (!cart) {
        const now = new Date().toISOString();
        cart = {
          id: `cart-${userId}`,
          userId,
          items: [],
          total: 0,
          itemCount: 0,
          createdAt: now,
          updatedAt: now,
        };
        carts.set(userId, cart);
      }
      this.recalculateCartTotal(cart);
      return {
        success: true,
        data: cart,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: EC.INTERNAL_ERROR,
          message: 'Failed to fetch cart',
        },
      };
    }
  }

  // Add item to cart
  public static addToCart(
    userId: string,
    productId: string,
    quantity: number = 1
  ): ApiResponse<Cart> {
    try {
      // Validate quantity
      if (quantity <= 0 || !Number.isInteger(quantity)) {
        return {
          success: false,
          error: {
            code: EC.INVALID_QUANTITY,
            message: 'Quantity must be a positive integer',
          },
        };
      }

      // Validate product availability
      const availabilityCheck = ProductService.validateProductAvailability(
        productId,
        quantity
      );
      if (!availabilityCheck.success) {
        return {
          success: false,
          error: availabilityCheck.error,
        };
      }

      // Get or create cart
      let cart = carts.get(userId);
      if (!cart) {
        const now = new Date().toISOString();
        cart = {
          id: `cart-${userId}`,
          userId,
          items: [],
          total: 0,
          itemCount: 0,
          createdAt: now,
          updatedAt: now,
        };
        carts.set(userId, cart);
      }

      const now = new Date().toISOString();

      // Check if item already exists in cart
      const existingItemIndex = cart.items.findIndex(
        (item) => item.productId === productId
      );

      if (existingItemIndex >= 0) {
        cart.items[existingItemIndex].quantity += quantity;
        cart.items[existingItemIndex].addedAt = now;
      } else {
        cart.items.push({
          productId,
          quantity,
          addedAt: now,
        });
      }

      this.recalculateCartTotal(cart);

      cart.updatedAt = new Date().toISOString();
      carts.set(userId, cart);

      return {
        success: true,
        data: cart,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: EC.INTERNAL_ERROR,
          message: 'Failed to add item to cart',
        },
      };
    }
  }

  // Remove item from cart
  public static removeFromCart(
    userId: string,
    productId: string
  ): ApiResponse<Cart> {
    try {
      const cart = carts.get(userId);
      if (!cart) {
        return {
          success: false,
          error: {
            code: EC.CART_NOT_FOUND,
            message: 'Cart not found',
          },
        };
      }

      const itemIndex = cart.items.findIndex(
        (item) => item.productId === productId
      );

      if (itemIndex === -1) {
        return {
          success: false,
          error: {
            code: EC.CART_ITEM_NOT_FOUND,
            message: `Item with product ID ${productId} not found in cart`,
          },
        };
      }

      cart.items.splice(itemIndex, 1);
      this.recalculateCartTotal(cart);
      
      cart.updatedAt = new Date().toISOString();
      carts.set(userId, cart);

      return {
        success: true,
        data: cart,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: EC.INTERNAL_ERROR,
          message: 'Failed to remove item from cart',
        },
      };
    }
  }

  // Update item quantity in cart
  public static updateCartItemQuantity(
    userId: string,
    productId: string,
    quantity: number
  ): ApiResponse<Cart> {
    try {
      if (quantity <= 0 || !Number.isInteger(quantity)) {
        return {
          success: false,
          error: {
            code: EC.INVALID_QUANTITY,
            message: 'Quantity must be a positive integer',
          },
        };
      }

      const cart = carts.get(userId);
      if (!cart) {
        return {
          success: false,
          error: {
            code: EC.CART_NOT_FOUND,
            message: 'Cart not found',
          },
        };
      }

      const item = cart.items.find((item) => item.productId === productId);
      if (!item) {
        return {
          success: false,
          error: {
            code: EC.CART_ITEM_NOT_FOUND,
            message: `Item with product ID ${productId} not found in cart`,
          },
        };
      }

      // Validate product availability
      const availabilityCheck = ProductService.validateProductAvailability(
        productId,
        quantity
      );
      if (!availabilityCheck.success) {
        return {
          success: false,
          error: availabilityCheck.error,
        };
      }

      item.quantity = quantity;
      this.recalculateCartTotal(cart);

      cart.updatedAt = new Date().toISOString();
      carts.set(userId, cart);

      return {
        success: true,
        data: cart,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: EC.INTERNAL_ERROR,
          message: 'Failed to update cart item',
        },
      };
    }
  }

  // Clear cart
  public static clearCart(userId: string): ApiResponse<Cart> {
    try {
      const cart = carts.get(userId);
      if (!cart) {
        return {
          success: false,
          error: {
            code: EC.CART_NOT_FOUND,
            message: 'Cart not found',
          },
        };
      }

      cart.items = [];
      this.recalculateCartTotal(cart);
      cart.updatedAt = new Date().toISOString();
      carts.set(userId, cart);

      return {
        success: true,
        data: cart,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: EC.INTERNAL_ERROR,
          message: 'Failed to clear cart',
        },
      };
    }
  }

  // Recalculate cart totals
  private static recalculateCartTotal(cart: Cart): void {
    let total = 0;
    let itemCount = 0;

    for (const item of cart.items) {
      const product = products.get(item.productId);
      if (product) {
        total += product.price * item.quantity;
        itemCount += item.quantity;
      }
    }

    cart.total = Math.round(total);
    cart.itemCount = itemCount;
  }
}
