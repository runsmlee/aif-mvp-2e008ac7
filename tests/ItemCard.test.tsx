import { render, screen, fireEvent } from '@testing-library/react';
import { ItemCard } from '../src/components/ItemCard';
import type { ToolItem } from '../src/types';

const availableItem: ToolItem = {
  id: '1',
  name: 'Power Drill',
  category: 'Power Tools',
  condition: 'Good',
  borrow: null,
};

const lentItem: ToolItem = {
  id: '2',
  name: 'Hammer',
  category: 'Hand Tools',
  condition: 'Excellent',
  borrow: {
    borrowerName: 'Maria',
    borrowDate: '2026-04-10',
    returnDate: '2027-04-20',
  },
};

const overdueItem: ToolItem = {
  id: '3',
  name: 'Ladder',
  category: 'Household',
  condition: 'Fair',
  borrow: {
    borrowerName: 'John',
    borrowDate: '2026-04-01',
    returnDate: '2026-04-10',
  },
};

describe('ItemCard', () => {
  it('renders item name, category, condition, and status badge', () => {
    render(
      <ItemCard item={availableItem} onBorrow={vi.fn()} onReturn={vi.fn()} onDelete={vi.fn()} onUpdate={vi.fn()} />
    );
    expect(screen.getByText('Power Drill')).toBeInTheDocument();
    expect(screen.getByText('Power Tools')).toBeInTheDocument();
    expect(screen.getByText('Good')).toBeInTheDocument();
  });

  it('shows "Available" badge for items with no borrower', () => {
    render(
      <ItemCard item={availableItem} onBorrow={vi.fn()} onReturn={vi.fn()} onDelete={vi.fn()} onUpdate={vi.fn()} />
    );
    expect(screen.getByText('Available')).toBeInTheDocument();
  });

  it('shows "Lent" badge and borrower info for borrowed items', () => {
    render(
      <ItemCard item={lentItem} onBorrow={vi.fn()} onReturn={vi.fn()} onDelete={vi.fn()} onUpdate={vi.fn()} />
    );
    expect(screen.getByText('Lent')).toBeInTheDocument();
    expect(screen.getByText('Maria')).toBeInTheDocument();
    expect(screen.getByText(/Due Apr 20, 2027/)).toBeInTheDocument();
  });

  it('shows "Overdue" badge when return date is in the past', () => {
    render(
      <ItemCard item={overdueItem} onBorrow={vi.fn()} onReturn={vi.fn()} onDelete={vi.fn()} onUpdate={vi.fn()} />
    );
    expect(screen.getByText('Overdue')).toBeInTheDocument();
  });

  it('borrow button opens inline borrow form', () => {
    render(
      <ItemCard item={availableItem} onBorrow={vi.fn()} onReturn={vi.fn()} onDelete={vi.fn()} onUpdate={vi.fn()} />
    );
    fireEvent.click(screen.getByRole('button', { name: /lend/i }));
    expect(screen.getByLabelText(/Borrower name/i)).toBeInTheDocument();
  });

  it('return button resets item to available status', () => {
    const onReturn = vi.fn();
    render(
      <ItemCard item={lentItem} onBorrow={vi.fn()} onReturn={onReturn} onDelete={vi.fn()} onUpdate={vi.fn()} />
    );
    fireEvent.click(screen.getByRole('button', { name: /return/i }));
    expect(onReturn).toHaveBeenCalledWith('2');
  });

  it('edit button enables inline editing mode', () => {
    render(
      <ItemCard item={availableItem} onBorrow={vi.fn()} onReturn={vi.fn()} onDelete={vi.fn()} onUpdate={vi.fn()} />
    );
    fireEvent.click(screen.getByRole('button', { name: /edit/i }));
    // In edit mode, save button should appear
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
  });

  it('delete button shows confirmation before removing item', () => {
    const onDelete = vi.fn();
    render(
      <ItemCard item={availableItem} onBorrow={vi.fn()} onReturn={vi.fn()} onDelete={onDelete} onUpdate={vi.fn()} />
    );
    // First click shows confirmation
    fireEvent.click(screen.getByRole('button', { name: /delete/i }));
    expect(onDelete).not.toHaveBeenCalled();
    // Confirm deletion
    fireEvent.click(screen.getByRole('button', { name: /confirm delete/i }));
    expect(onDelete).toHaveBeenCalledWith('1');
  });

  it('delete can be cancelled after clicking delete', () => {
    const onDelete = vi.fn();
    render(
      <ItemCard item={availableItem} onBorrow={vi.fn()} onReturn={vi.fn()} onDelete={onDelete} onUpdate={vi.fn()} />
    );
    // First click shows confirmation
    fireEvent.click(screen.getByRole('button', { name: /delete/i }));
    // Cancel deletion
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onDelete).not.toHaveBeenCalled();
    // Should return to normal state with delete button visible again
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
  });
});
