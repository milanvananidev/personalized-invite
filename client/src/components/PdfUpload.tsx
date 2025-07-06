
import React from 'react';

interface PdfUploadProps {
  pdfFile: File | null;
  pdfLoading: boolean;
  pdfError: string | null;
  pdfJsLoaded: boolean;
  totalPages: number;
  onPdfUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const PdfUpload: React.FC<PdfUploadProps> = ({
  pdfFile,
  pdfLoading,
  pdfError,
  pdfJsLoaded,
  totalPages,
  onPdfUpload
}) => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
        <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        PDF Template
      </h2>
      <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-purple-300 transition-colors">
        <input
          type="file"
          accept=".pdf"
          onChange={onPdfUpload}
          className="hidden"
          id="pdfUpload"
          disabled={pdfLoading || !pdfJsLoaded}
        />
        <label htmlFor="pdfUpload" className="cursor-pointer block">
          <svg className="w-10 h-10 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className="font-medium text-gray-700">
            {pdfLoading ? 'Loading PDF...' : !pdfJsLoaded ? 'Loading PDF library...' : 'Click to upload PDF'}
          </p>
          <p className="text-sm text-gray-500">Multi-page templates supported</p>
        </label>
      </div>
      {pdfError && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700 font-medium">⚠️ {pdfError}</p>
        </div>
      )}
      {pdfFile && !pdfError && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-700 font-medium">✓ {pdfFile.name}</p>
          <p className="text-xs text-green-600">{totalPages} pages loaded</p>
        </div>
      )}
    </div>
  );
};
