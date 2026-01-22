import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import AdminPage from '@/app/admin/page';

// Mock Next.js Link
jest.mock('next/link', () => {
  return ({ children, href }: any) => <a href={href}>{children}</a>;
});

// Mock fetch globally
global.fetch = jest.fn();

const mockStats = {
  currentDiscount: {
    code: 'DISCOUNT10',
    percentage: 10,
    isUsed: false,
    createdAt: '2024-01-01',
  },
  orderCount: 5,
  n: 5,
  nextDiscountAt: null,
  totalDiscountsUsed: 2,
  totalOrders: 5,
  ordersWithDiscount: 2,
};

const mockOrdersData = {
  orders: [
    {
      id: 'ORD-1',
      userId: 'user-1',
      items: [{ productId: '1', quantity: 2, addedAt: '2024-01-01' }],
      total: 200,
      discountCode: 'DISCOUNT10',
      discountAmount: 20,
      status: 'completed',
      paymentMethod: { type: 'card' },
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    },
    {
      id: 'ORD-2',
      userId: 'user-2',
      items: [{ productId: '2', quantity: 1, addedAt: '2024-01-01' }],
      total: 50,
      status: 'processing',
      paymentMethod: { type: 'paypal' },
      createdAt: '2024-01-02',
      updatedAt: '2024-01-02',
    },
  ],
  statistics: {
    totalOrders: 2,
    totalItemsPurchased: 3,
    totalPurchaseAmount: 250,
    discountCodesUsed: ['DISCOUNT10'],
    totalDiscountAmount: 20,
  },
};

