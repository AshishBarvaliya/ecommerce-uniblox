import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

describe('Dialog Component', () => {
  it('should render dialog when open', () => {
    render(
      <Dialog open={true}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dialog Title</DialogTitle>
            <DialogDescription>Dialog Description</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button>Close</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );

    expect(screen.getByText('Dialog Title')).toBeInTheDocument();
    expect(screen.getByText('Dialog Description')).toBeInTheDocument();
    // There are multiple "Close" elements (footer button and sr-only span), use getAllByText
    const closeElements = screen.getAllByText('Close');
    expect(closeElements.length).toBeGreaterThan(0);
  });

  it('should not render dialog when closed', () => {
    render(
      <Dialog open={false}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dialog Title</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );

    expect(screen.queryByText('Dialog Title')).not.toBeInTheDocument();
  });

  it('should call onOpenChange when close button is clicked', () => {
    const handleOpenChange = jest.fn();
    render(
      <Dialog open={true} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dialog Title</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );

    // The close button is rendered by Radix UI in DialogContent
    // Query for all buttons with "Close" accessible name and select the first one
    // (the DialogContent close button, not any footer button)
    const closeButtons = screen.getAllByRole('button', { name: /close/i, hidden: true });
    // The DialogContent close button should be the first one (rendered before any footer content)
    const closeButton = closeButtons[0];
    expect(closeButton).toBeInTheDocument();
    
    fireEvent.click(closeButton);

    expect(handleOpenChange).toHaveBeenCalled();
  });

  it('should render dialog with all components', () => {
    render(
      <Dialog open={true}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Title</DialogTitle>
            <DialogDescription>Description</DialogDescription>
          </DialogHeader>
          <div>Content</div>
          <DialogFooter>
            <button>Action</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );

    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
    expect(screen.getByText('Action')).toBeInTheDocument();
  });

  it('should apply custom className to DialogContent', () => {
    const { container } = render(
      <Dialog open={true}>
        <DialogContent className="custom-dialog">
          <DialogHeader>
            <DialogTitle>Title</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );

    // The className is applied to the DialogPrimitive.Content element
    // which is inside a portal, so we need to search within the body
    const dialogContent = document.body.querySelector('.custom-dialog');
    expect(dialogContent).toBeInTheDocument();
  });
});
