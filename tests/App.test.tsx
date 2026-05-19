import { render, screen, fireEvent } from '@testing-library/react';
import { App } from '../src/App';

beforeEach(() => {
  localStorage.clear();
});

describe('App', () => {
  it('renders the ToolShelf header and pre-populated example items on first load', () => {
    render(<App />);
    expect(screen.getByText('ToolShelf')).toBeInTheDocument();
    expect(screen.getByText('Power Drill')).toBeInTheDocument();
    expect(screen.getByText('Ladder')).toBeInTheDocument();
    expect(screen.getByText('Circular Saw')).toBeInTheDocument();
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

  it('renders sort control', () => {
    render(<App />);
    expect(screen.getByLabelText(/sort items/i)).toBeInTheDocument();
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

  it('sorts items alphabetically when sort is changed', () => {
    const items = [
      { id: '1', name: 'Zebra', category: 'Hand Tools', condition: 'Good', notes: '', borrow: null },
      { id: '2', name: 'Alpha', category: 'Power Tools', condition: 'Good', notes: '', borrow: null },
    ];
    localStorage.setItem('toolshelf-items', JSON.stringify(items));
    render(<App />);
    // Change sort to alphabetical
    fireEvent.change(screen.getByLabelText(/sort items/i), { target: { value: 'name-asc' } });
    // Alpha should come before Zebra
    const itemElements = screen.getAllByRole('article');
    expect(itemElements[0]).toHaveTextContent('Alpha');
    expect(itemElements[1]).toHaveTextContent('Zebra');
  });

  it('shows empty state when all items are deleted', () => {
    // Set empty array in storage to simulate all items deleted
    localStorage.setItem('toolshelf-items', JSON.stringify([]));
    render(<App />);
    expect(screen.getByText(/no items/i)).toBeInTheDocument();
  });
});
