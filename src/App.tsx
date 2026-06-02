import { useState, useMemo, useCallback, Component, type ReactNode, type ErrorInfo } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { ToastProvider, useToast } from './hooks/useToast';
import { Dashboard } from './components/Dashboard';
import { ItemForm } from './components/ItemForm';
import { ItemCard } from './components/ItemCard';

import { IconPlus, IconX } from './components/Icon';
import type { ToolItem, StatusFilter } from './types';
import { getItemStatus } from './types';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ToolShelf error:', error, errorInfo);
  }

  handleReload = (): void => {
    this.setState({ hasError: false, error: null });
  };

  handleClearData = (): void => {
    localStorage.clear();
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-surface-secondary p-6">
          <div className="max-w-md rounded-xl border border-border bg-surface p-8 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-2xl">
              ⚠️
            </div>
            <h1 className="text-lg font-bold text-text-primary">Something went wrong</h1>
            <p className="mt-2 text-sm text-text-secondary">
              ToolShelf encountered an unexpected error. Your data is stored locally and should be safe.
            </p>
            {this.state.error && (
              <p className="mt-2 rounded-lg bg-surface-tertiary p-3 text-xs font-mono text-text-tertiary break-all">
                {this.state.error.message}
              </p>
            )}
            <div className="mt-6 flex flex-col gap-2">
              <button
                onClick={this.handleReload}
                className="rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-brand-dark active:scale-[0.98]"
              >
                Try Again
              </button>
              <button
                onClick={this.handleClearData}
                className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600 transition-all duration-200 hover:bg-red-100 active:scale-[0.98]"
              >
                Clear Data &amp; Restart
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const EXAMPLE_ITEMS: ToolItem[] = [
  {
    id: 'example-drill',
    name: 'Cordless Drill',
    category: 'Power Tools',
    condition: 'Good',
    notes: 'Includes charger and bit set',
    borrow: null,
  },
  {
    id: 'example-ladder',
    name: 'Step Ladder',
    category: 'Household',
    condition: 'Good',
    notes: '6ft, non-slip feet',
    borrow: {
      borrowerName: 'Maria',
      borrowDate: '2026-05-28',
      returnDate: '2026-06-15',
    },
  },
  {
    id: 'example-sockets',
    name: 'Socket Set',
    category: 'Hand Tools',
    condition: 'Excellent',
    notes: 'Metric and SAE, 42-piece',
    borrow: null,
  },
];

export function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </ErrorBoundary>
  );
}

function AppContent() {
  const [items, setItems] = useLocalStorage<ToolItem[]>('toolshelf-items', EXAMPLE_ITEMS);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [showForm, setShowForm] = useState(false);
  const { addToast } = useToast();

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (statusFilter !== 'all' && getItemStatus(item) !== statusFilter) {
        return false;
      }
      return true;
    });
  }, [items, statusFilter]);

  const handleAddItem = useCallback(
    (item: ToolItem) => {
      setItems((prev) => [...prev, item]);
      setShowForm(false);
      addToast({ message: `"${item.name}" added to your shelf`, type: 'success' });
    },
    [setItems, addToast]
  );

  const handleBorrow = useCallback(
    (id: string, data: { borrowerName: string; returnDate: string }) => {
      setItems((prev) => {
        const item = prev.find((i) => i.id === id);
        if (item) {
          addToast({ message: `"${item.name}" lent to ${data.borrowerName}`, type: 'success' });
        }
        return prev.map((i) =>
          i.id === id
            ? {
                ...i,
                borrow: {
                  borrowerName: data.borrowerName,
                  borrowDate: new Date().toISOString().split('T')[0],
                  returnDate: data.returnDate || null,
                },
              }
            : i
        );
      });
    },
    [setItems, addToast]
  );

  const handleReturn = useCallback(
    (id: string) => {
      setItems((prev) => {
        const item = prev.find((i) => i.id === id);
        if (item) {
          addToast({ message: `"${item.name}" returned`, type: 'success' });
        }
        return prev.map((i) => (i.id === id ? { ...i, borrow: null } : i));
      });
    },
    [setItems, addToast]
  );

  const handleDelete = useCallback(
    (id: string) => {
      setItems((prev) => {
        const item = prev.find((i) => i.id === id);
        if (item) {
          addToast({ message: `"${item.name}" removed`, type: 'info' });
        }
        return prev.filter((i) => i.id !== id);
      });
    },
    [setItems, addToast]
  );

  const handleUpdate = useCallback(
    (id: string, updates: Partial<ToolItem>) => {
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
      );
      addToast({ message: 'Item updated', type: 'success' });
    },
    [setItems, addToast]
  );

  return (
    <div className="flex min-h-screen flex-col bg-surface-secondary">
      {/* Skip to content link for keyboard users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-brand focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:shadow-lg"
      >
        Skip to content
      </a>

      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-surface/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-2xl items-center px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-white text-base shadow-sm shadow-brand/25">
              🔧
            </div>
            <h1 className="text-lg font-bold leading-tight tracking-tight text-text-primary">
              ToolShelf
            </h1>
          </div>

        </div>
      </header>

      {/* Main Content */}
      <main id="main-content" className="mx-auto w-full max-w-2xl flex-1 px-4 py-6 sm:px-6">
        {/* Dashboard */}
        <div className="mb-5">
          <Dashboard
            items={items}
            onFilter={setStatusFilter}
            activeFilter={statusFilter}
          />
        </div>

        {/* Actions */}
        <div className="mb-5 flex flex-wrap items-center gap-2">
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-brand/20 transition-all duration-200 hover:bg-brand-dark hover:shadow-md hover:shadow-brand/25 active:scale-[0.98]"
              aria-label="Add new item"
            >
              <IconPlus size={16} />
              Add Item
            </button>
          )}
        </div>

        {/* Add Item Form */}
        {showForm && (
          <div className="mb-5 animate-slide-down">
            <ItemForm onAdd={handleAddItem} onCancel={() => setShowForm(false)} />
          </div>
        )}

        {/* Item List or Filtered Empty State */}
        {filteredItems.length === 0 && items.length > 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-surface px-6 py-16 text-center animate-fade-in">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-tertiary text-2xl">
              🔍
            </div>
            <p className="text-base font-medium text-text-secondary">
              No items match your filter
            </p>
            <p className="mt-1 text-sm text-text-tertiary">
              You have {items.length} item{items.length === 1 ? '' : 's'} total. Try adjusting your filter.
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              {statusFilter !== 'all' && (
                <button
                  onClick={() => setStatusFilter('all')}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3.5 py-2 text-xs font-medium text-text-secondary transition-all duration-200 hover:bg-surface-tertiary hover:border-border-hover active:scale-[0.98]"
                >
                  <IconX size={12} />
                  Clear all filters
                </button>
              )}
            </div>
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="space-y-3">
            {filteredItems.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onBorrow={handleBorrow}
                onReturn={handleReturn}
                onDelete={handleDelete}
                onUpdate={handleUpdate}
              />
            ))}
          </div>
        ) : null}
      </main>
    </div>
  );
}
