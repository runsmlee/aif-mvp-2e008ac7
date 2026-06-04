import { render, screen, fireEvent } from '@testing-library/react';
import { Dashboard } from '../src/components/Dashboard';
import type { ToolItem } from '../src/types';

const mockItems: ToolItem[] = [
  {
    id: '1',
    name: 'Power Drill',
    category: 'Power Tools',
    condition: 'Good',
    borrow: null,
  },
  {
    id: '2',
    name: 'Hammer',
    category: 'Hand Tools',
    condition: 'Excellent',
    borrow: {
      borrowerName: 'Maria',
      borrowDate: '2026-04-10',
      returnDate: '2027-04-20',
    },
  },
  {
    id: '3',
    name: 'Ladder',
    category: 'Household',
    condition: 'Fair',
    borrow: {
      borrowerName: 'John',
      borrowDate: '2026-04-01',
      returnDate: '2026-04-10',
    },
  },
];

describe('Dashboard', () => {
  it('displays total item count', () => {
    render(<Dashboard items={mockItems} onFilter={vi.fn()} activeFilter="all" />);
    expect(screen.getByText(/3 items/)).toBeInTheDocument();
  });

  it('displays available item count with correct badge color', () => {
    render(<Dashboard items={mockItems} onFilter={vi.fn()} activeFilter="all" />);
    const availableBadge = screen.getByText('1 Available');
    expect(availableBadge).toBeInTheDocument();
    expect(availableBadge.className).toContain('emerald');
  });

  it('displays lent item count with correct badge color', () => {
    render(<Dashboard items={mockItems} onFilter={vi.fn()} activeFilter="all" />);
    const lentBadge = screen.getByText('1 Lent');
    expect(lentBadge).toBeInTheDocument();
    expect(lentBadge.className).toContain('amber');
  });

  it('displays overdue item count with correct badge color', () => {
    render(<Dashboard items={mockItems} onFilter={vi.fn()} activeFilter="all" />);
    const overdueBadge = screen.getByText('1 Overdue');
    expect(overdueBadge).toBeInTheDocument();
    expect(overdueBadge.className).toContain('red');
  });

  it('clicking a status filter calls onFilter callback', () => {
    const onFilter = vi.fn();
    render(<Dashboard items={mockItems} onFilter={onFilter} activeFilter="all" />);
    fireEvent.click(screen.getByText('1 Lent'));
    expect(onFilter).toHaveBeenCalledWith('lent');
  });
});
