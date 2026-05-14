import { useState, useMemo, useCallback, useEffect, useRef, Component, type ReactNode, type ErrorInfo } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { ToastProvider, useToast } from './hooks/useToast';
import { Dashboard } from './components/Dashboard';
import { SearchBar } from './components/SearchBar';
import { ItemForm } from './components/ItemForm';
import { ItemCard } from './components/ItemCard';
import { DataManagement } from './components/DataManagement';
import type { ToolItem, StatusFilter, ItemCategory } from './types';
import { getItemStatus } from './types';

type SortOption = 'newest' | 'oldest' | 'name-asc' | 'name-desc' | 'status';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

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
  const [items, setItems] = useLocalStorage<ToolItem[]>('toolshelf-items', []);
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
          const statusOrder: Record<string, number> = { overdue: 0, lent: 1, available: 2 };
          return statusOrder[getItemStatus(a)] - statusOrder[getItemStatus(b)];
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
                  returnDate: data.returnDate,
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

  const handlePrint = useCallback(() => {
    const availableItems = items.filter((item) => getItemStatus(item) === 'available');
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>ToolShelf — Available Items</title>
          <style>
            body { font-family: system-ui, sans-serif; padding: 2rem; max-width: 600px; margin: 0 auto; }
            h1 { font-size: 1.5rem; margin-bottom: 0.5rem; }
            p.subtitle { color: #666; margin-bottom: 1.5rem; font-size: 0.875rem; }
            table { width: 100%; border-collapse: collapse; }
            th, td { text-align: left; padding: 0.5rem 0; border-bottom: 1px solid #eee; font-size: 0.875rem; }
            th { font-weight: 600; color: #374151; }
            .footer { margin-top: 2rem; padding-top: 1rem; border-top: 2px solid #EF4444; text-align: center; color: #666; font-size: 0.75rem; }
            @media print { body { padding: 1rem; } }
          </style>
        </head>
        <body>
          <h1>🔧 ToolShelf — Available Items</h1>
          <p class="subtitle">Generated on ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          ${availableItems.length > 0 ? `
            <table>
              <thead><tr><th>Item</th><th>Category</th><th>Condition</th></tr></thead>
              <tbody>
                ${availableItems.map((item) => `<tr><td>${escapeHtml(item.name)}</td><td>${escapeHtml(item.category)}</td><td>${escapeHtml(item.condition)}</td></tr>`).join('')}
              </tbody>
            </table>
          ` : '<p>No items currently available.</p>'}
          <div class="footer">ToolShelf — Neighborhood Tool Sharing</div>
          <script>window.onload = function() { window.print(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }, [items]);

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
            <div>
              <h1 className="text-lg font-bold leading-tight tracking-tight text-text-primary">
                ToolShelf
              </h1>
              <p className="text-xs leading-tight text-text-tertiary">Share tools with your neighbors</p>
            </div>
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
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M8 3v10M3 8h10" />
              </svg>
              Add Item
            </button>
          )}
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-medium text-text-secondary transition-all duration-200 hover:bg-surface-tertiary hover:border-border-hover active:scale-[0.98]"
            aria-label="Print available items"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" />
            </svg>
            Print
          </button>
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
              {items.length === 0 ? 'No items yet' : `No items match your filter`}
            </p>
            <p className="mt-1 text-sm text-text-tertiary">
              {items.length === 0
                ? 'Add your first tool to get started sharing with neighbors.'
                : `You have ${items.length} item${items.length === 1 ? '' : 's'} total. Try adjusting your search or filter.`}
            </p>
            {items.length === 0 && !showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-brand/20 transition-all duration-200 hover:bg-brand-dark hover:shadow-md hover:shadow-brand/25 active:scale-[0.98]"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M8 3v10M3 8h10" />
                </svg>
                Add Your First Tool
              </button>
            )}
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
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
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

      {/* Footer */}
      <footer className="mt-auto border-t border-border bg-surface px-4 py-5 sm:px-6">
        <div className="mx-auto max-w-2xl flex flex-col items-center gap-2 sm:flex-row sm:justify-between">
          <p className="text-xs text-text-tertiary">
            ToolShelf — Neighborhood Tool Sharing
          </p>
          <p className="flex items-center gap-1.5 text-xs text-text-tertiary">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-success">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            Your data stays in your browser. Nothing leaves unless you export it.
          </p>
        </div>
      </footer>
    </div>
  );
}
