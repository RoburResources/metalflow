import { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Download, Share2, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-2xl w-full my-8">
        <div className="sticky top-0 flex justify-between items-center p-4 border-b bg-white rounded-t-lg">
          <h3 className="font-bold text-[#1E4D99]">DOCKET PREVIEW</h3>
          <button onClick={onClose} className="text-[#7A8898] hover:text-[#0D1A2E]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div
          ref={contentRef}
          className="p-8 bg-white"
          style={{ color: 'var(--mx-text)', fontSize: '14px', lineHeight: '1.5' }}
        >
          <div className="text-center mb-6 border-b pb-4">
            <p className="text-[24px] font-black text-[#1E4D99]">METAL X RENEWABLES</p>
            <p className="text-xs mt-1">PO BOX Z5150, ST GEORGES TERRACE 6000</p>
            <p className="text-xs mt-4 font-bold">DRIVER WEIGHBRIDGE DOCKET</p>
            <p className="text-sm font-black mt-1">{docket.ticket_no}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6 text-xs">
            <div>
              <p className="font-bold uppercase">Date</p>
              <p>{docket.order_date}</p>
            </div>
            <div>
              <p className="font-bold uppercase">Vehicle Rego</p>
              <p>{docket.rego}</p>
            </div>
            <div>
              <p className="font-bold uppercase">Driver</p>
              <p>{docket.driver_name}</p>
            </div>
            <div>
              <p className="font-bold uppercase">Customer</p>
              <p>{docket.customer_name}</p>
            </div>
          </div>

          <table className="w-full text-xs mb-6 border-t border-b">
            <tbody>
              <tr className="border-b">
                <td className="py-2 font-bold">FROM</td>
                <td>{docket.from_location} - {docket.from_company}</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 font-bold">TO</td>
                <td>{docket.to_location} - {docket.to_company}</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 font-bold">MATERIAL</td>
                <td>{docket.goods_weighed}</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 font-bold">GRADE</td>
                <td>{docket.material_grade}</td>
              </tr>
            </tbody>
          </table>

          <div className="grid grid-cols-3 gap-4 mb-6 text-xs font-bold">
            <div className="border p-3 text-center">
              <p>GROSS</p>
              <p className="text-xl mt-1">{docket.gross_tonnes}t</p>
            </div>
            <div className="border p-3 text-center">
              <p>TARE</p>
              <p className="text-xl mt-1">{docket.tare_tonnes}t</p>
            </div>
            <div className="border p-3 text-center bg-[#EFF4FF]">
              <p>NET</p>
              <p className="text-xl mt-1 text-[#1E4D99]">{docket.net_tonnes}t</p>
            </div>
          </div>

          {docket.contamination_notes && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded text-xs">
              <p className="font-bold text-amber-800">CONTAMINATION NOTES</p>
              <p className="mt-1 text-amber-700">{docket.contamination_notes}</p>
            </div>
          )}

          {docket.comments && (
            <div className="mb-4 p-3 bg-[#EFF4FF] border border-[#DCE9FA] rounded text-xs">
              <p className="font-bold text-[#1E4D99]">METAL X COMMENTS</p>
              <p className="mt-1 text-[#1E4D99]">{docket.comments}</p>
            </div>
          )}

          <p className="text-center text-[10px] mt-6 pt-6 border-t text-[#7A8898]">
            Generated on {new Date().toLocaleString('en-AU')}
          </p>
        </div>

        <div className="flex gap-3 p-4 border-t bg-[#F5F7FB]">
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