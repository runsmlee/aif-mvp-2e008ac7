import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DataManagement } from '../src/components/DataManagement';
import type { ToolItem } from '../src/types';

const mockItems: ToolItem[] = [
  {
    id: '1',
    name: 'Power Drill',
    category: 'Power Tools',
    condition: 'Good',
    notes: 'Cordless',
    borrow: null,
  },
  {
    id: '2',
    name: 'Hammer',
    category: 'Hand Tools',
    condition: 'Excellent',
    notes: '',
    borrow: {
      borrowerName: 'Maria',
      borrowDate: '2026-04-10',
      returnDate: '2026-04-20',
    },
  },
];

describe('DataManagement', () => {
  beforeEach(() => {
    // Mock URL.createObjectURL and URL.revokeObjectURL
    global.URL.createObjectURL = vi.fn(() => 'blob:test');
    global.URL.revokeObjectURL = vi.fn();
  });

  it('export button triggers download of JSON file', () => {
    const onExport = vi.fn();
    render(<DataManagement items={mockItems} onImport={vi.fn()} onExport={onExport} />);
    fireEvent.click(screen.getByRole('button', { name: /export/i }));
    expect(onExport).toHaveBeenCalled();
  });

  it('exported JSON contains all items from current state', () => {
    const onExport = vi.fn();
    render(<DataManagement items={mockItems} onImport={vi.fn()} onExport={onExport} />);
    fireEvent.click(screen.getByRole('button', { name: /export/i }));
    expect(onExport).toHaveBeenCalledWith(mockItems);
  });

  it('import button opens file picker', () => {
    render(<DataManagement items={mockItems} onImport={vi.fn()} onExport={vi.fn()} />);
    const importInput = document.getElementById('import-file-input') as HTMLInputElement;
    expect(importInput).toBeInTheDocument();
    expect(importInput.type).toBe('file');
    expect(importInput).toHaveClass('hidden');
  });

  it('importing valid JSON replaces current items', async () => {
    const onImport = vi.fn();
    render(<DataManagement items={[]} onImport={onImport} onExport={vi.fn()} />);
    const importInput = document.getElementById('import-file-input') as HTMLInputElement;
    const file = new File([JSON.stringify(mockItems)], 'tools.json', { type: 'application/json' });
    fireEvent.change(importInput, { target: { files: [file] } });
    await waitFor(() => {
      expect(onImport).toHaveBeenCalledWith(mockItems);
    });
  });

  it('importing invalid JSON displays error toast/message', async () => {
    render(<DataManagement items={[]} onImport={vi.fn()} onExport={vi.fn()} />);
    const importInput = document.getElementById('import-file-input') as HTMLInputElement;
    const file = new File(['not-valid-json'], 'bad.json', { type: 'application/json' });
    fireEvent.change(importInput, { target: { files: [file] } });
    await waitFor(() => {
      expect(screen.getByText(/Invalid JSON file/i)).toBeInTheDocument();
    });
  });
});
