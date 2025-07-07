
import React, { useState } from 'react';
import { TextElement } from '../hooks/useTextManager';

interface TextControlsProps {
  uploadedFonts: string[];
  currentPage: number;
  textElements: TextElement[];
  onFontUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAddText: (page: number) => void;
  onUpdateText: (id: string, updates: Partial<TextElement>) => void;
  onDeleteText: (id: string) => void;
}

export const TextControls: React.FC<TextControlsProps> = ({
  uploadedFonts,
  currentPage,
  textElements,
  onFontUpload,
  onAddText,
  onUpdateText,
  onDeleteText
}) => {
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const defaultFonts = ['Arial', 'Times New Roman', 'Helvetica', 'Georgia', 'Verdana'];
  const allFonts = [...defaultFonts, ...uploadedFonts];
  
  const currentPageElements = textElements.filter(el => el.page === currentPage);
  const selectedElement = selectedElementId ? textElements.find(el => el.id === selectedElementId) : null;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Text Elements</h2>
      
      {/* Font Upload */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Upload Custom Font</label>
        <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center hover:border-purple-300 transition-colors">
          <input
            type="file"
            accept=".ttf,.otf,.woff,.woff2"
            onChange={onFontUpload}
            className="hidden"
            id="fontUpload"
          />
          <label htmlFor="fontUpload" className="cursor-pointer">
            <svg className="w-6 h-6 mx-auto text-gray-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-sm text-gray-600">Upload TTF, OTF, WOFF files</p>
          </label>
        </div>
      </div>

      {/* Add Text Button */}
      <button
        onClick={() => onAddText(currentPage)}
        className="w-full mb-4 py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
      >
        + Add Text to Page {currentPage}
      </button>

      {/* Text Elements List */}
      <div className="space-y-3 mb-4">
        <h3 className="font-medium text-gray-800">Page {currentPage} Elements:</h3>
        {currentPageElements.length === 0 ? (
          <p className="text-sm text-gray-500">No text elements on this page</p>
        ) : (
          currentPageElements.map((element) => (
            <div
              key={element.id}
              className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                selectedElementId === element.id
                  ? 'border-purple-300 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedElementId(element.id)}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm" style={{ color: element.color }}>
                  {element.text}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteText(element.id);
                    if (selectedElementId === element.id) {
                      setSelectedElementId(null);
                    }
                  }}
                  className="text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                X: {Math.round(element.x)}, Y: {Math.round(element.y)}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Element Editor */}
      {selectedElement && (
        <div className="border-t pt-4 space-y-4">
          <h3 className="font-medium text-gray-800">Edit Selected Element</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Text</label>
            <input
              type="text"
              value={selectedElement.text}
              onChange={(e) => onUpdateText(selectedElement.id, { text: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Font Family</label>
            <select
              value={selectedElement.fontFamily}
              onChange={(e) => onUpdateText(selectedElement.id, { fontFamily: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {allFonts.map(font => (
                <option key={font} value={font}>{font}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Font Size</label>
            <input
              type="range"
              min="8"
              max="72"
              value={selectedElement.fontSize}
              onChange={(e) => onUpdateText(selectedElement.id, { fontSize: parseInt(e.target.value) })}
              className="w-full"
            />
            <div className="text-sm text-gray-600 mt-1">{selectedElement.fontSize}px</div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
            <input
              type="color"
              value={selectedElement.color}
              onChange={(e) => onUpdateText(selectedElement.id, { color: e.target.value })}
              className="w-full h-10 border border-gray-200 rounded-lg cursor-pointer"
            />
          </div>
        </div>
      )}
    </div>
  );
};
