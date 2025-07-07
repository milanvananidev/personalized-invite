
import React from 'react';
import { TextElement } from '../hooks/useTextManager';

interface PdfPreviewProps {
  pdfDoc: any;
  pdfLoading: boolean;
  currentPage: number;
  totalPages: number;
  isDragging: string | null;
  canvas: HTMLCanvasElement | null;
  textElements: TextElement[];
  canvasRef: React.RefObject<HTMLCanvasElement>;
  onPageChange: (direction: 'prev' | 'next') => void;
  onMouseDown: (e: React.MouseEvent, elementId: string) => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseUp: () => void;
}

export const PdfPreview: React.FC<PdfPreviewProps> = ({
  pdfDoc,
  pdfLoading,
  currentPage,
  totalPages,
  isDragging,
  canvas,
  textElements = [],
  canvasRef,
  onPageChange,
  onMouseDown,
  onMouseMove,
  onMouseUp
}) => {
  const currentPageElements = textElements.filter(element => element.page === currentPage);
  
  return (
    <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center">
          <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          PDF Preview & Text Positioning
        </h2>
        {pdfDoc && (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onPageChange('prev')}
              disabled={currentPage <= 1}
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Prev
            </button>
            <span className="px-3 py-1 text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => onPageChange('next')}
              disabled={currentPage >= totalPages}
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next →
            </button>
          </div>
        )}
      </div>

      <div className="border-2 border-gray-200 rounded-xl overflow-hidden bg-gray-50 relative">
        {pdfLoading ? (
          <div className="flex items-center justify-center min-h-96 text-gray-500">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-lg font-medium">Loading PDF...</p>
              <p className="text-sm mt-1">Please wait while we process your file</p>
            </div>
          </div>
        ) : pdfDoc ? (
          <div
            className="relative inline-block"
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
          >
            <canvas
              ref={canvasRef}
              className="max-w-full h-auto block"
              style={{
                border: '1px solid #e5e7eb',
                backgroundColor: 'white'
              }}
            />

            {/* Dynamic Text Elements */}
            {currentPageElements.map((element) => (
              <span
                key={element.id}
                className="absolute cursor-move select-none"
                style={{
                  left: element.x,
                  top: element.y,
                  opacity: 0.85,
                  display: 'block',
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  fontFamily: element.fontFamily,
                  fontSize: `${element.fontSize}px`,
                  color: element.color,
                  fontWeight: 'bold',
                  padding: '2px 4px',
                  border: isDragging === element.id ? '2px solid #9333ea' : '1px dashed #9333ea',
                  borderRadius: '4px'
                }}
                onMouseDown={(e) => onMouseDown(e, element.id)}
              >
                {element.text}
              </span>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center min-h-96 text-gray-400">
            <div className="text-center">
              <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-lg font-medium">Upload a PDF to preview</p>
              <p className="text-sm mt-1">The template will appear here with draggable text elements</p>
            </div>
          </div>
        )}
      </div>

      {/* Text Elements Info */}
      {canvas && currentPageElements.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Text Elements on Page {currentPage}:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {currentPageElements.map((element) => (
              <div key={element.id} className="p-2 bg-gray-50 rounded border text-xs">
                <div className="font-medium" style={{ color: element.color }}>
                  {element.text}
                </div>
                <div className="text-gray-500">
                  X: {Math.round(element.x)}, Y: {Math.round(element.y)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
