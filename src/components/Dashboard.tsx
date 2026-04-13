import type { ToolItem, StatusFilter } from '../types';
import { getItemStatus } from '../types';

interface DashboardProps {
  items: ToolItem[];
  onFilter: (filter: StatusFilter) => void;
  activeFilter: StatusFilter;
}

export function Dashboard({ items, onFilter, activeFilter }: DashboardProps) {
  const available = items.filter((i) => getItemStatus(i) === 'available').length;
  const lent = items.filter((i) => getItemStatus(i) === 'lent').length;
  const overdue = items.filter((i) => getItemStatus(i) === 'overdue').length;
  const total = items.length;

  return (
    <div className="flex flex-wrap items-center gap-2" role="status" aria-label="Item dashboard">
      <span className="mr-1 text-sm font-semibold text-text-primary">
        {total} {total === 1 ? 'item' : 'items'}
      </span>

      <button
        onClick={() => onFilter('available')}
        className={`inline-flex h-7 items-center rounded-full px-3 text-xs font-semibold transition-all duration-200 ${
          activeFilter === 'available'
            ? 'bg-emerald-100 text-emerald-700 shadow-sm ring-1 ring-emerald-200'
            : 'bg-surface text-text-secondary hover:bg-emerald-50 hover:text-emerald-700 active:scale-[0.97]'
        }`}
        aria-label={`${available} available items`}
      >
        <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
        {available} Available
      </button>

      <button
        onClick={() => onFilter('lent')}
        className={`inline-flex h-7 items-center rounded-full px-3 text-xs font-semibold transition-all duration-200 ${
          activeFilter === 'lent'
            ? 'bg-amber-100 text-amber-700 shadow-sm ring-1 ring-amber-200'
            : 'bg-surface text-text-secondary hover:bg-amber-50 hover:text-amber-700 active:scale-[0.97]'
        }`}
        aria-label={`${lent} lent items`}
      >
        <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-amber-500" />
        {lent} Lent
      </button>

      <button
        onClick={() => onFilter('overdue')}
        className={`inline-flex h-7 items-center rounded-full px-3 text-xs font-semibold transition-all duration-200 ${
          activeFilter === 'overdue'
            ? 'bg-red-100 text-red-700 shadow-sm ring-1 ring-red-200'
            : 'bg-surface text-text-secondary hover:bg-red-50 hover:text-red-700 active:scale-[0.97]'
        }`}
        aria-label={`${overdue} overdue items`}
      >
        <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-red-500" />
        {overdue} Overdue
      </button>

      {activeFilter !== 'all' && (
        <button
          onClick={() => onFilter('all')}
          className="inline-flex h-7 items-center text-xs font-medium text-text-tertiary transition-colors duration-200 hover:text-text-secondary"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
          Clear
        </button>
      )}
    </div>
  );
}
