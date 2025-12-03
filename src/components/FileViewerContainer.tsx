'use client';

import dynamic from 'next/dynamic';
import { memo } from 'react';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useFileViewer } from '@/context/FileViewerContext';

const FileSidePanel = dynamic(() => import('./FileSidePanel'), { ssr: false });
const FileDrawer = dynamic(() => import('./FileDrawer'), { ssr: false });

const FileViewerContainer = memo(() => {
  const isMobile = useIsMobile();
  const { isOpen, closeFile } = useFileViewer();

  if (isMobile) {
    if (!isOpen) return null;
    return (
      <FileDrawer
        onClose={closeFile}
        open={isOpen}
      />
    );
  }

  return (
    <FileSidePanel
      onClose={closeFile}
      open={isOpen}
    />
  );
});

export default FileViewerContainer;
