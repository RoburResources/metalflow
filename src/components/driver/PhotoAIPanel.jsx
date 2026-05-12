import { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Camera, Loader2, CheckCircle2, AlertTriangle, X, Sparkles, Pen } from "lucide-react";
import PhotoAnnotation from "./PhotoAnnotation";

export default function PhotoAIPanel({ photoUrls, onPhotosChange, onAIResult }) {
  const [uploading, setUploading] = useState(false);
  const [analysing, setAnalysing] = useState(false);
  const [annotatingUrl, setAnnotatingUrl] = useState(null);
  const fileRef = useRef();

  const handleFiles = async (files) => {
    if (!files?.length) return;
    setUploading(true);
    const newUrls = [];
    for (const file of Array.from(files)) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      newUrls.push(file_url);
    }
    const all = [...(photoUrls || []), ...newUrls];
    onPhotosChange(all);
    setUploading(false);

    // Auto-run AI analysis on new photos
    if (newUrls.length > 0) {
      setAnalysing(true);
      try {
        const res = await base44.integrations.Core.InvokeLLM({
          prompt: `Analyse this photo from a metal scrap / recycling truck load in Australia.
Provide:
1. is_relevant: true if it shows materials, a weighbridge, or a vehicle load. false otherwise.
2. material_observed: What material you can see in UPPERCASE (e.g. "HEAVY MELT STEEL", "MIXED METALS") or empty string.
3. contamination_detected: Any contamination visible (e.g. "PLASTIC CONTAMINATION DETECTED", "OIL RESIDUE") in UPPERCASE, or empty string if clean.
4. quality_issues: Any photo quality issues (e.g. "BLURRY IMAGE", "POOR LIGHTING") in UPPERCASE, or empty string.
5. summary: One sentence summary in UPPERCASE.`,
          file_urls: newUrls,
          response_json_schema: {
            type: "object",
            properties: {
              is_relevant: { type: "boolean" },
              material_observed: { type: "string" },
              contamination_detected: { type: "string" },
              quality_issues: { type: "string" },
              summary: { type: "string" }
            }
          }
        });
        onAIResult(res);
      } catch {
        // silent fail on photo analysis
      } finally {
        setAnalysing(false);
      }
    }
  };

  const removePhoto = (url) => onPhotosChange((photoUrls || []).filter(u => u !== url));

  return (
    <div className="flex flex-col gap-3">
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        className="hidden"
        onChange={e => { handleFiles(e.target.files); e.target.value = ""; }}
      />

      {/* Existing photos */}
       {photoUrls?.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {photoUrls.map((url, i) => (
            <div key={i} className="relative rounded-[10px] overflow-hidden aspect-square bg-[#F4F7FC] group">
              <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setAnnotatingUrl(url)}
                  className="w-7 h-7 rounded-full bg-white flex items-center justify-center hover:bg-[#1E4D99] hover:text-white"
                  title="Annotate"
                >
                  <Pen className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => removePhoto(url)}
                  className="w-7 h-7 rounded-full bg-white flex items-center justify-center hover:bg-red-500 hover:text-white"
                  title="Remove"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload button */}
      <button
       type="button"
       onClick={() => fileRef.current?.click()}
       disabled={uploading || analysing}
       className="w-full flex items-center justify-center gap-3 py-5 rounded-[14px] border-2 border-dashed border-[#DCE9FA] bg-[#EFF4FF] hover:bg-[#E5EEFB] hover:border-[#1E4D99] transition-all"
      >
       {uploading ? (
         <><Loader2 className="w-5 h-5 text-[#1E4D99] animate-spin" /><span className="text-sm font-bold text-[#1E4D99]">UPLOADING…</span></>
       ) : analysing ? (
         <><Sparkles className="w-5 h-5 text-[#1E4D99] animate-pulse" /><span className="text-sm font-bold text-[#1E4D99]">AI ANALYSING PHOTO…</span></>
       ) : (
         <><Camera className="w-5 h-5 text-[#1E4D99]" /><span className="text-sm font-bold text-[#1E4D99]">ADD MATERIAL PHOTO</span></>
       )}
      </button>

      {annotatingUrl && (
       <PhotoAnnotation
         photoUrl={annotatingUrl}
         onAnnotationSave={(annotatedUrl) => {
           const idx = photoUrls.indexOf(annotatingUrl);
           const updated = [...photoUrls];
           updated[idx] = annotatedUrl;
           onPhotosChange(updated);
           setAnnotatingUrl(null);
         }}
         onClose={() => setAnnotatingUrl(null)}
       />
      )}
      </div>
      );
      }