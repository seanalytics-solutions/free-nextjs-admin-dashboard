"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

export interface File {
  id: string;
  url: string;
  name: string;
  fileType?: string;
}

interface FileViewerContextType {
  file: File | null;
  isOpen: boolean;
  openFile: (file: File) => void;
  closeFile: () => void;
}

const FileViewerContext = createContext<FileViewerContextType | undefined>(undefined);

export function FileViewerProvider({ children }: { children: React.ReactNode }) {
  const [file, setFile] = useState<File | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const openFile = useCallback((newFile: File) => {
    setFile(newFile);
    setIsOpen(true);
  }, []);

  const closeFile = useCallback(() => {
    setIsOpen(false);
    setTimeout(() => setFile(null), 300); // Clear after animation
  }, []);

  return (
    <FileViewerContext.Provider value={{ file, isOpen, openFile, closeFile }}>
      {children}
    </FileViewerContext.Provider>
  );
}

export function useFileViewer() {
  const context = useContext(FileViewerContext);
  if (context === undefined) {
    throw new Error("useFileViewer must be used within a FileViewerProvider");
  }
  return context;
}
