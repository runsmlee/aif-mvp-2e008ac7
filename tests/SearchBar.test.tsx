import { render, screen, fireEvent } from '@testing-library/react';
import { SearchBar } from '../src/components/SearchBar';

describe('SearchBar', () => {
  it('renders search input', () => {
    render(<SearchBar onSearch={vi.fn()} />);
    expect(screen.getByPlaceholderText('Search items...')).toBeInTheDocument();
  });

  it('calls onSearch callback on each keystroke', () => {
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);
    const input = screen.getByPlaceholderText('Search items...');
    fireEvent.change(input, { target: { value: 'drill' } });
    expect(onSearch).toHaveBeenCalledWith('drill');
  });

  it('shows clear button when input has value', () => {
    render(<SearchBar onSearch={vi.fn()} value="drill" />);
    expect(screen.getByLabelText('Clear search')).toBeInTheDocument();
  });

  it('clicking clear button resets search and calls onSearch with empty string', () => {
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} value="drill" />);
    const clearButton = screen.getByLabelText('Clear search');
    fireEvent.click(clearButton);
    expect(onSearch).toHaveBeenCalledWith('');
  });
});
