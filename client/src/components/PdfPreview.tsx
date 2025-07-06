
import React from 'react';

interface Position {
  x: number;
  y: number;
  page: number;
}

interface PdfPreviewProps {
  pdfDoc: any;
  pdfLoading: boolean;
  currentPage: number;
  totalPages: number;
  namePosition: Position;
  typePosition: Position;
  isDragging: 'name' | 'type' | null;
  canvas: HTMLCanvasElement | null;
  csvData: any[];
  selectedNameColumn: string;
  selectedTypeColumn: string;
  fontSettings: {
    nameFont: string;
    typeFont: string;
    nameFontSize: number;
    typeFontSize: number;
    nameColor: string;
    typeColor: string;
  };
  canvasRef: React.RefObject<HTMLCanvasElement>;
  onPageChange: (direction: 'prev' | 'next') => void;
  onMouseDown: (e: React.MouseEvent, labelType: 'name' | 'type') => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseUp: () => void;
}

export const PdfPreview: React.FC<PdfPreviewProps> = ({
  pdfDoc,
  pdfLoading,
  currentPage,
  totalPages,
  namePosition,
  typePosition,
  isDragging,
  canvas,
  csvData,
  selectedNameColumn,
  selectedTypeColumn,
  fontSettings,
  canvasRef,
  onPageChange,
  onMouseDown,
  onMouseMove,
  onMouseUp
}) => {
  return (
    <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center">
          <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          PDF Preview & Label Positioning
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

            {/* Draggable Name Label */}
            <span
              className="absolute cursor-move select-none"
              style={{
                left: namePosition.x,
                top: namePosition.y,
                opacity: 0.85,
                display: namePosition.page === currentPage ? 'block' : 'none',
                backgroundColor: 'rgba(255,255,255,0.2)',
                fontFamily: fontSettings.nameFont,
                fontSize: `${fontSettings.nameFontSize}px`,
                color: fontSettings.nameColor,
                fontWeight: 'bold'
              }}
              onMouseDown={(e) => onMouseDown(e, 'name')}
            >
              {csvData?.[0]?.[selectedNameColumn] || 'Test Name'}
            </span>

            {/* Draggable Type Label */}
            <span
              className="absolute cursor-move select-none"
              style={{
                left: typePosition.x,
                top: typePosition.y,
                opacity: 0.85,
                display: typePosition.page === currentPage ? 'block' : 'none',
                backgroundColor: 'rgba(255,255,255,0.2)',
                fontFamily: fontSettings.typeFont,
                fontSize: `${fontSettings.typeFontSize}px`,
                color: fontSettings.typeColor,
                fontWeight: 'bold'
              }}
              onMouseDown={(e) => onMouseDown(e, 'type')}
            >
              {csvData?.[0]?.[selectedTypeColumn] || 'Test Type'}
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-center min-h-96 text-gray-400">
            <div className="text-center">
              <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-lg font-medium">Upload a PDF to preview</p>
              <p className="text-sm mt-1">The template will appear here with draggable labels</p>
            </div>
          </div>
        )}
      </div>

      {/* Position Info */}
      {canvas && (
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <span className="font-medium text-blue-800">Name Position</span>
              <span className="text-xs text-blue-600">Page {namePosition.page}</span>
            </div>
            <div className="text-xs text-blue-600 mt-1">
              X: {namePosition.x}, Y: {namePosition.y}
            </div>
          </div>

          <div className="p-3 bg-pink-50 rounded-lg border border-pink-200">
            <div className="flex items-center justify-between">
              <span className="font-medium text-pink-800">Type Position</span>
              <span className="text-xs text-pink-600">Page {typePosition.page}</span>
            </div>
            <div className="text-xs text-pink-600 mt-1">
              X: {typePosition.x}, Y: {typePosition.y}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
