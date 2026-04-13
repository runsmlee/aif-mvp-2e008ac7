import type { ChangeEvent } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  value?: string;
}

export function SearchBar({ onSearch, value = '' }: SearchBarProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onSearch(e.target.value);
  };

  const handleClear = () => {
    onSearch('');
  };

  return (
    <div className="relative">
      <label htmlFor="search-input" className="sr-only">
        Search items
      </label>
      <svg
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
      <input
        id="search-input"
        type="text"
        placeholder="Search items..."
        value={value}
        onChange={handleChange}
        className="w-full rounded-lg border border-border bg-surface py-2.5 pl-9 pr-10 text-sm text-text-primary placeholder:text-text-tertiary transition-all duration-200 hover:border-border-hover focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 focus:bg-surface"
        aria-label="Search items"
      />
      {value && (
        <button
          onClick={handleClear}
          aria-label="Clear search"
          className="absolute right-2.5 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded text-text-tertiary transition-colors duration-150 hover:bg-surface-tertiary hover:text-text-secondary"
          type="button"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
