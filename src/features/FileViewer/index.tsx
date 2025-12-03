'use client';

import { CSSProperties, memo } from 'react';
import PDFRenderer from './Renderer/PDF';
import { File } from '@/context/FileViewerContext';

interface FileViewerProps extends File {
  className?: string;
  style?: CSSProperties;
}

const FileViewer = memo<FileViewerProps>(({ id, style, url, name }) => {
  // Solo manejar PDFs
  if (name?.toLowerCase().endsWith('.pdf')) {
    return <PDFRenderer fileId={id} url={url} />;
  }

  return <div className="flex items-center justify-center h-full text-gray-500">Formato no soportado</div>;
});

export default FileViewer;
