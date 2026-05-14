import { useState, useRef } from 'react';
import type { ToolItem, ItemCategory, ItemCondition } from '../types';

const VALID_CATEGORIES: Set<string> = new Set(['Power Tools', 'Hand Tools', 'Garden', 'Household']);
const VALID_CONDITIONS: Set<string> = new Set(['Excellent', 'Good', 'Fair', 'Poor']);

function isValidItem(value: unknown): value is ToolItem {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  if (typeof obj.id !== 'string' || !obj.id) return false;
  if (typeof obj.name !== 'string' || !obj.name) return false;
  if (typeof obj.category !== 'string' || !VALID_CATEGORIES.has(obj.category)) return false;
  if (typeof obj.condition !== 'string' || !VALID_CONDITIONS.has(obj.condition)) return false;
  if (typeof obj.notes !== 'string') return false;
  // borrow can be null or a valid BorrowRecord
  if (obj.borrow !== null && obj.borrow !== undefined) {
    if (typeof obj.borrow !== 'object') return false;
    const borrow = obj.borrow as Record<string, unknown>;
    if (typeof borrow.borrowerName !== 'string' || !borrow.borrowerName) return false;
    if (typeof borrow.borrowDate !== 'string') return false;
    if (borrow.returnDate !== undefined && borrow.returnDate !== null && typeof borrow.returnDate !== 'string') return false;
  }
  return true;
}

interface DataManagementProps {
  items: ToolItem[];
  onImport: (items: ToolItem[]) => void;
  onExport: (items: ToolItem[]) => void;
}

export function DataManagement({ items, onImport, onExport }: DataManagementProps) {
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    onExport(items);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const raw = JSON.parse(event.target?.result as string);
        if (!Array.isArray(raw)) {
          setError('Invalid JSON file: expected an array of items');
          return;
        }
        // Validate each item has the correct shape
        const validItems: ToolItem[] = [];
        for (let i = 0; i < raw.length; i++) {
          if (isValidItem(raw[i])) {
            validItems.push(raw[i]);
          } else {
            setError(`Invalid item at position ${i + 1}: missing or invalid fields`);
            return;
          }
        }
        onImport(validItems);
      } catch {
        setError('Invalid JSON file');
      }
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <button
        onClick={handleExport}
        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2.5 text-xs font-medium text-text-secondary transition-all duration-200 hover:bg-surface-tertiary hover:border-border-hover active:scale-[0.97]"
        aria-label="Export items as JSON"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        Export
      </button>

      <input
        id="import-file-input"
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        onChange={handleImport}
        className="hidden"
        data-testid="import-file-input"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2.5 text-xs font-medium text-text-secondary transition-all duration-200 hover:bg-surface-tertiary hover:border-border-hover active:scale-[0.97]"
        aria-label="Import items from JSON file"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        Import
      </button>

      {error && (
        <p className="ml-1 text-xs font-medium text-brand" role="alert">{error}</p>
      )}
    </div>
  );
}
