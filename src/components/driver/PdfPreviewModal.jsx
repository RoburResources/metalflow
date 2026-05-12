import { useState, useRef, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Download, Share2, X, Loader2, ZoomIn, ZoomOut, Printer, ChevronLeft, ChevronRight, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import DriverDocketProfessionalPreview from "./DriverDocketProfessionalPreview";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

// Set up the worker for react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export default function PdfPreviewModal({ docket, onClose }) {
  const [generating, setGenerating] = useState(true);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const contentRef = useRef(null);
  const printRef = useRef(null);

  // Generate PDF on mount
  useEffect(() => {
    const generatePDF = async () => {
      try {
        if (contentRef.current) {
          const canvas = await html2canvas(contentRef.current, { scale: 2 });
          const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
          const imgData = canvas.toDataURL('image/png');
          pdf.addImage(imgData, 'PNG', 10, 10, 190, 277);
          const pdfBlob = pdf.output('blob');
          const url = URL.createObjectURL(pdfBlob);
          setPdfUrl(url);
        }
      } catch (error) {
        console.error('PDF generation failed:', error);
      } finally {
        setGenerating(false);
      }
    };

    generatePDF();
  }, [docket]);

  const handleDownloadPDF = async () => {
    if (pdfUrl) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `${docket.ticket_no}.pdf`;
      link.click();
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}?ticket=${docket.ticket_no}`;
    if (navigator.share) {
      navigator.share({
        title: `Docket ${docket.ticket_no}`,
        text: `View docket ${docket.ticket_no}`,
        url
      });
    } else {
      navigator.clipboard.writeText(url);
      alert('Link copied to clipboard');
    }
  };

  const handlePrint = () => {
    if (printRef.current) {
      const printWindow = window.open('', '_blank');
      printWindow.document.write(printRef.current.innerHTML);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleZoom = (direction) => {
    setZoom(prev => direction === 'in' ? Math.min(prev + 10, 200) : Math.max(prev - 10, 50));
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= (numPages || 1)) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="preview-title">
      <div className="bg-white rounded-lg w-full h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b bg-white rounded-t-lg">
          <div>
            <h3 id="preview-title" className="font-bold text-base text-[#1E4D99]">PDF PREVIEW</h3>
            <p className="text-xs text-[#7A8898] mt-0.5">{docket.ticket_no}</p>
          </div>
          <button onClick={onClose} className="text-[#7A8898] hover:text-[#0D1A2E]" aria-label="Close preview">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Control Bar */}
        <div className="flex items-center gap-3 px-6 py-3 border-b bg-[#F5F7FB]">
          <button className="p-2 hover:bg-white rounded-lg text-[#7A8898]" aria-label="Menu">
            <Menu className="w-4 h-4" />
          </button>

          <div className="h-6 w-px bg-[#EAEEF5]" />

          <div className="flex items-center gap-2">
            <Button
              onClick={() => handlePageChange(currentPage - 1)}
              variant="ghost"
              size="icon"
              disabled={currentPage <= 1}
              className="h-8 w-8"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-xs font-semibold text-[#7A8898] px-2 min-w-10 text-center">
              {currentPage} / {numPages || 1}
            </span>
            <Button
              onClick={() => handlePageChange(currentPage + 1)}
              variant="ghost"
              size="icon"
              disabled={currentPage >= (numPages || 1)}
              className="h-8 w-8"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="h-6 w-px bg-[#EAEEF5]" />

          <div className="flex items-center gap-2">
            <Button
              onClick={() => handleZoom('out')}
              variant="ghost"
              size="icon"
              disabled={zoom <= 50}
              className="h-8 w-8"
              aria-label="Zoom out"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-xs font-semibold text-[#7A8898] px-2 min-w-12 text-center">{zoom}%</span>
            <Button
              onClick={() => handleZoom('in')}
              variant="ghost"
              size="icon"
              disabled={zoom >= 200}
              className="h-8 w-8"
              aria-label="Zoom in"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Button
              onClick={handlePrint}
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-[#7A8898]"
              aria-label="Print"
            >
              <Printer className="w-4 h-4" />
            </Button>
            <Button
              onClick={handleShare}
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-[#7A8898]"
              aria-label="Share"
            >
              <Share2 className="w-4 h-4" />
            </Button>
            <Button
              onClick={handleDownloadPDF}
              disabled={generating || !pdfUrl}
              className="h-8 px-3 text-xs font-semibold bg-[#1E4D99] text-white hover:bg-[#1E4D99]/90"
              aria-label="Download as PDF"
            >
              {generating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden gap-4 p-4 bg-[#f5f5f5]">
          {/* PDF Viewer */}
          <div className="flex-1 overflow-auto rounded-lg border border-[#EAEEF5] bg-white p-4">
            {generating ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-[#1E4D99] mx-auto mb-2" />
                  <p className="text-sm text-[#7A8898]">Generating PDF...</p>
                </div>
              </div>
            ) : pdfUrl ? (
              <div style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center', transition: 'transform 0.2s' }}>
                <Document file={pdfUrl} onLoadSuccess={({ numPages }) => setNumPages(numPages)}>
                  <Page pageNumber={currentPage} width={595} />
                </Document>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-sm text-red-500">Failed to generate PDF</p>
              </div>
            )}
          </div>
        </div>

        {/* Hidden rendering element */}
        <div style={{ position: 'absolute', left: '-9999px', width: '210mm', aspectRatio: '210/297' }}>
        </div>
      </div>
    </div>
  );
}