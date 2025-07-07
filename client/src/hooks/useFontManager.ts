
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';

interface FontSettings {
  nameFont: string;
  typeFont: string;
  nameFontSize: number;
  typeFontSize: number;
  nameColor: string;
  typeColor: string;
  namePage: number;
  typePage: number;
}

export const useFontManager = () => {
  const [uploadedFonts, setUploadedFonts] = useState<string[]>([]);
  const [fontSettings, setFontSettings] = useState<FontSettings>({
    nameFont: 'Arial',
    typeFont: 'Arial',
    nameFontSize: 16,
    typeFontSize: 14,
    nameColor: '#1e40af',
    typeColor: '#be185d',
    namePage: 1,
    typePage: 1
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
      
      // Show success toast
      toast({
        title: "Font uploaded successfully!",
        description: `${fontName} is now available for use.`,
      });
      
    } catch (error) {
      console.error('Error loading font:', error);
      
      // Show error toast
      toast({
        title: "Font upload failed",
        description: "Please try a different font file format (TTF, OTF, WOFF).",
        variant: "destructive",
      });
    }
  };

  return {
    uploadedFonts,
    fontSettings,
    setFontSettings,
    handleFontUpload
  };
};
