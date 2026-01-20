// Product types
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  createdAt: string;
  updatedAt: string;
}

// Cart item types
export interface CartItem {
  productId: string;
  quantity: number;
  addedAt: string;
}

// Cart types
export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

// Discount types
export interface Discount {
  code: string;
  percentage: 10;
  isUsed: boolean;
  createdAt: string;
  usedAt?: string;
}

// Checkout types
export interface CheckoutRequest {
  userId: string;
  paymentMethod: {
    type: 'card' | 'paypal' | 'apple_pay';
  };
  discountCode?: string;
}

export interface CheckoutResponse {
  orderId: string;
  total: number;
  discountAmount?: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
}

// Order types
export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  discountCode?: string;
  discountAmount?: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  paymentMethod: {
    type: 'card' | 'paypal' | 'apple_pay';
  };
  transactionId?: string;
  createdAt: string;
  updatedAt: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

// Error codes
export enum ErrorCode {
  PRODUCT_NOT_FOUND = 'PRODUCT_NOT_FOUND',
  PRODUCT_OUT_OF_STOCK = 'PRODUCT_OUT_OF_STOCK',
  CART_NOT_FOUND = 'CART_NOT_FOUND',
  CART_ITEM_NOT_FOUND = 'CART_ITEM_NOT_FOUND',
  INVALID_QUANTITY = 'INVALID_QUANTITY',
  INVALID_REQUEST = 'INVALID_REQUEST',
  CHECKOUT_FAILED = 'CHECKOUT_FAILED',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  DISCOUNT_NOT_FOUND = 'DISCOUNT_NOT_FOUND',
  DISCOUNT_ALREADY_USED = 'DISCOUNT_ALREADY_USED',
  INVALID_DISCOUNT_CODE = 'INVALID_DISCOUNT_CODE',
}
