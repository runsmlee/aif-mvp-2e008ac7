import { render, screen, fireEvent } from '@testing-library/react';
import { BorrowForm } from '../src/components/BorrowForm';

describe('BorrowForm', () => {
  it('renders borrower name input and optional return date input', () => {
    render(<BorrowForm onBorrow={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByLabelText(/Borrower name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Return date/i)).toBeInTheDocument();
  });

  it('shows validation error when borrower name is empty on submit', () => {
    render(<BorrowForm onBorrow={vi.fn()} onCancel={vi.fn()} />);
    const submitButton = screen.getByRole('button', { name: /confirm/i });
    fireEvent.click(submitButton);
    expect(screen.getByText(/borrower name is required/i)).toBeInTheDocument();
  });

  it('calls onBorrow with borrower name and return date on valid submit', () => {
    const onBorrow = vi.fn();
    render(<BorrowForm onBorrow={onBorrow} onCancel={vi.fn()} />);
    fireEvent.change(screen.getByLabelText(/Borrower name/i), {
      target: { value: 'Maria' },
    });
    fireEvent.change(screen.getByLabelText(/Return date/i), {
      target: { value: '2026-04-20' },
    });
    fireEvent.click(screen.getByRole('button', { name: /confirm/i }));
    expect(onBorrow).toHaveBeenCalledWith({
      borrowerName: 'Maria',
      returnDate: '2026-04-20',
    });
  });

  it('cancel button hides the form without submitting', () => {
    const onCancel = vi.fn();
    render(<BorrowForm onBorrow={vi.fn()} onCancel={onCancel} />);
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onCancel).toHaveBeenCalled();
  });
});
