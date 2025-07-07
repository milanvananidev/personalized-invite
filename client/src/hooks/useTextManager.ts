
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';

export interface TextElement {
  id: string;
  text: string;
  x: number;
  y: number;
  page: number;
  fontSize: number;
  color: string;
  fontFamily: string;
}

export const useTextManager = () => {
  const [uploadedFonts, setUploadedFonts] = useState<string[]>([]);
  const [textElements, setTextElements] = useState<TextElement[]>([]);

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
      
      toast({
        title: "Font uploaded successfully!",
        description: `${fontName} is now available for use.`,
      });
      
    } catch (error) {
      console.error('Error loading font:', error);
      
      toast({
        title: "Font upload failed",
        description: "Please try a different font file format (TTF, OTF, WOFF).",
        variant: "destructive",
      });
    }
  };

  const addTextElement = (page: number) => {
    const newElement: TextElement = {
      id: `text-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text: 'New Text',
      x: 100,
      y: 100,
      page: page,
      fontSize: 16,
      color: '#000000',
      fontFamily: 'Arial'
    };
    
    setTextElements(prev => [...prev, newElement]);
    return newElement.id;
  };

  const updateTextElement = (id: string, updates: Partial<TextElement>) => {
    setTextElements(prev => 
      prev.map(element => 
        element.id === id ? { ...element, ...updates } : element
      )
    );
  };

  const deleteTextElement = (id: string) => {
    setTextElements(prev => prev.filter(element => element.id !== id));
  };

  const getTextElementsForPage = (page: number) => {
    return textElements.filter(element => element.page === page);
  };

  return {
    uploadedFonts,
    textElements,
    handleFontUpload,
    addTextElement,
    updateTextElement,
    deleteTextElement,
    getTextElementsForPage
  };
};
