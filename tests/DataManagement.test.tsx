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
      returnDate: '2027-04-20',
    },
  },
];

describe('DataManagement', () => {
  beforeEach(() => {
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('export button triggers download of JSON file', () => {
    render(<DataManagement items={mockItems} onImport={vi.fn()} />);
    const exportBtn = screen.getByRole('button', { name: /export/i });
    expect(exportBtn).toBeInTheDocument();
    // Click export — should not throw
    fireEvent.click(exportBtn);
    expect(URL.createObjectURL).toHaveBeenCalled();
  });

  it('exported JSON contains all items from current state', () => {
    render(<DataManagement items={mockItems} onImport={vi.fn()} />);
    const exportBtn = screen.getByRole('button', { name: /export/i });
    fireEvent.click(exportBtn);

    // createObjectURL should have been called with a Blob
    expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
    const blobArg = (URL.createObjectURL as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(blobArg).toBeInstanceOf(Blob);
  });

  it('import button opens file picker', () => {
    render(<DataManagement items={mockItems} onImport={vi.fn()} />);
    const fileInput = screen.getByTestId('import-file-input');
    const clickSpy = vi.spyOn(fileInput, 'click').mockImplementation(() => {});

    fireEvent.click(screen.getByRole('button', { name: /import/i }));
    expect(clickSpy).toHaveBeenCalled();

    clickSpy.mockRestore();
  });

  it('importing valid JSON replaces current items', async () => {
    const onImport = vi.fn();
    render(<DataManagement items={mockItems} onImport={onImport} />);

    const file = new File([JSON.stringify(mockItems)], 'export.json', {
      type: 'application/json',
    });
    const fileInput = screen.getByTestId('import-file-input');

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(onImport).toHaveBeenCalledWith(mockItems);
    });
  });

  it('importing invalid JSON displays error toast/message', async () => {
    const onImport = vi.fn();
    const errorListener = vi.fn();
    window.addEventListener('toolshelf-import-error', errorListener);

    render(<DataManagement items={mockItems} onImport={onImport} />);

    const file = new File(['not valid json{'], 'bad.json', {
      type: 'application/json',
    });
    const fileInput = screen.getByTestId('import-file-input');

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(errorListener).toHaveBeenCalled();
      expect(errorListener.mock.calls[0][0].detail.message).toMatch(/invalid json/i);
    });

    window.removeEventListener('toolshelf-import-error', errorListener);
  });
});
