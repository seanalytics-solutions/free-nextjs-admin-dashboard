"use client";
import { Outfit } from 'next/font/google';
import './globals.css';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';
import Providers from "./providers";
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import FileViewerContainer from '@/components/FileViewerContainer';

const outfit = Outfit({
  subsets: ["latin"],
});
const queryClient = new QueryClient()

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  return (
    <html lang="en">
      <body className={`${outfit.className} dark:bg-gray-900`}>
      <Providers> 
        <ThemeProvider>
          <QueryClientProvider client={queryClient}>
            <SidebarProvider>
              <div className="flex h-screen overflow-hidden">
                <div className="flex-1 flex flex-col h-full overflow-hidden relative overflow-y-auto">
                  {children}
                </div>
                <FileViewerContainer />
              </div>
            </SidebarProvider>
            <ReactQueryDevtools initialIsOpen={false} />
          </QueryClientProvider>
        </ThemeProvider>
      </Providers>
      </body>
    </html>
  );
}
