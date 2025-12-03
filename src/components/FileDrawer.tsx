import { memo } from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

import FileViewer from '@/features/FileViewer';
import { useFileViewer } from '@/context/FileViewerContext';

interface FileDrawerProps {
  onClose: () => void;
  open: boolean;
}

const FileDrawer = memo<FileDrawerProps>(({ onClose, open }) => {
  const { file } = useFileViewer();

  return (
    <Drawer open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DrawerContent className="h-[95vh] !max-h-[95vh] flex flex-col">
        <DrawerHeader className="border-b">
          <DrawerTitle>{file?.name}</DrawerTitle>
        </DrawerHeader>
        <div className="flex-1 overflow-hidden relative">
            {file && <FileViewer {...file} />}
        </div>
      </DrawerContent>
    </Drawer>
  );
});

export default FileDrawer;
