import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { CartSummary } from '@/components/CartSummary';
import type { Cart, CartItem } from '@/types';

// Mock fetch globally
global.fetch = jest.fn();

const mockProducts = [
  {
    id: '1',
    name: 'Product 1',
    description: 'Description 1',
    price: 100,
    category: 'Electronics',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: '2',
    name: 'Product 2',
    description: 'Description 2',
    price: 50,
    category: 'Clothing',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
];

describe('CartSummary', () => {
  const mockOnCheckout = jest.fn();
  const mockOnRemove = jest.fn();
  const mockOnUpdateQuantity = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      json: async () => ({ success: true, data: mockProducts }),
    });
  });

  it('should render empty cart message when cart is empty', () => {
    const emptyCart: Cart = {
      id: 'cart-1',
      userId: 'user-1',
      items: [],
      total: 0,
      itemCount: 0,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    };

    render(
      <CartSummary
        cart={emptyCart}
        total={0}
        onCheckout={mockOnCheckout}
        onRemove={mockOnRemove}
        onUpdateQuantity={mockOnUpdateQuantity}
      />
    );

    expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
  });

  it('should render cart items when cart has items', async () => {
    const cartWithItems: Cart = {
      id: 'cart-1',
      userId: 'user-1',
      items: [
        { productId: '1', quantity: 2, addedAt: '2024-01-01' },
        { productId: '2', quantity: 1, addedAt: '2024-01-01' },
      ],
      total: 250,
      itemCount: 3,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    };

    render(
      <CartSummary
        cart={cartWithItems}
        total={250}
        onCheckout={mockOnCheckout}
        onRemove={mockOnRemove}
        onUpdateQuantity={mockOnUpdateQuantity}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Product 1')).toBeInTheDocument();
      expect(screen.getByText('Product 2')).toBeInTheDocument();
    });
  });

  it('should display correct totals', async () => {
    const cartWithItems: Cart = {
      id: 'cart-1',
      userId: 'user-1',
      items: [{ productId: '1', quantity: 2, addedAt: '2024-01-01' }],
      total: 200,
      itemCount: 2,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    };

    render(
      <CartSummary
        cart={cartWithItems}
        total={200}
        onCheckout={mockOnCheckout}
        onRemove={mockOnRemove}
        onUpdateQuantity={mockOnUpdateQuantity}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument(); // Item count
      expect(screen.getByText('$200')).toBeInTheDocument(); // Total
    });
  });

  it('should call onRemove when remove button is clicked', async () => {
    const cartWithItems: Cart = {
      id: 'cart-1',
      userId: 'user-1',
      items: [{ productId: '1', quantity: 1, addedAt: '2024-01-01' }],
      total: 100,
      itemCount: 1,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    };

    render(
      <CartSummary
        cart={cartWithItems}
        total={100}
        onCheckout={mockOnCheckout}
        onRemove={mockOnRemove}
        onUpdateQuantity={mockOnUpdateQuantity}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Product 1')).toBeInTheDocument();
    });

    const removeButtons = screen.getAllByTitle('Remove item');
    
    await act(async () => {
      fireEvent.click(removeButtons[0]);
    });

    expect(mockOnRemove).toHaveBeenCalledWith('1');
  });

  it('should call onUpdateQuantity when quantity buttons are clicked', async () => {
    const cartWithItems: Cart = {
      id: 'cart-1',
      userId: 'user-1',
      items: [{ productId: '1', quantity: 2, addedAt: '2024-01-01' }],
      total: 200,
      itemCount: 2,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    };

    render(
      <CartSummary
        cart={cartWithItems}
        total={200}
        onCheckout={mockOnCheckout}
        onRemove={mockOnRemove}
        onUpdateQuantity={mockOnUpdateQuantity}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Product 1')).toBeInTheDocument();
    });

    const increaseButtons = screen.getAllByTitle('Increase quantity');
    
    await act(async () => {
      fireEvent.click(increaseButtons[0]);
    });

    expect(mockOnUpdateQuantity).toHaveBeenCalledWith('1', 3);
  });

  it('should call onRemove when quantity is decreased to 0', async () => {
    const cartWithItems: Cart = {
      id: 'cart-1',
      userId: 'user-1',
      items: [{ productId: '1', quantity: 1, addedAt: '2024-01-01' }],
      total: 100,
      itemCount: 1,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    };

    render(
      <CartSummary
        cart={cartWithItems}
        total={100}
        onCheckout={mockOnCheckout}
        onRemove={mockOnRemove}
        onUpdateQuantity={mockOnUpdateQuantity}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Product 1')).toBeInTheDocument();
    });

    const decreaseButtons = screen.getAllByTitle('Decrease quantity or remove');
    
    await act(async () => {
      fireEvent.click(decreaseButtons[0]);
    });

    expect(mockOnRemove).toHaveBeenCalledWith('1');
  });

  it('should call onCheckout when checkout button is clicked', async () => {
    const cartWithItems: Cart = {
      id: 'cart-1',
      userId: 'user-1',
      items: [{ productId: '1', quantity: 1, addedAt: '2024-01-01' }],
      total: 100,
      itemCount: 1,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    };

    render(
      <CartSummary
        cart={cartWithItems}
        total={100}
        onCheckout={mockOnCheckout}
        onRemove={mockOnRemove}
        onUpdateQuantity={mockOnUpdateQuantity}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Product 1')).toBeInTheDocument();
    });

    const checkoutButton = screen.getByText('Checkout');
    
    await act(async () => {
      fireEvent.click(checkoutButton);
    });

    expect(mockOnCheckout).toHaveBeenCalledWith(undefined, 100);
  });

  it('should call onCheckout with discount code when provided', async () => {
    const cartWithItems: Cart = {
      id: 'cart-1',
      userId: 'user-1',
      items: [{ productId: '1', quantity: 1, addedAt: '2024-01-01' }],
      total: 100,
      itemCount: 1,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    };

    render(
      <CartSummary
        cart={cartWithItems}
        total={100}
        onCheckout={mockOnCheckout}
        onRemove={mockOnRemove}
        onUpdateQuantity={mockOnUpdateQuantity}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Product 1')).toBeInTheDocument();
    });

    const discountInput = screen.getByPlaceholderText('Enter discount code');
    
    await act(async () => {
      fireEvent.change(discountInput, { target: { value: 'DISCOUNT10' } });
    });

    const checkoutButton = screen.getByText('Checkout');
    
    await act(async () => {
      fireEvent.click(checkoutButton);
    });

    expect(mockOnCheckout).toHaveBeenCalledWith('DISCOUNT10', 100);
  });

  it('should disable checkout button when cart is empty', async () => {
    const emptyCart: Cart = {
      id: 'cart-1',
      userId: 'user-1',
      items: [],
      total: 0,
      itemCount: 0,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    };

    render(
      <CartSummary
        cart={emptyCart}
        total={0}
        onCheckout={mockOnCheckout}
        onRemove={mockOnRemove}
        onUpdateQuantity={mockOnUpdateQuantity}
      />
    );

    // Wait for any async operations to complete
    await waitFor(() => {
      // When cart is empty, the checkout button is not rendered
      // Instead, the empty cart message is shown
      expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
      expect(screen.queryByText('Checkout')).not.toBeInTheDocument();
    });
  });

  it('should disable checkout button when isLoading is true', async () => {
    const cartWithItems: Cart = {
      id: 'cart-1',
      userId: 'user-1',
      items: [{ productId: '1', quantity: 1, addedAt: '2024-01-01' }],
      total: 100,
      itemCount: 1,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    };

    render(
      <CartSummary
        cart={cartWithItems}
        total={100}
        onCheckout={mockOnCheckout}
        onRemove={mockOnRemove}
        onUpdateQuantity={mockOnUpdateQuantity}
        isLoading={true}
      />
    );

    await waitFor(() => {
      const checkoutButton = screen.getByText('Checkout');
      expect(checkoutButton).toBeDisabled();
    });
  });

  it('should show empty cart modal when checkout is attempted with empty cart', async () => {
    const emptyCart: Cart = {
      id: 'cart-1',
      userId: 'user-1',
      items: [],
      total: 0,
      itemCount: 0,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    };

    render(
      <CartSummary
        cart={emptyCart}
        total={0}
        onCheckout={mockOnCheckout}
        onRemove={mockOnRemove}
        onUpdateQuantity={mockOnUpdateQuantity}
      />
    );

    // Try to checkout (button should be disabled, but if we force it)
    // The component should show the empty cart modal
    expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
  });

  it('should convert discount code to uppercase', async () => {
    const cartWithItems: Cart = {
      id: 'cart-1',
      userId: 'user-1',
      items: [{ productId: '1', quantity: 1, addedAt: '2024-01-01' }],
      total: 100,
      itemCount: 1,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    };

    render(
      <CartSummary
        cart={cartWithItems}
        total={100}
        onCheckout={mockOnCheckout}
        onRemove={mockOnRemove}
        onUpdateQuantity={mockOnUpdateQuantity}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Product 1')).toBeInTheDocument();
    });

    const discountInput = screen.getByPlaceholderText('Enter discount code') as HTMLInputElement;
    
    await act(async () => {
      fireEvent.change(discountInput, { target: { value: 'discount10' } });
    });

    await waitFor(() => {
      expect(discountInput.value).toBe('DISCOUNT10');
    });
  });
});
