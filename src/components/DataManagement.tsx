import { useRef, useCallback } from 'react';
import type { ToolItem } from '../types';

interface DataManagementProps {
  items: ToolItem[];
  onImport: (items: ToolItem[]) => void;
  onError: (message: string) => void;
}

function isValidItem(data: unknown): data is ToolItem {
  if (typeof data !== 'object' || data === null) return false;
  const obj = data as Record<string, unknown>;
  return (
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.category === 'string' &&
    typeof obj.condition === 'string' &&
    (obj.borrow === null || typeof obj.borrow === 'object')
  );
}

export function DataManagement({ items, onImport, onError }: DataManagementProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = useCallback(() => {
    const json = JSON.stringify(items, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `toolshelf-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  }, [items]);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed: unknown = JSON.parse(event.target?.result as string);
          if (!Array.isArray(parsed)) {
            onError('Invalid file format: expected an array of items');
            return;
          }
          const validItems = parsed.filter(isValidItem) as ToolItem[];
          if (validItems.length === 0 && parsed.length > 0) {
            onError('No valid items found in the imported file');
            return;
          }
          onImport(validItems);
        } catch {
          onError('Invalid JSON file: could not parse the data');
        }
      };
      reader.readAsText(file);

      // Reset file input so the same file can be re-imported
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [onImport, onError]
  );

  return (
    <div className="flex items-center gap-2" role="group" aria-label="Data management">
      <button
        onClick={handleExport}
        disabled={items.length === 0}
        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3.5 py-2 text-xs font-medium text-text-secondary transition-all duration-200 hover:bg-surface-tertiary hover:border-border-hover active:scale-[0.97] disabled:opacity-40 disabled:pointer-events-none"
        aria-label="Export inventory as JSON"
      >
        Export
      </button>
      <button
        onClick={() => fileInputRef.current?.click()}
        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3.5 py-2 text-xs font-medium text-text-secondary transition-all duration-200 hover:bg-surface-tertiary hover:border-border-hover active:scale-[0.97]"
        aria-label="Import inventory from JSON file"
      >
        Import
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        onChange={handleFileChange}
        className="hidden"
        aria-hidden="true"
        data-testid="import-file-input"
      />
    </div>
  );
}
