'use client';

import { memo } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

import FileViewer from '@/features/FileViewer';
import { useFileViewer } from '@/context/FileViewerContext';

const PANEL_WIDTH = 500;

interface FileSidePanelProps {
  onClose: () => void;
  open: boolean;
}

const FileSidePanel = memo<FileSidePanelProps>(({ onClose, open }) => {
  const { file } = useFileViewer();

  return (
    <div 
        className={`h-full bg-white dark:bg-gray-900  border-gray-200 dark:border-gray-800 flex flex-col transition-all duration-300 ease-in-out shadow-[-2px_0_8px_rgba(0,0,0,0.05)] overflow-hidden ${!open ? 'border-l-0' : ''}`}
        style={{ width: open ? PANEL_WIDTH : 0, opacity: open ? 1 : 0 }}
    >
        <div style={{ width: PANEL_WIDTH }} className="h-full flex flex-col">
            <div className="p-4 h-[76.5px] border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
                <span className="font-semibold truncate max-w-[80%] text-gray-900 dark:text-gray-100">{file?.name}</span>
                <Button variant="ghost" size="icon" onClick={onClose}>
                    <X className="h-5 w-5" />
                </Button>
            </div>
            <div className="flex-1 overflow-hidden border-l border-gray-200 dark:border-gray-800 relative">
                {file && <FileViewer {...file} />}
            </div>
        </div>
    </div>
  );
});

export default FileSidePanel;
