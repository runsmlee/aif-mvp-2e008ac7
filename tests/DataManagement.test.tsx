import { render, screen, fireEvent } from '@testing-library/react';
import { DataManagement } from '../src/components/DataManagement';
import type { ToolItem } from '../src/types';

const mockItems: ToolItem[] = [
  { id: '1', name: 'Power Drill', category: 'Power Tools', condition: 'Good', notes: '', borrow: null },
  { id: '2', name: 'Hammer', category: 'Hand Tools', condition: 'Excellent', notes: '', borrow: { borrowerName: 'Maria', borrowDate: '2026-04-10', returnDate: '2026-05-20' } },
  { id: '3', name: 'Wrench', category: 'Hand Tools', condition: 'Fair', notes: 'Adjustable', borrow: null },
];

describe('DataManagement', () => {
  it('export button triggers download of JSON file', () => {
    const onExport = vi.fn();
    const onImport = vi.fn();
    render(<DataManagement items={mockItems} onExport={onExport} onImport={onImport} />);

    const exportBtn = screen.getByLabelText(/export items as json/i);
    fireEvent.click(exportBtn);
    expect(onExport).toHaveBeenCalledWith(mockItems);
  });

  it('exported JSON contains all items from current state', () => {
    const onExport = vi.fn();
    const onImport = vi.fn();
    render(<DataManagement items={mockItems} onExport={onExport} onImport={onImport} />);

    fireEvent.click(screen.getByLabelText(/export items as json/i));
    expect(onExport).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ id: '1', name: 'Power Drill' }),
        expect.objectContaining({ id: '2', name: 'Hammer' }),
        expect.objectContaining({ id: '3', name: 'Wrench' }),
      ])
    );
  });

  it('import button opens file picker', () => {
    const onExport = vi.fn();
    const onImport = vi.fn();
    render(<DataManagement items={mockItems} onExport={onExport} onImport={onImport} />);

    const fileInput = screen.getByTestId('import-file-input');
    expect(fileInput).toBeInTheDocument();
    expect(fileInput).toHaveAttribute('type', 'file');
    expect(fileInput).toHaveAttribute('accept', '.json,application/json');
  });

  it('importing valid JSON replaces current items', async () => {
    const onExport = vi.fn();
    const onImport = vi.fn();
    render(<DataManagement items={mockItems} onExport={onExport} onImport={onImport} />);

    const validJson = JSON.stringify([
      { id: '10', name: 'Saw', category: 'Hand Tools', condition: 'Good', notes: '', borrow: null },
    ]);
    const file = new File([validJson], 'export.json', { type: 'application/json' });
    const fileInput = screen.getByTestId('import-file-input');

    fireEvent.change(fileInput, { target: { files: [file] } });

    // Wait for async FileReader to complete
    const { act } = await import('react');
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    expect(onImport).toHaveBeenCalledWith([
      expect.objectContaining({ id: '10', name: 'Saw' }),
    ]);
  });

  it('importing invalid JSON displays error message', async () => {
    const onExport = vi.fn();
    const onImport = vi.fn();
    render(<DataManagement items={mockItems} onExport={onExport} onImport={onImport} />);

    const invalidJson = 'this is not json';
    const file = new File([invalidJson], 'bad.json', { type: 'application/json' });
    const fileInput = screen.getByTestId('import-file-input');

    fireEvent.change(fileInput, { target: { files: [file] } });

    const { act } = await import('react');
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    expect(screen.getByRole('alert')).toHaveTextContent(/invalid json/i);
    expect(onImport).not.toHaveBeenCalled();
  });
});
