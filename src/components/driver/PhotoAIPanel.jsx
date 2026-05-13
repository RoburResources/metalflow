import { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Camera, Loader2, X, Sparkles, Pen, Upload, ImagePlus, CheckCircle2, AlertTriangle } from "lucide-react";
import PhotoAnnotation from "./PhotoAnnotation";

export default function PhotoAIPanel({ photoUrls, onPhotosChange, onAIResult }) {
  const [uploading, setUploading] = useState(false);
  const [analysing, setAnalysing] = useState(false);
  const [annotatingUrl, setAnnotatingUrl] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [aiSummary, setAiSummary] = useState(null);
  const cameraRef = useRef();
  const galleryRef = useRef();

  const uploadAndAnalyse = async (files) => {
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

    // AI photo analysis
    setAnalysing(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a quality control AI for Metal X Renewables, a scrap metal and recycling company in Western Australia.

Analyse the provided photo(s) of a material load and provide a structured assessment:

1. is_relevant: true if the photo shows materials, a weighbridge, truck load, or recycling yard. false if unrelated.
2. material_observed: Specific scrap metal or recycling material visible (UPPERCASE, e.g. "HEAVY MELT STEEL", "MIXED COPPER", "ALUMINIUM CAST"). Empty string if not visible.
3. contamination_detected: Any contamination visible — plastics, oils, hazardous materials, non-recyclables. Be specific (UPPERCASE). Empty string if clean.
4. quality_issues: Photo quality problems (e.g. "BLURRY", "POOR LIGHTING", "OBSCURED VIEW"). Empty string if good.
5. estimated_load_quality: "PREMIUM", "STANDARD", "MIXED", "CONTAMINATED", or "UNASSESSABLE"
6. summary: One concise sentence describing what is seen (UPPERCASE).`,
        file_urls: newUrls,
        response_json_schema: {
          type: "object",
          properties: {
            is_relevant: { type: "boolean" },
            material_observed: { type: "string" },
            contamination_detected: { type: "string" },
            quality_issues: { type: "string" },
            estimated_load_quality: { type: "string" },
            summary: { type: "string" },
          },
        },
      });
      setAiSummary(res);
      onAIResult(res);
    } catch {
      // silent fail
    } finally {
      setAnalysing(false);
    }
  };

  const removePhoto = (url) => {
    onPhotosChange((photoUrls || []).filter((u) => u !== url));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files?.length) uploadAndAnalyse(files);
  };

  const qualityColor = {
    PREMIUM: { bg: "#EDFBF3", border: "#C3EDD5", text: "#1B7A45" },
    STANDARD: { bg: "#EFF4FF", border: "#DCE9FA", text: "#1E4D99" },
    MIXED: { bg: "#FFFBEB", border: "#FDE68A", text: "#B45309" },
    CONTAMINATED: { bg: "#FEF2F2", border: "#FECACA", text: "#DC2626" },
    UNASSESSABLE: { bg: "#F4F7FC", border: "#EAEEF5", text: "#7A8898" },
  };

  const qStyle = aiSummary?.estimated_load_quality ? qualityColor[aiSummary.estimated_load_quality] : null;

  return (
    <div className="flex flex-col gap-3">
      {/* Hidden file inputs — camera + gallery */}
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        className="hidden"
        onChange={(e) => { uploadAndAnalyse(e.target.files); e.target.value = ""; }}
      />
      <input
        ref={galleryRef}
        type="file"
        accept="image/*,application/pdf"
        multiple
        className="hidden"
        onChange={(e) => { uploadAndAnalyse(e.target.files); e.target.value = ""; }}
      />

      {/* Photo grid */}
      {photoUrls?.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {photoUrls.map((url, i) => (
            <div key={i} className="relative rounded-[10px] overflow-hidden aspect-square bg-[#F4F7FC] group border border-[#EAEEF5]">
              <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setAnnotatingUrl(url)}
                  className="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:bg-[#1E4D99] hover:text-white text-[#1E4D99] transition-colors"
                  title="Annotate"
                >
                  <Pen className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => removePhoto(url)}
                  className="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:bg-red-500 hover:text-white text-[#7A8898] transition-colors"
                  title="Remove"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-[#1E4D99]/80 flex items-center justify-center">
                <span className="text-[8px] font-bold text-white">{i + 1}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* AI result banner */}
      {aiSummary && !analysing && (
        <div
          className="rounded-[12px] p-3 border"
          style={{ background: qStyle?.bg || "#F4F7FC", borderColor: qStyle?.border || "#EAEEF5" }}
        >
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5"
              style={{ background: qStyle?.border || "#EAEEF5" }}>
              {aiSummary.contamination_detected
                ? <AlertTriangle className="w-3.5 h-3.5" style={{ color: qStyle?.text }} />
                : <CheckCircle2 className="w-3.5 h-3.5" style={{ color: qStyle?.text }} />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: qStyle?.text }}>
                  AI PHOTO ASSESSMENT
                </p>
                {aiSummary.estimated_load_quality && (
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: qStyle?.border, color: qStyle?.text }}>
                    {aiSummary.estimated_load_quality}
                  </span>
                )}
              </div>
              {aiSummary.summary && <p className="text-xs font-semibold" style={{ color: 'var(--mx-text)' }}>{aiSummary.summary}</p>}
              {aiSummary.material_observed && (
                <p className="text-[10px] text-[#1E4D99] mt-0.5">Material: {aiSummary.material_observed}</p>
              )}
              {aiSummary.contamination_detected && (
                <p className="text-[10px] text-red-600 mt-0.5">⚠ {aiSummary.contamination_detected}</p>
              )}
              {aiSummary.quality_issues && (
                <p className="text-[10px] text-amber-700 mt-0.5">📷 {aiSummary.quality_issues}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Upload buttons */}
      <div
        className={`rounded-[14px] border-2 border-dashed transition-all ${dragOver ? 'border-[#1E4D99] bg-[#E5EEFB]' : 'border-[#DCE9FA] bg-[#EFF4FF]'}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        {uploading || analysing ? (
          <div className="flex items-center justify-center gap-3 py-5">
            <Loader2 className="w-5 h-5 text-[#1E4D99] animate-spin" />
            <span className="text-sm font-bold text-[#1E4D99]">
              {uploading ? "UPLOADING PHOTOS…" : "AI ANALYSING LOAD…"}
            </span>
          </div>
        ) : (
          <div className="flex divide-x divide-[#DCE9FA]">
            {/* Camera */}
            <button
              type="button"
              onClick={() => cameraRef.current?.click()}
              className="flex-1 flex flex-col items-center gap-1.5 py-4 hover:bg-[#E5EEFB] transition-colors rounded-l-[12px]"
            >
              <Camera className="w-5 h-5 text-[#1E4D99]" />
              <span className="text-[10px] font-bold text-[#1E4D99]">TAKE PHOTO</span>
            </button>
            {/* Gallery upload */}
            <button
              type="button"
              onClick={() => galleryRef.current?.click()}
              className="flex-1 flex flex-col items-center gap-1.5 py-4 hover:bg-[#E5EEFB] transition-colors rounded-r-[12px]"
            >
              <ImagePlus className="w-5 h-5 text-[#1E4D99]" />
              <span className="text-[10px] font-bold text-[#1E4D99]">UPLOAD FILE</span>
            </button>
          </div>
        )}
        {!uploading && !analysing && (
          <p className="text-center text-[9px] pb-2" style={{ color: 'var(--mx-muted-2)' }}>
            Drag & drop • Camera • Gallery • PDF
          </p>
        )}
      </div>

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