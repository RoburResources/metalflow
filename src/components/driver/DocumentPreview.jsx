import { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Download, Share2, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import DriverDocketProfessionalPreview from "./DriverDocketProfessionalPreview";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function DocumentPreview({ docket, onClose }) {
  const [generating, setGenerating] = useState(false);
  const contentRef = useRef(null);

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

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full flex flex-col max-h-[90vh]">
        <div className="sticky top-0 flex justify-between items-center p-4 border-b bg-white rounded-t-lg z-10">
          <h3 className="font-bold text-[#1E4D99]">DOCKET PREVIEW</h3>
          <button onClick={onClose} className="text-[#7A8898] hover:text-[#0D1A2E]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div ref={contentRef} className="overflow-y-auto flex-1">
          <DriverDocketProfessionalPreview docket={docket} />
        </div>

        <div className="flex gap-3 p-4 border-t bg-[#F5F7FB] sticky bottom-0">
          <Button
            onClick={handleShare}
            variant="outline"
            className="flex-1 h-10 gap-2"
          >
            <Share2 className="w-4 h-4" />
            SHARE
          </Button>
          <Button
            onClick={handleDownloadPDF}
            disabled={generating}
            style={{ background: 'var(--mx-hero-gradient)' }}
            className="flex-1 h-10 text-white font-bold gap-2"
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