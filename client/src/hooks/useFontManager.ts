
import { useState } from 'react';

interface FontSettings {
  nameFont: string;
  typeFont: string;
  nameFontSize: number;
  typeFontSize: number;
  nameColor: string;
  typeColor: string;
}

export const useFontManager = () => {
  const [uploadedFonts, setUploadedFonts] = useState<string[]>([]);
  const [fontSettings, setFontSettings] = useState<FontSettings>({
    nameFont: 'Arial',
    typeFont: 'Arial',
    nameFontSize: 16,
    typeFontSize: 14,
    nameColor: '#1e40af',
    typeColor: '#be185d'
  });

  const handleFontUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fontName = file.name.replace(/\.[^/.]+$/, '');
    
    try {
      const fontFace = new FontFace(fontName, `url(${URL.createObjectURL(file)})`);
      await fontFace.load();
      document.fonts.add(fontFace);
      
      setUploadedFonts(prev => [...prev, fontName]);
      console.log(`Font ${fontName} loaded successfully`);
    } catch (error) {
      console.error('Error loading font:', error);
      alert('Failed to load font. Please try a different font file.');
    }
  };

  return {
    uploadedFonts,
    fontSettings,
    setFontSettings,
    handleFontUpload
  };
};
