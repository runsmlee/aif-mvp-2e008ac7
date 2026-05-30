import { useRef, useCallback } from 'react';
import { IconDownload, IconUpload } from './Icon';
import { useToast } from '../hooks/useToast';
import type { ToolItem } from '../types';

interface DataManagementProps {
  items: ToolItem[];
  onImport: (items: ToolItem[]) => void;
}

export function DataManagement({ items, onImport }: DataManagementProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();

  const handleExport = useCallback(() => {
    const json = JSON.stringify(items, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `toolshelf-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    addToast({ message: `Exported ${items.length} item${items.length === 1 ? '' : 's'}`, type: 'success' });
  }, [items, addToast]);

  const handleImportClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = event.target?.result;
          if (typeof content !== 'string') {
            throw new Error('Failed to read file');
          }
          const parsed = JSON.parse(content);

          if (!Array.isArray(parsed)) {
            throw new Error('Invalid format: expected an array of items');
          }

          // Basic validation: ensure each item has required fields
          for (const item of parsed) {
            if (typeof item !== 'object' || item === null || !item.id || !item.name) {
              throw new Error('Invalid item format: each item must have id and name');
            }
          }

          onImport(parsed as ToolItem[]);
          addToast({
            message: `Imported ${parsed.length} item${parsed.length === 1 ? '' : 's'}`,
            type: 'success',
          });
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Invalid JSON file';
          addToast({ message: `Import failed: ${message}`, type: 'error' });
        }
      };
      reader.readAsText(file);

      // Reset input so the same file can be re-imported
      e.target.value = '';
    },
    [onImport, addToast]
  );

  return (
    <>
      <button
        onClick={handleExport}
        aria-label="Export items"
        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-text-secondary transition-all duration-200 hover:bg-surface-tertiary hover:border-border-hover active:scale-[0.98]"
        type="button"
      >
        <IconDownload size={14} />
        Export
      </button>
      <button
        onClick={handleImportClick}
        aria-label="Import items"
        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-text-secondary transition-all duration-200 hover:bg-surface-tertiary hover:border-border-hover active:scale-[0.98]"
        type="button"
      >
        <IconUpload size={14} />
        Import
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        onChange={handleFileChange}
        className="hidden"
        aria-hidden="true"
        tabIndex={-1}
      />
    </>
  );
}
