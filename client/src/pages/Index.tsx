import { useState, useRef, useEffect } from 'react';

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
  const [pdfJsLoaded, setPdfJsLoaded] = useState(false);

  const [namePosition, setNamePosition] = useState({ x: 100, y: 100, page: 1 });
  const [typePosition, setTypePosition] = useState({ x: 100, y: 150, page: 1 });
  const [isDragging, setIsDragging] = useState<'name' | 'type' | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nameLabelRef = useRef<HTMLDivElement>(null);
  const typeLabelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log('Starting PDF.js loading...');
    // Load PDF.js
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.onload = () => {
      console.log('PDF.js script loaded, setting worker...');
      (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      setPdfJsLoaded(true);
      console.log('PDF.js loaded successfully');
    };
    script.onerror = (error) => {
      console.error('Failed to load PDF.js script:', error);
      setPdfError('Failed to load PDF library');
    };
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);


  // Effect to render PDF when both pdfDoc and canvas are available
  useEffect(() => {
    const canvasElement = canvasRef.current;

    const shouldRender =
      pdfDoc && pdfJsLoaded && !pdfLoading && canvasElement;

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
    if (!file) {
      return;
    }

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
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
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
      console.log('Viewport created:', {
        width: viewport.width,
        height: viewport.height,
        scale: scale
      });

      const ctx = canvasElement.getContext('2d');
      console.log('Canvas context:', ctx);

      if (!ctx) {
        console.error('Canvas context not available');
        setPdfError('Canvas context not available');
        return;
      }

      // Set canvas dimensions
      canvasElement.width = viewport.width;
      canvasElement.height = viewport.height;
      console.log('Canvas dimensions set to:', canvasElement.width, 'x', canvasElement.height);

      // Clear canvas
      ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
      console.log('Canvas cleared');

      console.log('Starting page render...');
      const renderContext = {
        canvasContext: ctx,
        viewport: viewport
      };
      console.log('Render context:', renderContext);

      const renderTask = page.render(renderContext);
      console.log('Render task created:', renderTask);

      await renderTask.promise;
      console.log('Page rendered successfully to canvas');

      setCanvas(canvasElement);
      console.log('Canvas set in state', canvas);

    } catch (error) {
      console.error('Error in renderPage:', error);
      console.error('Render error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      setPdfError(`Failed to render PDF page: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handlePageChange = async (direction: 'prev' | 'next') => {
    if (!pdfDoc) return;

    const newPage = direction === 'prev'
      ? Math.max(1, currentPage - 1)
      : Math.min(totalPages, currentPage + 1);

    setCurrentPage(newPage);
    // The useEffect will handle the rendering when currentPage changes
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

  const handleMouseDown = (e: React.MouseEvent, labelType: 'name' | 'type') => {
    e.preventDefault();
    setIsDragging(labelType);

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

    const position = {
      x: Math.max(0, Math.max(x, canvasRect.width - 100)),
      y: Math.max(0, Math.min(y, canvasRect.height - 20)),
      page: currentPage
    };

    if (isDragging === 'name') {
      setNamePosition(position);
    } else {
      setTypePosition(position);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(null);
  };

  const handleGenerate = async () => {

    if (!pdfFile || !csvFile || !selectedNameColumn || !selectedTypeColumn) {
      alert('Please complete all required fields');
      return;
    }

    const canvasHeight = canvas?.height ?? 0;
    const scale = 1.2;

    const adjustedName = {
      x: (namePosition.x / scale),
      y: (canvasHeight - namePosition.y) / scale,
      page: namePosition.page
    };

    const adjustedType = {
      x: typePosition.x / scale,
      y: (canvasHeight - typePosition.y) / scale,
      page: typePosition.page
    };

    const formData = new FormData();
    formData.append('pdf', pdfFile);
    formData.append('csv', csvFile);
    formData.append('nameColumn', selectedNameColumn);
    formData.append('typeColumn', selectedTypeColumn);
    formData.append('namePosition', JSON.stringify(adjustedName));
    formData.append('typePosition', JSON.stringify(adjustedType));

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

  const canGenerate = pdfFile && csvFile && selectedNameColumn && selectedTypeColumn;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Personlized Invitation
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Upload your PDF template and CSV guest list to generate personalized Gujarati wedding invitations
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Panel - File Uploads */}
          <div className="space-y-6">
            {/* PDF Upload */}
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
                  onChange={handlePdfUpload}
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

            {/* CSV Upload */}
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
                  onChange={handleCsvUpload}
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

            {/* Column Mapping */}
            {csvHeaders.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Column Mapping</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Name Column</label>
                    <select
                      value={selectedNameColumn}
                      onChange={(e) => setSelectedNameColumn(e.target.value)}
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
                      onChange={(e) => setSelectedTypeColumn(e.target.value)}
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
                    onClick={() => handlePageChange('prev')}
                    disabled={currentPage <= 1}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ← Prev
                  </button>
                  <span className="px-3 py-1 text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange('next')}
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
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
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
                    ref={nameLabelRef}
                    className="absolute text-blue-700 text-sm font-semibold cursor-move select-none"
                    style={{
                      left: namePosition.x,
                      top: namePosition.y,
                      opacity: 0.85,
                      display: namePosition.page === currentPage ? 'block' : 'none',
                      backgroundColor: 'rgba(255,255,255,0.2)',
                    }}
                    onMouseDown={(e) => handleMouseDown(e, 'name')}
                  >
                    {csvData?.[0]?.[selectedNameColumn] || 'Test Name'}
                  </span>

                  {/* Draggable Type Label */}
                  <span
                    ref={typeLabelRef}
                    className="absolute text-pink-700 text-sm font-semibold cursor-move select-none"
                    style={{
                      left: typePosition.x,
                      top: typePosition.y,
                      opacity: 0.85,
                      display: typePosition.page === currentPage ? 'block' : 'none',
                      backgroundColor: 'rgba(255,255,255,0.2)',
                    }}
                    onMouseDown={(e) => handleMouseDown(e, 'type')}
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
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">📋 Instructions</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <h4 className="font-medium text-gray-800 mb-2">1. Upload Files</h4>
              <p>Upload your PDF template and CSV file with guest data. The CSV should have columns for names and types (e.g., "સજોડે", "કુટુંબ").</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-2">2. Map Columns</h4>
              <p>Select which CSV columns contain the guest names and invitation types from the dropdown menus.</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-2">3. Position Labels</h4>
              <p>Drag the blue "Name" and pink "Type" labels to where you want the text to appear on each invitation.</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-2">4. Generate</h4>
              <p>Click "Generate All Invitations" to create personalized PDFs for each guest in your CSV file.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
