import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DataManagement } from '../src/components/DataManagement';
import { ToastProvider } from '../src/hooks/useToast';
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

function renderDataManagement(items: ToolItem[] = mockItems) {
  const onImport = vi.fn();
  const result = render(
    <ToastProvider>
      <DataManagement items={items} onImport={onImport} />
    </ToastProvider>
  );
  return { ...result, onImport };
}

describe('DataManagement', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
    global.URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('export button triggers download of JSON file', () => {
    // Render first, then set up spies for the export action
    renderDataManagement();

    vi.spyOn(document.body, 'appendChild').mockImplementation((node) => node);
    vi.spyOn(document.body, 'removeChild').mockImplementation((node) => node);

    const exportButton = screen.getByLabelText(/export items/i);
    fireEvent.click(exportButton);

    expect(global.URL.createObjectURL).toHaveBeenCalled();
  });

  it('exported JSON contains all items from current state', () => {
    renderDataManagement();

    const exportButton = screen.getByLabelText(/export items/i);
    fireEvent.click(exportButton);

    expect(global.URL.createObjectURL).toHaveBeenCalled();
    const blobArg = (global.URL.createObjectURL as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(blobArg).toBeInstanceOf(Blob);
  });

  it('import button opens file picker', () => {
    renderDataManagement();

    const importButton = screen.getByLabelText(/import items/i);
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const clickSpy = vi.spyOn(fileInput, 'click');

    fireEvent.click(importButton);
    expect(clickSpy).toHaveBeenCalled();
  });

  it('importing valid JSON replaces current items', async () => {
    const { onImport } = renderDataManagement();

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const validJson = JSON.stringify(mockItems);
    const file = new File([validJson], 'export.json', { type: 'application/json' });

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(onImport).toHaveBeenCalledWith(mockItems);
    });
  });

  it('importing invalid JSON displays error toast', async () => {
    renderDataManagement();

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['not-valid-json{'], 'bad.json', { type: 'application/json' });

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText(/import failed/i)).toBeInTheDocument();
    });
  });
});
