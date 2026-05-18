import { useState, useEffect, useRef, memo, type FormEvent, type KeyboardEvent } from 'react';
import type { ToolItem, ItemCategory, ItemCondition } from '../types';
import { getItemStatus, CATEGORIES, CONDITIONS } from '../types';
import { BorrowForm } from './BorrowForm';
import { IconCategory, IconUser, IconUsers, IconEdit, IconTrash, IconCheckSquare } from './Icon';

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

export const ItemCard = memo(function ItemCard({ item, onBorrow, onReturn, onDelete, onUpdate }: ItemCardProps) {
  const [showBorrowForm, setShowBorrowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editName, setEditName] = useState(item.name);
  const [editCategory, setEditCategory] = useState<ItemCategory>(item.category);
  const [editCondition, setEditCondition] = useState<ItemCondition>(item.condition);
  const [editNotes, setEditNotes] = useState(item.notes);
  const [editError, setEditError] = useState('');
  const editNameRef = useRef<HTMLInputElement>(null);
  const confirmDeleteRef = useRef<HTMLDivElement>(null);

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

  // Auto-focus confirm delete dialog
  useEffect(() => {
    if (confirmDelete && confirmDeleteRef.current) {
      const firstButton = confirmDeleteRef.current.querySelector('button');
      firstButton?.focus();
    }
  }, [confirmDelete]);

  const status = getItemStatus(item);

  const handleBorrow = (data: { borrowerName: string; returnDate: string }) => {
    onBorrow(item.id, data);
    setShowBorrowForm(false);
  };

  const handleEditSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) {
      setEditError('Item name is required');
      return;
    }
    onUpdate(item.id, {
      name: editName.trim(),
      category: editCategory,
      condition: editCondition,
      notes: editNotes,
    });
    setIsEditing(false);
    setEditError('');
  };

  const handleCancelEdit = () => {
    setEditName(item.name);
    setEditCategory(item.category);
    setEditCondition(item.condition);
    setEditNotes(item.notes);
    setIsEditing(false);
    setEditError('');
  };

  const handleEditKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleCancelEdit();
    }
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

  const handleDeleteKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setConfirmDelete(false);
    }
  };

  const handleBorrowKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowBorrowForm(false);
    }
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
      <div className="rounded-xl border border-brand/20 bg-surface p-5 shadow-sm ring-1 ring-brand/10 animate-slide-down" onKeyDown={handleEditKeyDown}>
        <form onSubmit={handleEditSubmit} className="space-y-3">
          <div>
            <label htmlFor={`edit-name-${item.id}`} className="mb-1.5 block text-xs font-medium text-text-secondary">Name</label>
            <input
              id={`edit-name-${item.id}`}
              type="text"
              ref={editNameRef}
              value={editName}
              onChange={(e) => {
                setEditName(e.target.value);
                setEditError('');
              }}
              aria-invalid={editError ? 'true' : undefined}
              aria-describedby={editError ? `edit-error-${item.id}` : undefined}
              className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-text-primary transition-all duration-200 hover:border-border-hover focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            />
            {editError && <p id={`edit-error-${item.id}`} className="mt-1.5 flex items-center gap-1 text-xs font-medium text-brand" role="alert"><span aria-hidden="true">⚠</span> {editError}</p>}
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
              <IconCategory size={12} className="mr-1 text-text-tertiary" />
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
          <IconUser size={14} className="text-text-tertiary" />
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
        <div className="mt-4 animate-slide-down" onKeyDown={handleBorrowKeyDown}>
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
              <IconUsers size={14} />
              Lend Out
            </button>
          )}
          {status !== 'available' && (
            <button
              onClick={() => onReturn(item.id)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3.5 py-2.5 text-xs font-semibold text-white shadow-sm transition-all duration-200 hover:bg-emerald-600 hover:shadow-sm active:scale-[0.97]"
              aria-label={`Return ${item.name}`}
            >
              <IconCheckSquare size={14} />
              Return
            </button>
          )}
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3.5 py-2.5 text-xs font-medium text-text-secondary transition-all duration-200 hover:bg-surface-tertiary hover:border-border-hover active:scale-[0.97]"
            aria-label={`Edit ${item.name}`}
          >
            <IconEdit size={14} />
            Edit
          </button>
          {confirmDelete ? (
            <div
              ref={confirmDeleteRef}
              role="alertdialog"
              aria-label="Confirm deletion"
              className="flex items-center gap-2 animate-fade-in"
              onKeyDown={handleDeleteKeyDown}
            >
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
              <IconTrash size={14} />
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
});
