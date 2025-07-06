
import React from 'react';

interface ColumnMappingProps {
  csvHeaders: string[];
  selectedNameColumn: string;
  selectedTypeColumn: string;
  onNameColumnChange: (column: string) => void;
  onTypeColumnChange: (column: string) => void;
}

export const ColumnMapping: React.FC<ColumnMappingProps> = ({
  csvHeaders,
  selectedNameColumn,
  selectedTypeColumn,
  onNameColumnChange,
  onTypeColumnChange
}) => {
  if (csvHeaders.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Column Mapping</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Name Column</label>
          <select
            value={selectedNameColumn}
            onChange={(e) => onNameColumnChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">Select name column</option>
            {csvHeaders.map(header => (
              <option key={header} value={header}>{header}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Type Column</label>
          <select
            value={selectedTypeColumn}
            onChange={(e) => onTypeColumnChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">Select type column</option>
            {csvHeaders.map(header => (
              <option key={header} value={header}>{header}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
