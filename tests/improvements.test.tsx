import { render, screen, fireEvent } from '@testing-library/react';
import { App } from '../src/App';
import { getItemStatus } from '../src/types';
import type { ToolItem } from '../src/types';

beforeEach(() => {
  localStorage.clear();
});

describe('Overdue logic improvements', () => {
  it('does NOT mark an item as overdue when return date is today', () => {
    const today = new Date().toISOString().split('T')[0];
    const item: ToolItem = {
      id: '1',
      name: 'Wrench',
      category: 'Hand Tools',
      condition: 'Good',
      notes: '',
      borrow: {
        borrowerName: 'Alice',
        borrowDate: '2026-04-01',
        returnDate: today,
      },
    };
    expect(getItemStatus(item)).toBe('lent');
  });

  it('marks an item as overdue when return date is yesterday', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    const item: ToolItem = {
      id: '2',
      name: 'Saw',
      category: 'Hand Tools',
      condition: 'Fair',
      notes: '',
      borrow: {
        borrowerName: 'Bob',
        borrowDate: '2026-04-01',
        returnDate: yesterdayStr,
      },
    };
    expect(getItemStatus(item)).toBe('overdue');
  });

  it('marks an item as lent when return date is tomorrow', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    const item: ToolItem = {
      id: '3',
      name: 'Drill',
      category: 'Power Tools',
      condition: 'Good',
      notes: '',
      borrow: {
        borrowerName: 'Carol',
        borrowDate: '2026-04-01',
        returnDate: tomorrowStr,
      },
    };
    expect(getItemStatus(item)).toBe('lent');
  });
});

describe('Empty state with active filters', () => {
  it('shows total item count when filters produce no results', () => {
    const items = [
      { id: '1', name: 'Power Drill', category: 'Power Tools', condition: 'Good', notes: '', borrow: null },
      { id: '2', name: 'Hammer', category: 'Hand Tools', condition: 'Good', notes: '', borrow: null },
    ];
    localStorage.setItem('toolshelf-items', JSON.stringify(items));
    render(<App />);

    // Click "Lent" filter (no items are lent)
    fireEvent.click(screen.getByText('0 Lent'));

    // Should show total count in the empty state
    expect(screen.getByText(/You have 2 items total/)).toBeInTheDocument();
    expect(screen.getByText(/No items match your filter/)).toBeInTheDocument();
  });

  it('shows "Clear all filters" button when filters are active and no results', () => {
    const items = [
      { id: '1', name: 'Power Drill', category: 'Power Tools', condition: 'Good', notes: '', borrow: null },
    ];
    localStorage.setItem('toolshelf-items', JSON.stringify(items));
    render(<App />);

    // Click "Overdue" filter (no items are overdue)
    fireEvent.click(screen.getByText('0 Overdue'));

    expect(screen.getByRole('button', { name: /clear all filters/i })).toBeInTheDocument();
  });
});

describe('Keyboard shortcut for search', () => {
  it('focuses search input when "/" is pressed', () => {
    render(<App />);
    const searchInput = screen.getByLabelText(/search items/i);
    expect(searchInput).not.toHaveFocus();

    fireEvent.keyDown(document, { key: '/' });
    expect(searchInput).toHaveFocus();
  });

  it('does not focus search when "/" is pressed inside an input', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /add new item/i }));
    const nameInput = screen.getByLabelText(/item name/i);
    nameInput.focus();
    expect(nameInput).toHaveFocus();

    fireEvent.keyDown(nameInput, { key: '/' });
    expect(nameInput).toHaveFocus();
  });
});
