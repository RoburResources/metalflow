import { useState, useRef } from "react";
import { Download, Loader2 } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import DocketPDFTemplate from "./DocketPDFTemplate";

export default function DocketPDFButton({ docket, className = "" }) {
  const [generating, setGenerating] = useState(false);
  const templateRef = useRef(null);

  const handleDownload = async () => {
    if (generating) return;
    setGenerating(true);
    try {
      // Small delay to ensure template is rendered
      await new Promise(r => setTimeout(r, 100));
      const canvas = await html2canvas(templateRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#FFFFFF",
        logging: false,
      });
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const imgData = canvas.toDataURL("image/png");
      const pageW = 210;
      const pageH = 297;
      const imgW = pageW;
      const imgH = (canvas.height * imgW) / canvas.width;
      // If taller than one page, scale to fit
      if (imgH <= pageH) {
        pdf.addImage(imgData, "PNG", 0, 0, imgW, imgH);
      } else {
        pdf.addImage(imgData, "PNG", 0, 0, imgW, pageH);
      }
      pdf.save(`${docket.ticket_no || "docket"}.pdf`);
    } catch (err) {
      console.error("PDF generation error:", err);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <>
      {/* Hidden template rendered off-screen */}
      <div
        style={{
          position: "fixed",
          left: "-9999px",
          top: 0,
          width: "794px", // ~210mm at 96dpi
          background: "#fff",
          zIndex: -1,
        }}
      >
        <div ref={templateRef}>
          <DocketPDFTemplate docket={docket} />
        </div>
      </div>

      <button
        onClick={handleDownload}
        disabled={generating}
        title="Download PDF"
        className={`w-7 h-7 rounded-[7px] bg-[#EFF4FF] flex items-center justify-center hover:bg-[#E5EEFB] text-[#1E4D99] disabled:opacity-50 ${className}`}
        aria-label={`Download PDF for ${docket.ticket_no}`}
      >
        {generating ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Download className="w-3.5 h-3.5" />
        )}
      </button>
    </>
  );
}