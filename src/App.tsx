import { useState, useMemo, useCallback } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Dashboard } from './components/Dashboard';
import { SearchBar } from './components/SearchBar';
import { ItemForm } from './components/ItemForm';
import { ItemCard } from './components/ItemCard';
import { DataManagement } from './components/DataManagement';
import type { ToolItem, StatusFilter } from './types';
import { getItemStatus } from './types';

export function App() {
  const [items, setItems] = useLocalStorage<ToolItem[]>('toolshelf-items', []);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Status filter
      if (statusFilter !== 'all' && getItemStatus(item) !== statusFilter) {
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
  }, [items, statusFilter, searchQuery]);

  const handleAddItem = useCallback(
    (item: ToolItem) => {
      setItems((prev) => [...prev, item]);
      setShowForm(false);
    },
    [setItems]
  );

  const handleBorrow = useCallback(
    (id: string, data: { borrowerName: string; returnDate: string }) => {
      setItems((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                borrow: {
                  borrowerName: data.borrowerName,
                  borrowDate: new Date().toISOString().split('T')[0],
                  returnDate: data.returnDate,
                },
              }
            : item
        )
      );
    },
    [setItems]
  );

  const handleReturn = useCallback(
    (id: string) => {
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, borrow: null } : item))
      );
    },
    [setItems]
  );

  const handleDelete = useCallback(
    (id: string) => {
      setItems((prev) => prev.filter((item) => item.id !== id));
    },
    [setItems]
  );

  const handleUpdate = useCallback(
    (id: string, updates: Partial<ToolItem>) => {
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
      );
    },
    [setItems]
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
    },
    []
  );

  const handleImport = useCallback(
    (data: ToolItem[]) => {
      setItems(data);
    },
    [setItems]
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
                ${availableItems.map((item) => `<tr><td>${item.name}</td><td>${item.category}</td><td>${item.condition}</td></tr>`).join('')}
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
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Dashboard items={items} onFilter={setStatusFilter} activeFilter={statusFilter} />
          <div className="w-full sm:w-64">
            <SearchBar onSearch={setSearchQuery} value={searchQuery} />
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
              {items.length === 0 ? 'No items yet' : 'No matching items'}
            </p>
            <p className="mt-1 text-sm text-text-tertiary">
              {items.length === 0
                ? 'Add your first tool to get started sharing with neighbors.'
                : 'Try adjusting your search or filter.'}
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
