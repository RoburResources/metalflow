import { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { ScanLine, Upload, Loader2, CheckCircle2, AlertCircle, Camera } from "lucide-react";

export default function OCRUpload({ onExtracted }) {
  const [status, setStatus] = useState("idle"); // idle | uploading | extracting | done | error
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef = useRef();

  const handleFile = async (file) => {
    if (!file) return;
    setStatus("uploading");
    setErrorMsg("");

    try {
      // 1. Upload the file
      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      // 2. Run OCR extraction
      setStatus("extracting");
      const response = await base44.functions.invoke("extractDocketData", { file_url });
      const extracted = response.data;

      if (extracted.error) {
        setErrorMsg(extracted.error);
        setStatus("error");
        return;
      }

      onExtracted(extracted);
      setStatus("done");

      // Reset after 3s
      setTimeout(() => setStatus("idle"), 3000);
    } catch (err) {
      setErrorMsg(err.message || "Extraction failed");
      setStatus("error");
    }
  };

  const handleInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  };

  return (
    <div className="mb-6">
      <div className="mb-3">
        <p className="text-[10px] font-bold tracking-[2px] uppercase" style={{ color: 'var(--mx-muted-2)' }}>Auto-Fill from Document</p>
        <h3 className="text-base mt-0.5" style={{ color: 'var(--mx-text)', fontWeight: 800 }}>Scan Weighbridge Ticket</h3>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,application/pdf"
        capture="environment"
        className="hidden"
        onChange={handleInputChange}
      />

      {status === "idle" && (
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full flex items-center justify-center gap-3 py-5 rounded-[14px] border-2 border-dashed border-[#DCE9FA] bg-[#EFF4FF] hover:bg-[#E5EEFB] hover:border-[#1E4D99] transition-all group"
        >
          <div className="w-10 h-10 rounded-full bg-[#1E4D99] flex items-center justify-center group-hover:scale-105 transition-transform">
            <Camera className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <p className="text-sm font-bold" style={{ color: '#1E4D99' }}>Take Photo or Upload Document</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--mx-muted)' }}>Snap a weighbridge ticket to auto-fill weight fields</p>
          </div>
          <Upload className="w-4 h-4 ml-auto mr-2" style={{ color: 'var(--mx-muted-2)' }} />
        </button>
      )}

      {(status === "uploading" || status === "extracting") && (
        <div className="w-full flex items-center justify-center gap-3 py-5 rounded-[14px] border border-[#DCE9FA] bg-[#EFF4FF]">
          <Loader2 className="w-5 h-5 text-[#1E4D99] animate-spin" />
          <div>
            <p className="text-sm font-bold text-[#1E4D99]">
              {status === "uploading" ? "Uploading document…" : "Extracting data with AI…"}
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--mx-muted)' }}>This only takes a moment</p>
          </div>
        </div>
      )}

      {status === "done" && (
        <div className="w-full flex items-center justify-center gap-3 py-5 rounded-[14px] border border-[#C3EDD5] bg-[#EDFBF3]">
          <CheckCircle2 className="w-5 h-5 text-[#1B7A45]" />
          <div>
            <p className="text-sm font-bold text-[#1B7A45]">Fields auto-filled from document</p>
            <p className="text-xs mt-0.5 text-[#1B7A45]/70">Review the values below and adjust if needed</p>
          </div>
        </div>
      )}

      {status === "error" && (
        <div className="w-full rounded-[14px] border border-red-200 bg-red-50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <p className="text-sm font-bold text-red-600">Extraction failed</p>
          </div>
          <p className="text-xs text-red-500 mb-3">{errorMsg}</p>
          <button
            onClick={() => setStatus("idle")}
            className="text-xs font-semibold text-red-600 underline"
          >
            Try again
          </button>
        </div>
      )}
    </div>
  );
}