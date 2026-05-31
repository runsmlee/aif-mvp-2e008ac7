import { useRef, useCallback } from 'react';
import type { ToolItem } from '../types';
import { IconDownload, IconUpload } from './Icon';

interface DataManagementProps {
  items: ToolItem[];
  onImport: (items: ToolItem[]) => void;
}

export function DataManagement({ items, onImport }: DataManagementProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  }, [items]);

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
            onImport([]);
            return;
          }
          const parsed = JSON.parse(content);
          if (!Array.isArray(parsed)) {
            throw new Error('Invalid data format: expected an array');
          }
          onImport(parsed as ToolItem[]);
        } catch {
          // Signal error to parent via callback with original items
          onImport(items);
          // Dispatch a custom event that the parent can listen to for error notification
          window.dispatchEvent(
            new CustomEvent('toolshelf-import-error', {
              detail: { message: 'Invalid JSON file. Please check the file and try again.' },
            })
          );
        }
      };
      reader.readAsText(file);

      // Reset the input so the same file can be selected again
      e.target.value = '';
    },
    [onImport, items]
  );

  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Data management">
      <button
        onClick={handleExport}
        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3.5 py-2.5 text-xs font-medium text-text-secondary transition-all duration-200 hover:bg-surface-tertiary hover:border-border-hover active:scale-[0.97]"
        aria-label="Export inventory as JSON"
      >
        <IconDownload size={14} />
        Export
      </button>
      <button
        onClick={handleImportClick}
        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3.5 py-2.5 text-xs font-medium text-text-secondary transition-all duration-200 hover:bg-surface-tertiary hover:border-border-hover active:scale-[0.97]"
        aria-label="Import inventory from JSON"
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
        data-testid="import-file-input"
      />
    </div>
  );
}
