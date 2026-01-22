import { renderHook, waitFor, act } from '@testing-library/react';
import { useCart } from '@/hooks/useCart';

// Mock fetch globally
global.fetch = jest.fn();

describe('useCart', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    (global.fetch as jest.Mock).mockClear();
  });

  it('should initialize with loading state', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({ success: true, data: { items: [], total: 0, itemCount: 0 } }),
    });

    const { result } = renderHook(() => useCart());

    expect(result.current.loading).toBe(true);
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it('should fetch cart on mount', async () => {
    const mockCart = {
      id: 'cart-1',
      userId: 'user-1',
      items: [],
      total: 0,
      itemCount: 0,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({ success: true, data: mockCart }),
    });

    const { result } = renderHook(() => useCart());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/api/cart?userId='));
    expect(result.current.cart).toEqual(mockCart);
  });

  it('should add item to cart', async () => {
    const initialCart = {
      id: 'cart-1',
      userId: 'user-1',
      items: [],
      total: 0,
      itemCount: 0,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    };

    const updatedCart = {
      ...initialCart,
      items: [{ productId: '1', quantity: 1, addedAt: '2024-01-01' }],
      total: 100,
      itemCount: 1,
    };

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        json: async () => ({ success: true, data: initialCart }),
      })
      .mockResolvedValueOnce({
        json: async () => ({ success: true, data: updatedCart }),
      });

    const { result } = renderHook(() => useCart());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      const success = await result.current.addToCart('1', 1);
      expect(success).toBe(true);
    });

    await waitFor(() => {
      expect(result.current.cart?.items).toHaveLength(1);
    });

    expect(result.current.itemCount).toBe(1);
    expect(result.current.total).toBe(100);
  });

  it('should remove item from cart', async () => {
    const cartWithItem = {
      id: 'cart-1',
      userId: 'user-1',
      items: [{ productId: '1', quantity: 1, addedAt: '2024-01-01' }],
      total: 100,
      itemCount: 1,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    };

    const emptyCart = {
      ...cartWithItem,
      items: [],
      total: 0,
      itemCount: 0,
    };

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        json: async () => ({ success: true, data: cartWithItem }),
      })
      .mockResolvedValueOnce({
        json: async () => ({ success: true, data: emptyCart }),
      });

    const { result } = renderHook(() => useCart());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      const success = await result.current.removeFromCart('1');
      expect(success).toBe(true);
    });

    await waitFor(() => {
      expect(result.current.cart?.items).toHaveLength(0);
    });
  });

  it('should update item quantity', async () => {
    const initialCart = {
      id: 'cart-1',
      userId: 'user-1',
      items: [{ productId: '1', quantity: 1, addedAt: '2024-01-01' }],
      total: 100,
      itemCount: 1,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    };

    const updatedCart = {
      ...initialCart,
      items: [{ productId: '1', quantity: 3, addedAt: '2024-01-01' }],
      total: 300,
      itemCount: 3,
    };

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        json: async () => ({ success: true, data: initialCart }),
      })
      .mockResolvedValueOnce({
        json: async () => ({ success: true, data: updatedCart }),
      });

    const { result } = renderHook(() => useCart());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      const success = await result.current.updateQuantity('1', 3);
      expect(success).toBe(true);
    });

    await waitFor(() => {
      expect(result.current.cart?.items[0].quantity).toBe(3);
    });
  });

  it('should handle checkout successfully', async () => {
    const cartWithItem = {
      id: 'cart-1',
      userId: 'user-1',
      items: [{ productId: '1', quantity: 1, addedAt: '2024-01-01' }],
      total: 100,
      itemCount: 1,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    };

    const checkoutResponse = {
      orderId: 'ORD-1',
      total: 100,
      status: 'processing',
      createdAt: '2024-01-01',
    };

    const emptyCart = {
      ...cartWithItem,
      items: [],
      total: 0,
      itemCount: 0,
    };

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        json: async () => ({ success: true, data: cartWithItem }),
      })
      .mockResolvedValueOnce({
        json: async () => ({ success: true, data: cartWithItem }),
      })
      .mockResolvedValueOnce({
        json: async () => ({ success: true, data: checkoutResponse }),
      })
      .mockResolvedValueOnce({
        json: async () => ({ success: true, data: emptyCart }),
      });

    const { result } = renderHook(() => useCart());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      const checkoutResult = await result.current.checkout({ type: 'card' });
      expect(checkoutResult.success).toBe(true);
      expect(checkoutResult.data).toEqual(checkoutResponse);
    });
  });

  it('should handle checkout with empty cart', async () => {
    const emptyCart = {
      id: 'cart-1',
      userId: 'user-1',
      items: [],
      total: 0,
      itemCount: 0,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    };

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        json: async () => ({ success: true, data: emptyCart }),
      })
      .mockResolvedValueOnce({
        json: async () => ({ success: true, data: emptyCart }),
      });

    const { result } = renderHook(() => useCart());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      const checkoutResult = await result.current.checkout({ type: 'card' });
      expect(checkoutResult.success).toBe(false);
      expect(checkoutResult.error).toContain('Cart is empty');
    });
  });

  it('should handle errors when fetching cart fails', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useCart());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Failed to fetch cart');
  });

  it('should handle errors when adding to cart fails', async () => {
    const initialCart = {
      id: 'cart-1',
      userId: 'user-1',
      items: [],
      total: 0,
      itemCount: 0,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    };

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        json: async () => ({ success: true, data: initialCart }),
      })
      .mockResolvedValueOnce({
        json: async () => ({ success: false, error: { message: 'Product not found' } }),
      });

    const { result } = renderHook(() => useCart());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      const success = await result.current.addToCart('999', 1);
      expect(success).toBe(false);
    });

    expect(result.current.error).toBe('Product not found');
  });

  it('should generate and store userId in localStorage', async () => {
    localStorage.clear();
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({ success: true, data: { items: [], total: 0, itemCount: 0 } }),
    });

    renderHook(() => useCart());

    await waitFor(() => {
      expect(localStorage.getItem('ecommerce_user_id')).toBeTruthy();
    });
  });

  it('should use existing userId from localStorage', async () => {
    localStorage.setItem('ecommerce_user_id', 'existing-user-123');
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({ success: true, data: { items: [], total: 0, itemCount: 0 } }),
    });

    renderHook(() => useCart());

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('existing-user-123'));
    });
  });
});
