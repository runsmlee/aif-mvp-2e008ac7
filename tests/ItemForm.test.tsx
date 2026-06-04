import { render, screen, fireEvent } from '@testing-library/react';
import { ItemForm } from '../src/components/ItemForm';

describe('ItemForm', () => {
  it('renders all input fields (name, category, condition) and submit button', () => {
    render(<ItemForm onAdd={vi.fn()} />);
    expect(screen.getByLabelText(/Item name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Category/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Condition/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument();
  });

  it('submits a valid item and calls onAdd callback with correct data', () => {
    const onAdd = vi.fn();
    render(<ItemForm onAdd={onAdd} />);
    fireEvent.change(screen.getByLabelText(/Item name/i), {
      target: { value: 'Power Drill' },
    });
    fireEvent.change(screen.getByLabelText(/Category/i), {
      target: { value: 'Power Tools' },
    });
    fireEvent.change(screen.getByLabelText(/Condition/i), {
      target: { value: 'Good' },
    });
    fireEvent.click(screen.getByRole('button', { name: /add/i }));
    expect(onAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Power Drill',
        category: 'Power Tools',
        condition: 'Good',
      })
    );
  });

  it('shows validation error when item name is empty on submit', () => {
    render(<ItemForm onAdd={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /add/i }));
    expect(screen.getByText(/Item name is required/i)).toBeInTheDocument();
  });

  it('resets the form after successful submission', () => {
    render(<ItemForm onAdd={vi.fn()} />);
    fireEvent.change(screen.getByLabelText(/Item name/i), {
      target: { value: 'Power Drill' },
    });
    fireEvent.click(screen.getByRole('button', { name: /add/i }));
    expect(screen.getByLabelText(/Item name/i)).toHaveValue('');
  });
});
