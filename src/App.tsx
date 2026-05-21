import { useState, useMemo, useCallback, useEffect, useRef, Component, type ReactNode, type ErrorInfo } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { ToastProvider, useToast } from './hooks/useToast';
import { Dashboard } from './components/Dashboard';
import { SearchBar } from './components/SearchBar';
import { ItemForm } from './components/ItemForm';
import { ItemCard } from './components/ItemCard';
import { DataManagement } from './components/DataManagement';
import { IconPlus, IconX } from './components/Icon';
import type { ToolItem, StatusFilter, ItemCategory } from './types';
import { getItemStatus } from './types';

type SortOption = 'newest' | 'oldest' | 'name-asc' | 'name-desc' | 'status';

const STATUS_ORDER: Record<string, number> = { overdue: 0, lent: 1, available: 2 };

function isTypingInInput(e: KeyboardEvent): boolean {
  const target = e.target as HTMLElement;
  return target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable;
}

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
    borrow: {
      borrowerName: 'Mike',
      borrowDate: '2026-05-10',
      returnDate: '2026-05-24',
    },
  },
  {
    id: 'example-ladder',
    name: '8ft Ladder',
    category: 'Household',
    condition: 'Good',
    notes: 'Fiberglass stepladder',
    borrow: null,
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
  const [categoryFilter, setCategoryFilter] = useState<ItemCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const { addToast } = useToast();
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut: "/" to focus search
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === '/' && !isTypingInInput(e)) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filteredItems = useMemo(() => {
    const filtered = items.filter((item) => {
      // Status filter
      if (statusFilter !== 'all' && getItemStatus(item) !== statusFilter) {
        return false;
      }
      // Category filter
      if (categoryFilter !== 'all' && item.category !== categoryFilter) {
        return false;
      }
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          item.name.toLowerCase().includes(query) ||
          item.notes.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query)
        );
      }
      return true;
    });

    // Sort items
    return filtered.sort((a, b) => {
      switch (sortOption) {
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'newest':
          return b.id.localeCompare(a.id);
        case 'oldest':
          return a.id.localeCompare(b.id);
        case 'status': {
          return STATUS_ORDER[getItemStatus(a)] - STATUS_ORDER[getItemStatus(b)];
        }
        default:
          return 0;
      }
    });
  }, [items, statusFilter, categoryFilter, searchQuery, sortOption]);

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

  const handleExport = useCallback(
    (data: ToolItem[]) => {
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `toolshelf-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      addToast({ message: `${data.length} items exported`, type: 'success' });
    },
    [addToast]
  );

  const handleImport = useCallback(
    (data: ToolItem[]) => {
      setItems(data);
      addToast({ message: `${data.length} items imported`, type: 'success' });
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
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-white text-base shadow-sm shadow-brand/25">
              🔧
            </div>
            <h1 className="text-lg font-bold leading-tight tracking-tight text-text-primary">
              ToolShelf
            </h1>
          </div>
          <DataManagement items={items} onImport={handleImport} onExport={handleExport} />
        </div>
      </header>

      {/* Main Content */}
      <main id="main-content" className="mx-auto w-full max-w-2xl flex-1 px-4 py-6 sm:px-6">
        {/* Dashboard & Search */}
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1">
            <Dashboard
              items={items}
              onFilter={setStatusFilter}
              onCategoryFilter={setCategoryFilter}
              activeFilter={statusFilter}
              activeCategory={categoryFilter}
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-full sm:w-52">
              <SearchBar ref={searchInputRef} onSearch={setSearchQuery} value={searchQuery} />
            </div>
            <div className="w-full sm:w-32">
              <label htmlFor="sort-select" className="sr-only">Sort items</label>
              <select
                id="sort-select"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as SortOption)}
                aria-label="Sort items"
                className="w-full rounded-lg border border-border bg-surface py-2.5 pl-3 pr-8 text-xs font-medium text-text-secondary transition-all duration-200 hover:border-border-hover focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%239CA3AF%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:16px] bg-[right_8px_center] bg-no-repeat"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="name-asc">Name A–Z</option>
                <option value="name-desc">Name Z–A</option>
                <option value="status">By status</option>
              </select>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mb-5 flex flex-wrap gap-2">
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

        {/* Item List or Empty State */}
        {filteredItems.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-surface px-6 py-16 text-center animate-fade-in">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-tertiary text-2xl">
              {items.length === 0 ? '🧰' : '🔍'}
            </div>
            <p className="text-base font-medium text-text-secondary">
              {items.length === 0 ? 'No items' : 'No items match your filter'}
            </p>
            <p className="mt-1 text-sm text-text-tertiary">
              {items.length === 0
                ? 'Click "Add Item" above to add a tool.'
                : `You have ${items.length} item${items.length === 1 ? '' : 's'} total. Try adjusting your search or filter.`}
            </p>
            {items.length > 0 && filteredItems.length === 0 && (
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                {(statusFilter !== 'all' || categoryFilter !== 'all' || searchQuery) && (
                  <button
                    onClick={() => {
                      setStatusFilter('all');
                      setCategoryFilter('all');
                      setSearchQuery('');
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3.5 py-2 text-xs font-medium text-text-secondary transition-all duration-200 hover:bg-surface-tertiary hover:border-border-hover active:scale-[0.98]"
                  >
                    <IconX size={12} />
                    Clear all filters
                  </button>
                )}
              </div>
            )}
          </div>
        ) : (
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
        )}
      </main>
    </div>
  );
}
