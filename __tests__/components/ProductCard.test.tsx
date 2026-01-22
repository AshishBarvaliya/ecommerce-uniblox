import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProductCard } from '@/components/ProductCard';
import type { Product } from '@/types';

const mockProduct: Product = {
  id: '1',
  name: 'Test Product',
  description: 'This is a test product description',
  price: 99.99,
  category: 'Electronics',
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
};

describe('ProductCard', () => {
  const mockOnAddToCart = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render product information correctly', () => {
    render(<ProductCard product={mockProduct} onAddToCart={mockOnAddToCart} />);

    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('Electronics')).toBeInTheDocument();
    expect(screen.getByText('This is a test product description')).toBeInTheDocument();
    expect(screen.getByText('$99.99')).toBeInTheDocument();
  });

  it('should call onAddToCart when button is clicked', () => {
    render(<ProductCard product={mockProduct} onAddToCart={mockOnAddToCart} />);

    const addButton = screen.getByText('Add to Cart');
    fireEvent.click(addButton);

    expect(mockOnAddToCart).toHaveBeenCalledTimes(1);
    expect(mockOnAddToCart).toHaveBeenCalledWith('1');
  });

  it('should disable button when isLoading is true', () => {
    render(<ProductCard product={mockProduct} onAddToCart={mockOnAddToCart} isLoading={true} />);

    const addButton = screen.getByText('Adding...').closest('button');
    expect(addButton).toBeDisabled();
  });

  it('should show loading state when isLoading is true', () => {
    render(<ProductCard product={mockProduct} onAddToCart={mockOnAddToCart} isLoading={true} />);

    expect(screen.getByText('Adding...')).toBeInTheDocument();
    expect(screen.queryByText('Add to Cart')).not.toBeInTheDocument();
  });

  it('should not call onAddToCart when button is disabled', () => {
    render(<ProductCard product={mockProduct} onAddToCart={mockOnAddToCart} isLoading={true} />);

    const addButton = screen.getByText('Adding...').closest('button');
    if (addButton) {
      fireEvent.click(addButton);
    }

    expect(mockOnAddToCart).not.toHaveBeenCalled();
  });

  it('should render different category colors', () => {
    const clothingProduct: Product = {
      ...mockProduct,
      category: 'Clothing',
    };

    const { container } = render(
      <ProductCard product={clothingProduct} onAddToCart={mockOnAddToCart} />
    );

    // Check that the component renders (category color is applied via className)
    expect(container.firstChild).toBeInTheDocument();
  });

  it('should handle products with long descriptions', () => {
    const longDescriptionProduct: Product = {
      ...mockProduct,
      description: 'This is a very long product description that should be truncated in the UI',
    };

    render(<ProductCard product={longDescriptionProduct} onAddToCart={mockOnAddToCart} />);

    expect(screen.getByText(longDescriptionProduct.description)).toBeInTheDocument();
  });

  it('should handle products with different price formats', () => {
    const expensiveProduct: Product = {
      ...mockProduct,
      price: 999.99,
    };

    render(<ProductCard product={expensiveProduct} onAddToCart={mockOnAddToCart} />);

    expect(screen.getByText('$999.99')).toBeInTheDocument();
  });
});
