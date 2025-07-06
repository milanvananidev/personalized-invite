
import { useState, useEffect } from 'react';

export const usePdfLoader = () => {
  const [pdfJsLoaded, setPdfJsLoaded] = useState(false);

  useEffect(() => {
    console.log('Starting PDF.js loading...');
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.onload = () => {
      console.log('PDF.js script loaded, setting worker...');
      (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      setPdfJsLoaded(true);
      console.log('PDF.js loaded successfully');
    };
    script.onerror = (error) => {
      console.error('Failed to load PDF.js script:', error);
    };
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  return pdfJsLoaded;
};
