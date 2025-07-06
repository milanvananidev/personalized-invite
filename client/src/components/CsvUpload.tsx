
import React from 'react';

interface CsvUploadProps {
  csvFile: File | null;
  csvData: any[];
  onCsvUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const CsvUpload: React.FC<CsvUploadProps> = ({
  csvFile,
  csvData,
  onCsvUpload
}) => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
        <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2h2z" />
        </svg>
        Guest Data CSV
      </h2>
      <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-green-300 transition-colors">
        <input
          type="file"
          accept=".csv"
          onChange={onCsvUpload}
          className="hidden"
          id="csvUpload"
        />
        <label htmlFor="csvUpload" className="cursor-pointer block">
          <svg className="w-10 h-10 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className="font-medium text-gray-700">Click to upload CSV</p>
          <p className="text-sm text-gray-500">Guest names and types</p>
        </label>
      </div>
      {csvFile && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-700 font-medium">✓ {csvFile.name}</p>
          <p className="text-xs text-green-600">{csvData.length} records found</p>
        </div>
      )}
    </div>
  );
};
