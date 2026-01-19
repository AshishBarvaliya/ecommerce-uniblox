import { products } from '@/lib/store';
import type { Product, ApiResponse, ErrorCode } from '@/types';
import { ErrorCode as EC } from '@/types';

// Product Service - handles all product-related business logic
export class ProductService {
  // Get all products
  public static getAllProducts(): ApiResponse<Product[]> {
    try {
      const allProducts = Array.from(products.values());
      return {
        success: true,
        data: allProducts,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: EC.INTERNAL_ERROR,
          message: 'Failed to fetch products',
        },
      };
    }
  }

  // Get product by ID
  public static getProductById(id: string): ApiResponse<Product> {
    try {
      const product = products.get(id);
      if (!product) {
        return {
          success: false,
          error: {
            code: EC.PRODUCT_NOT_FOUND,
            message: `Product with ID ${id} not found`,
          },
        };
      }

      return {
        success: true,
        data: product,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: EC.INTERNAL_ERROR,
          message: 'Failed to fetch product',
        },
      };
    }
  }

  // Validate product availability
  public static validateProductAvailability(
    productId: string,
    quantity: number
  ): ApiResponse<boolean> {
    const product = products.get(productId);
    if (!product) {
      return {
        success: false,
        error: {
          code: EC.PRODUCT_NOT_FOUND,
          message: `Product with ID ${productId} not found`,
        },
      };
    }

    return {
      success: true,
      data: true,
    };
  }
}
