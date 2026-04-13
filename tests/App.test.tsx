import { render, screen } from '@testing-library/react';
import { App } from '../src/App';

beforeEach(() => {
  localStorage.clear();
});

describe('App', () => {
  it('renders the ToolShelf header and empty state message when no items exist', () => {
    render(<App />);
    expect(screen.getByText('ToolShelf')).toBeInTheDocument();
    expect(screen.getByText(/No items yet/i)).toBeInTheDocument();
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
          returnDate: '2026-04-20',
        },
      },
    ];
    localStorage.setItem('toolshelf-items', JSON.stringify(items));
    render(<App />);
    expect(screen.getByText('1 Available')).toBeInTheDocument();
    expect(screen.getByText('1 Lent')).toBeInTheDocument();
  });
});
