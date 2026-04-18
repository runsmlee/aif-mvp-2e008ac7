import { useState, useEffect, useRef, type FormEvent } from 'react';
import type { ToolItem, ItemCategory, ItemCondition } from '../types';
import { getItemStatus, CATEGORIES, CONDITIONS } from '../types';
import { BorrowForm } from './BorrowForm';

interface ItemCardProps {
  item: ToolItem;
  onBorrow: (id: string, data: { borrowerName: string; returnDate: string }) => void;
  onReturn: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<ToolItem>) => void;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function ItemCard({ item, onBorrow, onReturn, onDelete, onUpdate }: ItemCardProps) {
  const [showBorrowForm, setShowBorrowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editName, setEditName] = useState(item.name);
  const [editCategory, setEditCategory] = useState<ItemCategory>(item.category);
  const [editCondition, setEditCondition] = useState<ItemCondition>(item.condition);
  const [editNotes, setEditNotes] = useState(item.notes);
  const editNameRef = useRef<HTMLInputElement>(null);

  // Sync edit state when item prop changes
  useEffect(() => {
    setEditName(item.name);
    setEditCategory(item.category);
    setEditCondition(item.condition);
    setEditNotes(item.notes);
  }, [item.name, item.category, item.condition, item.notes]);

  // Auto-focus edit name input
  useEffect(() => {
    if (isEditing && editNameRef.current) {
      editNameRef.current.focus();
    }
  }, [isEditing]);

  const status = getItemStatus(item);

  const handleBorrow = (data: { borrowerName: string; returnDate: string }) => {
    onBorrow(item.id, data);
    setShowBorrowForm(false);
  };

  const handleEditSubmit = (e: FormEvent) => {
    e.preventDefault();
    onUpdate(item.id, {
      name: editName,
      category: editCategory,
      condition: editCondition,
      notes: editNotes,
    });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditName(item.name);
    setEditCategory(item.category);
    setEditCondition(item.condition);
    setEditNotes(item.notes);
    setIsEditing(false);
  };

  const handleDeleteClick = () => {
    setConfirmDelete(true);
  };

  const handleConfirmDelete = () => {
    onDelete(item.id);
  };

  const handleCancelDelete = () => {
    setConfirmDelete(false);
  };

  const statusBadge = () => {
    if (status === 'available') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
          Available
        </span>
      );
    }
    if (status === 'overdue') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20">
          <span className="h-1.5 w-1.5 rounded-full bg-red-500" aria-hidden="true" />
          Overdue
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" aria-hidden="true" />
        Lent
      </span>
    );
  };

  if (isEditing) {
    return (
      <div className="rounded-xl border border-brand/20 bg-surface p-5 shadow-sm ring-1 ring-brand/10 animate-slide-down">
        <form onSubmit={handleEditSubmit} className="space-y-3">
          <div>
            <label htmlFor={`edit-name-${item.id}`} className="mb-1.5 block text-xs font-medium text-text-secondary">Name</label>
            <input
              id={`edit-name-${item.id}`}
              type="text"
              ref={editNameRef}
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-text-primary transition-all duration-200 hover:border-border-hover focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor={`edit-cat-${item.id}`} className="mb-1.5 block text-xs font-medium text-text-secondary">Category</label>
              <select
                id={`edit-cat-${item.id}`}
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value as ItemCategory)}
                className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-text-primary transition-all duration-200 hover:border-border-hover focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor={`edit-cond-${item.id}`} className="mb-1.5 block text-xs font-medium text-text-secondary">Condition</label>
              <select
                id={`edit-cond-${item.id}`}
                value={editCondition}
                onChange={(e) => setEditCondition(e.target.value as ItemCondition)}
                className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-text-primary transition-all duration-200 hover:border-border-hover focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              >
                {CONDITIONS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label htmlFor={`edit-notes-${item.id}`} className="mb-1.5 block text-xs font-medium text-text-secondary">Notes</label>
            <textarea
              id={`edit-notes-${item.id}`}
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-text-primary transition-all duration-200 hover:border-border-hover focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 resize-none"
            />
          </div>
          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-brand-dark active:scale-[0.98]"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={handleCancelEdit}
              className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-text-secondary transition-all duration-200 hover:bg-surface-tertiary active:scale-[0.98]"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="card-hover rounded-xl border border-border bg-surface p-4 shadow-sm sm:p-5" role="article" aria-label={`Item: ${item.name}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-text-primary">{item.name}</h3>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center text-xs text-text-secondary">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 text-text-tertiary" aria-hidden="true">
                <path d="M20 7h-9M3 7h2M6 7V5a2 2 0 0 1 2-2h1V3m0 4v4m0 0H5a2 2 0 0 0-2 2v3h7m0-5v5m0 0h2m-2 0v1a2 2 0 0 1-2 2H5v1m14-3a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2" />
              </svg>
              {item.category}
            </span>
            <span className="text-text-tertiary" aria-hidden="true">·</span>
            <span className="text-xs text-text-secondary">{item.condition}</span>
          </div>
          {item.notes && <p className="mt-2 text-xs leading-relaxed text-text-tertiary">{item.notes}</p>}
        </div>
        {statusBadge()}
      </div>

      {item.borrow && (
        <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-surface-tertiary px-3 py-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-tertiary" aria-hidden="true">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <span className="text-xs text-text-secondary">
            Lent to <span className="font-medium">{item.borrow.borrowerName}</span>
          </span>
          {item.borrow.returnDate && (
            <>
              <span className="text-text-tertiary" aria-hidden="true">·</span>
              <span className={`text-xs ${status === 'overdue' ? 'font-medium text-red-600' : 'text-text-tertiary'}`}>
                Due {formatDate(item.borrow.returnDate)}
              </span>
            </>
          )}
        </div>
      )}

      {showBorrowForm ? (
        <div className="mt-4 animate-slide-down">
          <BorrowForm onBorrow={handleBorrow} onCancel={() => setShowBorrowForm(false)} />
        </div>
      ) : (
        <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
          {status === 'available' && (
            <button
              onClick={() => setShowBorrowForm(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-3.5 py-2.5 text-xs font-semibold text-white shadow-sm transition-all duration-200 hover:bg-amber-600 hover:shadow-sm active:scale-[0.97]"
              aria-label={`Borrow ${item.name}`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              Lend Out
            </button>
          )}
          {status !== 'available' && (
            <button
              onClick={() => onReturn(item.id)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3.5 py-2.5 text-xs font-semibold text-white shadow-sm transition-all duration-200 hover:bg-emerald-600 hover:shadow-sm active:scale-[0.97]"
              aria-label={`Return ${item.name}`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="9 11 12 14 22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
              Return
            </button>
          )}
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3.5 py-2.5 text-xs font-medium text-text-secondary transition-all duration-200 hover:bg-surface-tertiary hover:border-border-hover active:scale-[0.97]"
            aria-label={`Edit ${item.name}`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Edit
          </button>
          {confirmDelete ? (
            <div className="flex items-center gap-2 animate-fade-in">
              <span className="text-xs text-red-600 font-medium">Delete?</span>
              <button
                onClick={handleConfirmDelete}
                aria-label="Confirm delete"
                className="inline-flex items-center gap-1 rounded-lg bg-red-500 px-3 py-2.5 text-xs font-semibold text-white transition-all duration-200 hover:bg-red-600 active:scale-[0.97]"
              >
                Yes
              </button>
              <button
                onClick={handleCancelDelete}
                aria-label="Cancel"
                className="inline-flex items-center gap-1 rounded-lg border border-border bg-surface px-3 py-2.5 text-xs font-medium text-text-secondary transition-all duration-200 hover:bg-surface-tertiary active:scale-[0.97]"
              >
                No
              </button>
            </div>
          ) : (
            <button
              onClick={handleDeleteClick}
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-600 transition-all duration-200 hover:bg-red-100 hover:border-red-300 active:scale-[0.97]"
              aria-label={`Delete ${item.name}`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}
