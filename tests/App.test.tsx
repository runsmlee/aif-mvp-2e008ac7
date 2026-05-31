import { render, screen, fireEvent } from '@testing-library/react';
import { App } from '../src/App';

beforeEach(() => {
  localStorage.clear();
});

describe('App', () => {
  it('renders the ToolShelf header and pre-populated example items on first load', () => {
    render(<App />);
    expect(screen.getByText('ToolShelf')).toBeInTheDocument();
    expect(screen.getByText('Cordless Drill')).toBeInTheDocument();
    expect(screen.getByText('Step Ladder')).toBeInTheDocument();
    expect(screen.getByText('Socket Set')).toBeInTheDocument();
  });

  it('shows pre-populated example items with correct statuses on first load', () => {
    render(<App />);
    // Cordless Drill and Socket Set should be Available, Step Ladder should be Lent
    const availableBadges = screen.getAllByText('Available');
    expect(availableBadges.length).toBe(2);
    expect(screen.getByText('Lent')).toBeInTheDocument();
    // Step Ladder is lent to Maria
    expect(screen.getByText(/Maria/)).toBeInTheDocument();
    // Dashboard should show 2 Available, 1 Lent, 0 Overdue
    expect(screen.getByText('2 Available')).toBeInTheDocument();
    expect(screen.getByText('1 Lent')).toBeInTheDocument();
    expect(screen.getByText('0 Overdue')).toBeInTheDocument();
  });

  it('renders the item list when items are present in storage', () => {
    const items = [
      {
        id: '1',
        name: 'Power Drill',
        category: 'Power Tools',
        condition: 'Good',
        notes: '',
        borrow: null,
      },
    ];
    localStorage.setItem('toolshelf-items', JSON.stringify(items));
    render(<App />);
    expect(screen.getByText('Power Drill')).toBeInTheDocument();
  });

  it('displays the availability dashboard with correct counts per status', () => {
    const items = [
      {
        id: '1',
        name: 'Power Drill',
        category: 'Power Tools',
        condition: 'Good',
        notes: '',
        borrow: null,
      },
      {
        id: '2',
        name: 'Hammer',
        category: 'Hand Tools',
        condition: 'Excellent',
        notes: '',
        borrow: {
          borrowerName: 'Maria',
          borrowDate: '2026-04-10',
          returnDate: '2027-04-20',
        },
      },
    ];
    localStorage.setItem('toolshelf-items', JSON.stringify(items));
    render(<App />);
    expect(screen.getByText('1 Available')).toBeInTheDocument();
    expect(screen.getByText('1 Lent')).toBeInTheDocument();
  });

  it('shows success toast when an item is added', () => {
    render(<App />);
    // Click add item button
    fireEvent.click(screen.getByRole('button', { name: /add new item/i }));
    // Fill in form
    fireEvent.change(screen.getByLabelText(/Item name/i), {
      target: { value: 'Test Drill' },
    });
    fireEvent.click(screen.getByRole('button', { name: /^add item$/i }));
    // Should show toast
    expect(screen.getByText(/added/i)).toBeInTheDocument();
  });

  it('renders without onboarding empty state when all items are deleted', () => {
    // Set empty array in storage to simulate all items deleted
    localStorage.setItem('toolshelf-items', JSON.stringify([]));
    render(<App />);
    // No onboarding empty state should appear
    expect(screen.queryByText(/no items/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/click.*add item/i)).not.toBeInTheDocument();
    // The Add Item button should still be accessible
    expect(screen.getByRole('button', { name: /add new item/i })).toBeInTheDocument();
  });
});
