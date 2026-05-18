import { forwardRef, type ChangeEvent } from 'react';
import { IconSearch, IconX } from './Icon';

interface SearchBarProps {
  onSearch: (query: string) => void;
  value?: string;
}

export const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(function SearchBar(
  { onSearch, value = '' },
  ref
) {
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
      <IconSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
      <input
        ref={ref}
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
          <IconX size={12} />
        </button>
      )}
    </div>
  );
});
