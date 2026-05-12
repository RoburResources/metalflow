import { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Download, Share2, X, Loader2, ZoomIn, ZoomOut, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import DriverDocketProfessionalPreview from "./DriverDocketProfessionalPreview";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function DocumentPreview({ docket, onClose }) {
  const [generating, setGenerating] = useState(false);
  const [zoom, setZoom] = useState(100);
  const contentRef = useRef(null);
  const printRef = useRef(null);

  const handleDownloadPDF = async () => {
    setGenerating(true);
    try {
      if (contentRef.current) {
        const canvas = await html2canvas(contentRef.current, { scale: 2 });
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        const imgData = canvas.toDataURL('image/png');
        pdf.addImage(imgData, 'PNG', 10, 10, 190, 277);
        pdf.save(`${docket.ticket_no}.pdf`);
      }
    } catch (error) {
      console.error('PDF generation failed:', error);
    } finally {
      setGenerating(false);
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

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="preview-title">
      <div className="bg-white rounded-lg w-full flex flex-col max-h-[95vh]">
        <div className="flex justify-between items-center p-4 border-b bg-white">
          <h3 id="preview-title" className="font-bold text-[#1E4D99]">DOCKET PREVIEW</h3>
          <button onClick={onClose} className="text-[#7A8898] hover:text-[#0D1A2E]" aria-label="Close preview">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex gap-2 px-4 pt-3 border-b bg-white">
          <Button
            onClick={() => handleZoom('out')}
            variant="outline"
            size="sm"
            disabled={zoom <= 50}
            className="gap-1"
            aria-label="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="text-xs font-semibold text-[#7A8898] px-2 py-2 min-w-12 text-center">{zoom}%</span>
          <Button
            onClick={() => handleZoom('in')}
            variant="outline"
            size="sm"
            disabled={zoom >= 200}
            className="gap-1"
            aria-label="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
        </div>

        <div ref={contentRef} className="flex-1 overflow-auto p-4" style={{ background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div ref={printRef} className="bg-white shadow-lg" style={{ width: '100%', maxWidth: '210mm', aspectRatio: '210/297', display: 'flex', flexDirection: 'column', transform: `scale(${zoom / 100})`, transformOrigin: 'top center', transition: 'transform 0.2s' }}>
            <DriverDocketProfessionalPreview docket={docket} />
          </div>
        </div>

        <div className="flex gap-3 p-4 border-t bg-[#F5F7FB]">
          <Button
            onClick={handleShare}
            variant="outline"
            className="flex-1 h-10 gap-2"
            aria-label="Share docket"
          >
            <Share2 className="w-4 h-4" />
            SHARE
          </Button>
          <Button
            onClick={handlePrint}
            variant="outline"
            className="flex-1 h-10 gap-2"
            aria-label="Print docket"
          >
            <Printer className="w-4 h-4" />
            PRINT
          </Button>
          <Button
            onClick={handleDownloadPDF}
            disabled={generating}
            style={{ background: 'var(--mx-hero-gradient)' }}
            className="flex-1 h-10 text-white font-bold gap-2"
            aria-label="Download as PDF"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                GENERATING…
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                PDF
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}