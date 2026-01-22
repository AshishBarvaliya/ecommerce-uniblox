import React from 'react';
import { render, screen } from '@testing-library/react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';

describe('Card Components', () => {
  it('should render Card with children', () => {
    render(
      <Card>
        <div>Card Content</div>
      </Card>
    );
    expect(screen.getByText('Card Content')).toBeInTheDocument();
  });

  it('should render CardHeader with CardTitle and CardDescription', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card Description</CardDescription>
        </CardHeader>
      </Card>
    );

    expect(screen.getByText('Card Title')).toBeInTheDocument();
    expect(screen.getByText('Card Description')).toBeInTheDocument();
  });

  it('should render CardContent', () => {
    render(
      <Card>
        <CardContent>
          <p>Content here</p>
        </CardContent>
      </Card>
    );

    expect(screen.getByText('Content here')).toBeInTheDocument();
  });

  it('should render CardFooter', () => {
    render(
      <Card>
        <CardFooter>
          <button>Action</button>
        </CardFooter>
      </Card>
    );

    expect(screen.getByText('Action')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <Card className="custom-card">
        <CardContent>Content</CardContent>
      </Card>
    );

    expect(container.firstChild).toHaveClass('custom-card');
  });

  it('should render complete card structure', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Title</CardTitle>
          <CardDescription>Description</CardDescription>
        </CardHeader>
        <CardContent>Content</CardContent>
        <CardFooter>Footer</CardFooter>
      </Card>
    );

    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
    expect(screen.getByText('Footer')).toBeInTheDocument();
  });
});
