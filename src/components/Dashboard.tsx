import { useMemo } from 'react';
import type { ToolItem, StatusFilter } from '../types';
import { getItemStatus } from '../types';
import { IconX } from './Icon';

interface DashboardProps {
  items: ToolItem[];
  onFilter: (filter: StatusFilter) => void;
  activeFilter: StatusFilter;
}

export function Dashboard({ items, onFilter, activeFilter }: DashboardProps) {
  const counts = useMemo(() => {
    let available = 0;
    let lent = 0;
    let overdue = 0;
    for (const item of items) {
      const status = getItemStatus(item);
      if (status === 'available') available++;
      else if (status === 'lent') lent++;
      else overdue++;
    }
    return { available, lent, overdue };
  }, [items]);

  const total = items.length;

  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Item status filters">
      <span className="mr-1 text-sm font-semibold text-text-primary" role="status" aria-live="polite">
        {total} {total === 1 ? 'item' : 'items'}
      </span>

      <button
        onClick={() => onFilter('available')}
        aria-pressed={activeFilter === 'available'}
        className={`inline-flex h-8 items-center rounded-full px-3 text-xs font-semibold transition-all duration-200 ${
          activeFilter === 'available'
            ? 'bg-emerald-100 text-emerald-700 shadow-sm ring-1 ring-emerald-200'
            : 'bg-surface text-text-secondary hover:bg-emerald-50 hover:text-emerald-700 active:scale-[0.97]'
        }`}
        aria-label={`${counts.available} available items`}
      >
        <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
        {counts.available} Available
      </button>

      <button
        onClick={() => onFilter('lent')}
        aria-pressed={activeFilter === 'lent'}
        className={`inline-flex h-8 items-center rounded-full px-3 text-xs font-semibold transition-all duration-200 ${
          activeFilter === 'lent'
            ? 'bg-amber-100 text-amber-700 shadow-sm ring-1 ring-amber-200'
            : 'bg-surface text-text-secondary hover:bg-amber-50 hover:text-amber-700 active:scale-[0.97]'
        }`}
        aria-label={`${counts.lent} lent items`}
      >
        <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-amber-500" />
        {counts.lent} Lent
      </button>

      <button
        onClick={() => onFilter('overdue')}
        aria-pressed={activeFilter === 'overdue'}
        className={`inline-flex h-8 items-center rounded-full px-3 text-xs font-semibold transition-all duration-200 ${
          activeFilter === 'overdue'
            ? 'bg-red-100 text-red-700 shadow-sm ring-1 ring-red-200'
            : 'bg-surface text-text-secondary hover:bg-red-50 hover:text-red-700 active:scale-[0.97]'
        }`}
        aria-label={`${counts.overdue} overdue items`}
      >
        <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-red-500" />
        {counts.overdue} Overdue
      </button>

      {activeFilter !== 'all' && (
        <button
          onClick={() => onFilter('all')}
          className="inline-flex h-8 items-center text-xs font-medium text-text-tertiary transition-colors duration-200 hover:text-text-secondary"
        >
          <IconX size={14} className="mr-1" />
          Clear
        </button>
      )}
    </div>
  );
}
