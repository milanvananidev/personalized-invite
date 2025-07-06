
import React from 'react';

interface FontSettings {
  nameFont: string;
  typeFont: string;
  nameFontSize: number;
  typeFontSize: number;
  nameColor: string;
  typeColor: string;
}

interface FontSettingsProps {
  fontSettings: FontSettings;
  uploadedFonts: string[];
  onFontSettingsChange: (settings: FontSettings) => void;
  onFontUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const FontSettingsComponent: React.FC<FontSettingsProps> = ({
  fontSettings,
  uploadedFonts,
  onFontSettingsChange,
  onFontUpload
}) => {
  const defaultFonts = ['Arial', 'Times New Roman', 'Helvetica', 'Georgia', 'Verdana'];
  const allFonts = [...defaultFonts, ...uploadedFonts];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Font Settings</h2>
      
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Name Settings */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-800">Name Settings</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Font Family</label>
            <select
              value={fontSettings.nameFont}
              onChange={(e) => onFontSettingsChange({ ...fontSettings, nameFont: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {allFonts.map(font => (
                <option key={font} value={font}>{font}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Font Size</label>
            <input
              type="range"
              min="8"
              max="72"
              value={fontSettings.nameFontSize}
              onChange={(e) => onFontSettingsChange({ ...fontSettings, nameFontSize: parseInt(e.target.value) })}
              className="w-full"
            />
            <div className="text-sm text-gray-600 mt-1">{fontSettings.nameFontSize}px</div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
            <input
              type="color"
              value={fontSettings.nameColor}
              onChange={(e) => onFontSettingsChange({ ...fontSettings, nameColor: e.target.value })}
              className="w-full h-10 border border-gray-200 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* Type Settings */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-800">Type Settings</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Font Family</label>
            <select
              value={fontSettings.typeFont}
              onChange={(e) => onFontSettingsChange({ ...fontSettings, typeFont: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {allFonts.map(font => (
                <option key={font} value={font}>{font}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Font Size</label>
            <input
              type="range"
              min="8"
              max="72"
              value={fontSettings.typeFontSize}
              onChange={(e) => onFontSettingsChange({ ...fontSettings, typeFontSize: parseInt(e.target.value) })}
              className="w-full"
            />
            <div className="text-sm text-gray-600 mt-1">{fontSettings.typeFontSize}px</div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
            <input
              type="color"
              value={fontSettings.typeColor}
              onChange={(e) => onFontSettingsChange({ ...fontSettings, typeColor: e.target.value })}
              className="w-full h-10 border border-gray-200 rounded-lg cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
