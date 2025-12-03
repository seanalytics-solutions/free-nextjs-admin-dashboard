import { memo, useState, useRef, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configurar worker de PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `https://registry.npmmirror.com/pdfjs-dist/${pdfjs.version}/files/build/pdf.worker.min.mjs`;

interface PDFRendererProps {
  fileId: string;
  url: string;
}

const PDFRenderer = memo<PDFRendererProps>(({ url }) => {
  const [pageNumber, setPageNumber] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect) {
          setContainerWidth(entry.contentRect.width);
        }
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const goToPrevPage = () => {
    if (pageNumber > 1) {
      setPageNumber(pageNumber - 1);
    }
  };

  const goToNextPage = () => {
    if (pageNumber < numPages) {
      setPageNumber(pageNumber + 1);
    }
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= numPages) {
      setPageNumber(page);
    }
  };

  // Calcular el ancho del PDF y la escala para alta resolución
  const pdfWidth = containerWidth ? containerWidth - 40 : undefined;
  const devicePixelRatio = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;

  return (
    <div ref={containerRef} className="relative w-full h-full flex flex-col overflow-hidden">
      <div className="flex-1 overflow-auto flex justify-center items-start py-4 px-2 bg-[#f5f5f5] dark:bg-gray-800">
        <Document
            file={url}
            loading={
              <div className="flex flex-col items-center justify-center h-full p-5">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                  <div className="mt-2 text-gray-500">Cargando PDF...</div>
              </div>
            }
            onLoadSuccess={onDocumentLoadSuccess}
            className="pdf-document"
        >
            <Page
              pageNumber={pageNumber}
              renderAnnotationLayer={false}
              renderTextLayer={false}
              width={pdfWidth}
              scale={devicePixelRatio}
              className="shadow-lg pdf-page"
              canvasBackground="white"
            />
        </Document>
      </div>

      {numPages > 1 && (
        <div className="flex-shrink-0 p-3 border-t border-black/10 bg-white dark:bg-gray-900 dark:border-white/10">
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              disabled={pageNumber <= 1}
              onClick={goToPrevPage}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-1">
              <Input
                max={numPages}
                min={1}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  if (!isNaN(value)) goToPage(value);
                }}
                type="number"
                value={pageNumber}
                className="h-8 w-16 text-center px-1"
              />
              <span className="text-sm text-gray-500">/ {numPages}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              disabled={pageNumber >= numPages}
              onClick={goToNextPage}
              className="h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
});

export default PDFRenderer;
