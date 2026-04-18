import { useState, useRef, useEffect, type FormEvent } from 'react';

interface BorrowFormProps {
  onBorrow: (data: { borrowerName: string; returnDate: string }) => void;
  onCancel: () => void;
}

export function BorrowForm({ onBorrow, onCancel }: BorrowFormProps) {
  const [borrowerName, setBorrowerName] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [error, setError] = useState('');
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus borrower name on mount
  useEffect(() => {
    if (nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!borrowerName.trim()) {
      setError('Borrower name is required');
      return;
    }
    onBorrow({ borrowerName: borrowerName.trim(), returnDate });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-lg border border-amber-200 bg-amber-50/50 p-3.5">
      <div>
        <label htmlFor="borrower-name" className="mb-1.5 block text-xs font-medium text-text-secondary">
          Borrower name <span className="text-brand">*</span>
        </label>
        <input
          id="borrower-name"
          type="text"
          ref={nameInputRef}
          value={borrowerName}
          onChange={(e) => {
            setBorrowerName(e.target.value);
            setError('');
          }}
          className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-text-primary transition-all duration-200 placeholder:text-text-tertiary hover:border-border-hover focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
          placeholder="Who is borrowing?"
          aria-label="Borrower name"
          aria-required="true"
        />
      </div>
      <div>
        <label htmlFor="return-date" className="mb-1.5 block text-xs font-medium text-text-secondary">
          Return date <span className="text-text-tertiary">(optional)</span>
        </label>
        <input
          id="return-date"
          type="date"
          value={returnDate}
          onChange={(e) => setReturnDate(e.target.value)}
          className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-text-primary transition-all duration-200 hover:border-border-hover focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
          aria-label="Return date"
        />
      </div>
      {error && <p className="flex items-center gap-1 text-xs font-medium text-brand" role="alert"><span aria-hidden="true">⚠</span> {error}</p>}
      <div className="flex gap-2 pt-0.5">
        <button
          type="submit"
          className="rounded-lg bg-amber-500 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition-all duration-200 hover:bg-amber-600 active:scale-[0.97]"
        >
          Confirm Lend
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-border bg-surface px-3.5 py-2 text-xs font-medium text-text-secondary transition-all duration-200 hover:bg-surface-tertiary active:scale-[0.97]"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
