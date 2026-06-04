import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DataManagement } from '../src/components/DataManagement';
import type { ToolItem } from '../src/types';

const mockItems: ToolItem[] = [
  {
    id: '1',
    name: 'Power Drill',
    category: 'Power Tools',
    condition: 'Good',
    borrow: null,
  },
  {
    id: '2',
    name: 'Hammer',
    category: 'Hand Tools',
    condition: 'Excellent',
    borrow: {
      borrowerName: 'Maria',
      borrowDate: '2026-04-10',
      returnDate: '2027-04-20',
    },
  },
];

describe('DataManagement', () => {
  it('renders export and import buttons', () => {
    render(<DataManagement items={mockItems} onImport={vi.fn()} onError={vi.fn()} />);
    expect(screen.getByRole('button', { name: /export/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /import/i })).toBeInTheDocument();
  });

  it('export button creates JSON blob with all items', () => {
    // Mock URL APIs only
    const mockUrl = 'blob:http://localhost/mock';
    global.URL.createObjectURL = vi.fn(() => mockUrl);
    global.URL.revokeObjectURL = vi.fn();

    render(<DataManagement items={mockItems} onImport={vi.fn()} onError={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: /export/i }));

    expect(global.URL.createObjectURL).toHaveBeenCalledTimes(1);
    const blob = global.URL.createObjectURL.mock.calls[0][0] as Blob;
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe('application/json');

    // Read the blob content to verify it contains our items
    return blob.text().then((text) => {
      const parsed = JSON.parse(text);
      expect(parsed).toHaveLength(2);
      expect(parsed[0].name).toBe('Power Drill');
      expect(parsed[1].name).toBe('Hammer');
    });
  });

  it('import button opens file picker by clicking hidden file input', () => {
    render(<DataManagement items={mockItems} onImport={vi.fn()} onError={vi.fn()} />);

    const fileInput = screen.getByTestId('import-file-input');
    const clickSpy = vi.spyOn(fileInput, 'click');

    fireEvent.click(screen.getByRole('button', { name: /import/i }));

    expect(clickSpy).toHaveBeenCalled();
  });

  it('importing valid JSON calls onImport with parsed items', async () => {
    const onImport = vi.fn();
    render(<DataManagement items={mockItems} onImport={onImport} onError={vi.fn()} />);

    const fileInput = screen.getByTestId('import-file-input');

    const validJson = JSON.stringify(mockItems);
    const file = new File([validJson], 'export.json', { type: 'application/json' });

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(onImport).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ name: 'Power Drill' }),
          expect.objectContaining({ name: 'Hammer' }),
        ])
      );
    });
  });

  it('importing invalid JSON calls onError with message', async () => {
    const onError = vi.fn();
    render(<DataManagement items={mockItems} onImport={vi.fn()} onError={onError} />);

    const fileInput = screen.getByTestId('import-file-input');

    const file = new File(['not valid json{'], 'bad.json', { type: 'application/json' });

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(expect.stringContaining('Invalid'));
    });
  });
});
