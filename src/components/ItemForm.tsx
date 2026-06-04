import { useState, useRef, useEffect, type FormEvent } from 'react';
import { CATEGORIES, CONDITIONS, generateId } from '../types';
import type { ToolItem, ItemCategory, ItemCondition } from '../types';

interface ItemFormProps {
  onAdd: (item: ToolItem) => void;
  onCancel?: () => void;
}

export function ItemForm({ onAdd, onCancel }: ItemFormProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ItemCategory>('Power Tools');
  const [condition, setCondition] = useState<ItemCondition>('Good');
  const [error, setError] = useState('');
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus item name on mount
  useEffect(() => {
    if (nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Item name is required');
      return;
    }
    onAdd({
      id: generateId(),
      name: name.trim(),
      category,
      condition,
      borrow: null,
    });
    setName('');
    setError('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-border bg-surface p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-text-primary">Add New Item</h3>

      <div>
        <label htmlFor="item-name" className="mb-1.5 block text-xs font-medium text-text-secondary">
          Item name <span className="text-brand">*</span>
        </label>
        <input
          id="item-name"
          type="text"
          ref={nameInputRef}
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError('');
          }}
          className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-text-primary transition-all duration-200 placeholder:text-text-tertiary hover:border-border-hover focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
          placeholder="e.g., Power Drill"
          aria-label="Item name"
          aria-required="true"
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? 'item-name-error' : undefined}
        />
        {error && <p id="item-name-error" className="mt-1.5 flex items-center gap-1 text-xs font-medium text-brand" role="alert"><span aria-hidden="true">⚠</span> {error}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="item-category" className="mb-1.5 block text-xs font-medium text-text-secondary">
            Category
          </label>
          <select
            id="item-category"
            value={category}
            onChange={(e) => setCategory(e.target.value as ItemCategory)}
            className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-text-primary transition-all duration-200 hover:border-border-hover focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            aria-label="Category"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="item-condition" className="mb-1.5 block text-xs font-medium text-text-secondary">
            Condition
          </label>
          <select
            id="item-condition"
            value={condition}
            onChange={(e) => setCondition(e.target.value as ItemCondition)}
            className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-text-primary transition-all duration-200 hover:border-border-hover focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            aria-label="Condition"
          >
            {CONDITIONS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          className="flex-1 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-brand/20 transition-all duration-200 hover:bg-brand-dark hover:shadow-md hover:shadow-brand/25 active:scale-[0.98]"
        >
          Add Item
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-medium text-text-secondary transition-all duration-200 hover:bg-surface-tertiary active:scale-[0.98]"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
