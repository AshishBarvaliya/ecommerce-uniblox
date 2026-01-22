import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/button';

describe('Button Component', () => {
  it('should render button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('should handle click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    const button = screen.getByText('Click me');
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    const button = screen.getByText('Click me');
    expect(button).toBeDisabled();
  });

  it('should not call onClick when disabled', () => {
    const handleClick = jest.fn();
    render(
      <Button onClick={handleClick} disabled>
        Click me
      </Button>
    );

    const button = screen.getByText('Click me');
    fireEvent.click(button);

    expect(handleClick).not.toHaveBeenCalled();
  });

  it('should render different variants', () => {
    const { rerender } = render(<Button variant="default">Default</Button>);
    expect(screen.getByText('Default')).toBeInTheDocument();

    rerender(<Button variant="destructive">Destructive</Button>);
    expect(screen.getByText('Destructive')).toBeInTheDocument();

    rerender(<Button variant="outline">Outline</Button>);
    expect(screen.getByText('Outline')).toBeInTheDocument();
  });

  it('should render different sizes', () => {
    const { rerender } = render(<Button size="sm">Small</Button>);
    expect(screen.getByText('Small')).toBeInTheDocument();

    rerender(<Button size="lg">Large</Button>);
    expect(screen.getByText('Large')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(<Button className="custom-class">Button</Button>);
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('should render as child when asChild is true', () => {
    render(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>
    );
    expect(screen.getByText('Link Button').tagName).toBe('A');
  });
});
