import { useState, useRef, useEffect } from 'react';
import { PdfUpload } from '../components/PdfUpload';
import { CsvUpload } from '../components/CsvUpload';
import { ColumnMapping } from '../components/ColumnMapping';
import { TextControls } from '../components/TextControls';
import { PdfPreview } from '../components/PdfPreview';
import { LabelOverview } from '../components/LabelOverview';
import { usePdfLoader } from '../hooks/usePdfLoader';
import { useTextManager } from '../hooks/useTextManager';

const Index = () => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [selectedNameColumn, setSelectedNameColumn] = useState('');
  const [selectedTypeColumn, setSelectedTypeColumn] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  const [isDragging, setIsDragging] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pdfJsLoaded = usePdfLoader();
  const { 
    uploadedFonts, 
    textElements, 
    handleFontUpload, 
    addTextElement, 
    updateTextElement, 
    deleteTextElement 
  } = useTextManager();

  useEffect(() => {
    const canvasElement = canvasRef.current;
    const shouldRender = pdfDoc && pdfJsLoaded && !pdfLoading && canvasElement;

    if (!shouldRender) {
      console.warn('⏳ Skipping renderPage in useEffect - missing dependencies', {
        pdfDocExists: !!pdfDoc,
        canvasExists: !!canvasElement,
        pdfLoading,
        pdfJsLoaded,
      });
      return;
    }

    renderPage(pdfDoc, currentPage);
  }, [pdfDoc, currentPage, pdfLoading, pdfJsLoaded, canvasRef.current]);

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      console.error('Invalid file type:', file.type);
      setPdfError('Please select a valid PDF file');
      return;
    }

    if (!pdfJsLoaded) {
      console.error('PDF.js not loaded yet');
      setPdfError('PDF library is still loading. Please wait and try again.');
      return;
    }

    setPdfFile(file);
    setPdfLoading(true);
    setPdfError(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = (window as any).pdfjsLib.getDocument(arrayBuffer);
      console.log('Loading task created:', loadingTask);

      const pdf = await loadingTask.promise;
      setPdfDoc(pdf);
      setTotalPages(pdf.numPages);
      setCurrentPage(1);
      setPdfLoading(false);
    } catch (error) {
      console.error('Error in PDF upload process:', error);
      setPdfError(`Failed to load PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setPdfLoading(false);
    }
  };

  const renderPage = async (pdf: any, pageNum: number) => {
    console.log('renderPage called with pageNum:', pageNum);
    const canvasElement = canvasRef.current;

    if (!canvasElement) {
      console.error('Canvas element not available in renderPage');
      setPdfError('Canvas element not available');
      return;
    }

    try {
      const page = await pdf.getPage(pageNum);
      const scale = 1.2;
      const viewport = page.getViewport({ scale });
      const ctx = canvasElement.getContext('2d');

      if (!ctx) {
        console.error('Canvas context not available');
        setPdfError('Canvas context not available');
        return;
      }

      canvasElement.width = viewport.width;
      canvasElement.height = viewport.height;
      ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);

      const renderContext = {
        canvasContext: ctx,
        viewport: viewport
      };

      const renderTask = page.render(renderContext);
      await renderTask.promise;
      console.log('Page rendered successfully to canvas');
      setCanvas(canvasElement);
    } catch (error) {
      console.error('Error in renderPage:', error);
      setPdfError(`Failed to render PDF page: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handlePageChange = async (direction: 'prev' | 'next') => {
    if (!pdfDoc) return;
    const newPage = direction === 'prev'
      ? Math.max(1, currentPage - 1)
      : Math.min(totalPages, currentPage + 1);
    setCurrentPage(newPage);
  };

  const handleDirectPageChange = (pageNum: number) => {
    if (!pdfDoc || pageNum < 1 || pageNum > totalPages) return;
    setCurrentPage(pageNum);
  };

  const handleCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.name.endsWith('.csv')) return;

    setCsvFile(file);
    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const data = lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      return row;
    });

    setCsvHeaders(headers);
    setCsvData(data);
  };

  const handleMouseDown = (e: React.MouseEvent, elementId: string) => {
    e.preventDefault();
    setIsDragging(elementId);
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !canvas) return;

    const canvasRect = canvas.getBoundingClientRect();
    const x = e.clientX - canvasRect.left - dragOffset.x;
    const y = e.clientY - canvasRect.top - dragOffset.y;

    const newX = Math.max(0, Math.min(x, canvasRect.width - 100));
    const newY = Math.max(0, Math.min(y, canvasRect.height - 20));

    updateTextElement(isDragging, { x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(null);
  };

  const handleGenerate = async () => {
    if (!pdfFile || !csvFile || textElements.length === 0) {
      alert('Please upload files and add at least one text element');
      return;
    }

    const canvasHeight = canvas?.height ?? 0;
    const scale = 1.2;

    // Convert text elements for generation
    const elementsForGeneration = textElements.map(element => ({
      ...element,
      x: element.x / scale,
      y: (canvasHeight - element.y) / scale
    }));

    const formData = new FormData();
    formData.append('pdf', pdfFile);
    formData.append('csv', csvFile);
    formData.append('textElements', JSON.stringify(elementsForGeneration));

    try {
      const response = await fetch('http://localhost:3000/generate-csv', {
        method: 'POST',
        body: formData
      });

      const json = await response.json();

      if (response.ok) {
        const a = document.createElement('a');
        a.href = json.url;
        a.download = 'invitations.zip';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        throw new Error('Generation failed');
      }
    } catch (error) {
      console.error('Error generating invitations:', error);
      alert('Failed to generate invitations. Please try again.');
    }
  };

  const canGenerate = pdfFile && csvFile && textElements.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Personalized Invitation
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Upload your PDF template and CSV guest list to generate personalized invitations with custom text placement
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Panel - File Uploads and Settings */}
          <div className="space-y-6">
            <PdfUpload
              pdfFile={pdfFile}
              pdfLoading={pdfLoading}
              pdfError={pdfError}
              pdfJsLoaded={pdfJsLoaded}
              totalPages={totalPages}
              onPdfUpload={handlePdfUpload}
            />

            <CsvUpload
              csvFile={csvFile}
              csvData={csvData}
              onCsvUpload={handleCsvUpload}
            />

            <ColumnMapping
              csvHeaders={csvHeaders}
              selectedNameColumn={selectedNameColumn}
              selectedTypeColumn={selectedTypeColumn}
              onNameColumnChange={setSelectedNameColumn}
              onTypeColumnChange={setSelectedTypeColumn}
            />

            <TextControls
              uploadedFonts={uploadedFonts}
              currentPage={currentPage}
              textElements={textElements}
              onFontUpload={handleFontUpload}
              onAddText={addTextElement}
              onUpdateText={updateTextElement}
              onDeleteText={deleteTextElement}
            />

            {/* Text Overview */}
            {totalPages > 0 && (
              <LabelOverview
                textElements={textElements}
                totalPages={totalPages}
                currentPage={currentPage}
                onPageChange={handleDirectPageChange}
              />
            )}

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={!canGenerate}
              className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
            >
              <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Generate All Invitations
            </button>
          </div>

          {/* Center Panel - PDF Preview */}
          <PdfPreview
            pdfDoc={pdfDoc}
            pdfLoading={pdfLoading}
            currentPage={currentPage}
            totalPages={totalPages}
            isDragging={isDragging}
            canvas={canvas}
            textElements={textElements}
            canvasRef={canvasRef}
            onPageChange={handlePageChange}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          />
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">📋 Instructions</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <h4 className="font-medium text-gray-800 mb-2">1. Upload Files</h4>
              <p>Upload your PDF template and CSV file with guest data. Upload custom fonts if needed for special text rendering.</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-2">2. Add Text Elements</h4>
              <p>Click "Add Text" to create new text elements on any page. Customize their content, font, size, and color as needed.</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-2">3. Position Text</h4>
              <p>Navigate through pages and drag text elements to position them exactly where you want them to appear on each page.</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-2">4. Generate</h4>
              <p>Click "Generate All Invitations" to create personalized PDFs with your custom text elements positioned on each page.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