describe('Admin Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset fetch mock for each test
    (global.fetch as jest.Mock).mockClear();
  });

  it('should render loading state initially', () => {
    (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {}));

    render(<AdminPage />);
    expect(screen.getByText('Loading admin dashboard...')).toBeInTheDocument();
    
    // Clean up
    (global.fetch as jest.Mock).mockClear();
  });

  it('should fetch and display stats and orders', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        json: async () => ({ success: true, data: mockStats }),
      })
      .mockResolvedValueOnce({
        json: async () => ({ success: true, data: mockOrdersData }),
      });

    render(<AdminPage />);

    await waitFor(() => {
      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Orders Overview')).toBeInTheDocument();
    }, { timeout: 3000 });

    expect(global.fetch).toHaveBeenCalledWith('/api/admin/stats');
    expect(global.fetch).toHaveBeenCalledWith('/api/admin/orders');
  });

  it('should display order statistics', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        json: async () => ({ success: true, data: mockStats }),
      })
      .mockResolvedValueOnce({
        json: async () => ({ success: true, data: mockOrdersData }),
      });

    render(<AdminPage />);

    await waitFor(() => {
      expect(screen.getByText('Total Orders')).toBeInTheDocument();
      expect(screen.getByText('Total Items Purchased')).toBeInTheDocument();
      expect(screen.getByText('Total Purchase Amount')).toBeInTheDocument();
      expect(screen.getByText('Total Discount Amount')).toBeInTheDocument();
    }, { timeout: 3000 });

    // Check that statistics values are present
    expect(screen.getByText('Total Orders').nextSibling).toHaveTextContent('2');
    expect(screen.getByText('Total Items Purchased').nextSibling).toHaveTextContent('3');
  });

  it('should display orders in table', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        json: async () => ({ success: true, data: mockStats }),
      })
      .mockResolvedValueOnce({
        json: async () => ({ success: true, data: mockOrdersData }),
      });

    render(<AdminPage />);

    await waitFor(() => {
      expect(screen.getByText('ORD-1')).toBeInTheDocument();
      expect(screen.getByText('ORD-2')).toBeInTheDocument();
      expect(screen.getByText('$200.00')).toBeInTheDocument();
      expect(screen.getByText('$50.00')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('should display discount codes used', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        json: async () => ({ success: true, data: mockStats }),
      })
      .mockResolvedValueOnce({
        json: async () => ({ success: true, data: mockOrdersData }),
      });

    render(<AdminPage />);

    await waitFor(() => {
      expect(screen.getByText('Discount Codes Used:')).toBeInTheDocument();
    }, { timeout: 3000 });

    // Check that discount code is present in the list
    const discountCodes = screen.getAllByText('DISCOUNT10');
    expect(discountCodes.length).toBeGreaterThan(0);
  });

  it('should refresh orders when refresh button is clicked', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        json: async () => ({ success: true, data: mockStats }),
      })
      .mockResolvedValueOnce({
        json: async () => ({ success: true, data: mockOrdersData }),
      })
      .mockResolvedValueOnce({
        json: async () => ({ success: true, data: mockOrdersData }),
      });

    render(<AdminPage />);

    await waitFor(() => {
      expect(screen.getByText('Orders Overview')).toBeInTheDocument();
    }, { timeout: 3000 });

    const refreshButton = screen.getByText('Refresh');
    fireEvent.click(refreshButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/admin/orders');
    });
  });

  it('should open reset modal when reset button is clicked', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        json: async () => ({ success: true, data: mockStats }),
      })
      .mockResolvedValueOnce({
        json: async () => ({ success: true, data: mockOrdersData }),
      });

    render(<AdminPage />);

    await waitFor(() => {
      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    }, { timeout: 3000 });

    const resetButton = screen.getByText('Reset Store');
    fireEvent.click(resetButton);

    await waitFor(() => {
      expect(screen.getByText('Are you sure you want to reset the store?')).toBeInTheDocument();
    });
  });

  it('should reset store when confirmed', async () => {
    const resetResponse = {
      success: true,
      data: {
        message: 'Store reset successfully',
      },
    };

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        json: async () => ({ success: true, data: mockStats }),
      })
      .mockResolvedValueOnce({
        json: async () => ({ success: true, data: mockOrdersData }),
      })
      .mockResolvedValueOnce({
        json: async () => resetResponse,
      })
      .mockResolvedValueOnce({
        json: async () => ({ success: true, data: { ...mockStats, orderCount: 0 } }),
      })
      .mockResolvedValueOnce({
        json: async () => ({ success: true, data: { orders: [], statistics: { totalOrders: 0, totalItemsPurchased: 0, totalPurchaseAmount: 0, discountCodesUsed: [], totalDiscountAmount: 0 } } }),
      });

    render(<AdminPage />);

    await waitFor(() => {
      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    }, { timeout: 3000 });

    const resetButtons = screen.getAllByText('Reset Store');
    const resetButton = resetButtons[0]; // Get the first one (the button in header)
    fireEvent.click(resetButton);

    await waitFor(() => {
      expect(screen.getByText('Are you sure you want to reset the store?')).toBeInTheDocument();
    });

    // Find the confirm button in the dialog
    const confirmButtons = screen.getAllByText('Reset Store');
    // The last one should be the confirm button in the dialog
    const confirmButton = confirmButtons[confirmButtons.length - 1];
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/admin/reset', {
        method: 'POST',
      });
    });
  });

  it('should cancel reset when cancel button is clicked', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        json: async () => ({ success: true, data: mockStats }),
      })
      .mockResolvedValueOnce({
        json: async () => ({ success: true, data: mockOrdersData }),
      });

    render(<AdminPage />);

    await waitFor(() => {
      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Orders Overview')).toBeInTheDocument();
    }, { timeout: 3000 });

    const resetButtons = screen.getAllByText('Reset Store');
    const resetButton = resetButtons[0]; // Get the first one (the button in header)
    fireEvent.click(resetButton);

    await waitFor(() => {
      expect(screen.getByText('Are you sure you want to reset the store?')).toBeInTheDocument();
    });

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByText('Are you sure you want to reset the store?')).not.toBeInTheDocument();
    });
  });

  it('should display empty state when no orders exist', async () => {
    const emptyOrdersData = {
      orders: [],
      statistics: {
        totalOrders: 0,
        totalItemsPurchased: 0,
        totalPurchaseAmount: 0,
        discountCodesUsed: [],
        totalDiscountAmount: 0,
      },
    };

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        json: async () => ({ success: true, data: mockStats }),
      })
      .mockResolvedValueOnce({
        json: async () => ({ success: true, data: emptyOrdersData }),
      });

    render(<AdminPage />);

    await waitFor(() => {
      expect(screen.getByText('No orders found')).toBeInTheDocument();
    });
  });

  it('should display order status badges correctly', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        json: async () => ({ success: true, data: mockStats }),
      })
      .mockResolvedValueOnce({
        json: async () => ({ success: true, data: mockOrdersData }),
      });

    render(<AdminPage />);

    await waitFor(() => {
      expect(screen.getByText('completed')).toBeInTheDocument();
      expect(screen.getByText('processing')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('should handle reset store error', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        json: async () => ({ success: true, data: mockStats }),
      })
      .mockResolvedValueOnce({
        json: async () => ({ success: true, data: mockOrdersData }),
      })
      .mockResolvedValueOnce({
        json: async () => ({ success: false, error: { message: 'Reset failed' } }),
      });

    render(<AdminPage />);

    await waitFor(() => {
      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    }, { timeout: 3000 });

    const resetButtons = screen.getAllByText('Reset Store');
    const resetButton = resetButtons[0]; // Get the first one (the button in header)
    fireEvent.click(resetButton);

    await waitFor(() => {
      expect(screen.getByText('Are you sure you want to reset the store?')).toBeInTheDocument();
    });

    // Find the confirm button in the dialog
    const confirmButtons = screen.getAllByText('Reset Store');
    const confirmButton = confirmButtons[confirmButtons.length - 1];
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.getByText('Reset failed')).toBeInTheDocument();
    });
  });

  it('should handle fetch stats error', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        json: async () => ({ success: false, error: { message: 'Failed to fetch stats' } }),
      })
      .mockResolvedValueOnce({
        json: async () => ({ success: true, data: mockOrdersData }),
      });

    render(<AdminPage />);

    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.getByText('Failed to fetch stats')).toBeInTheDocument();
    });
  });

  it('should show loading state when refreshing orders', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        json: async () => ({ success: true, data: mockStats }),
      })
      .mockResolvedValueOnce({
        json: async () => ({ success: true, data: mockOrdersData }),
      });

    render(<AdminPage />);

    await waitFor(() => {
      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    });

    // Mock a delayed response for the refresh
    (global.fetch as jest.Mock).mockImplementationOnce(() => 
      new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            json: async () => ({ success: true, data: mockOrdersData }),
          });
        }, 100);
      })
    );

    const refreshButton = screen.getByText('Refresh');
    fireEvent.click(refreshButton);

    // Check for loading state immediately after click
    expect(screen.getByText('Loading orders...')).toBeInTheDocument();
  });

  it('should display link to store', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        json: async () => ({ success: true, data: mockStats }),
      })
      .mockResolvedValueOnce({
        json: async () => ({ success: true, data: mockOrdersData }),
      });

    render(<AdminPage />);

    // Wait for the component to finish loading
    await waitFor(() => {
      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    }, { timeout: 3000 });

    // Wait for the link to be rendered
    await waitFor(() => {
      const backLink = screen.getByText('Back to Store');
      expect(backLink).toBeInTheDocument();
      expect(backLink.closest('a')).toHaveAttribute('href', '/');
    }, { timeout: 3000 });
  });
});
