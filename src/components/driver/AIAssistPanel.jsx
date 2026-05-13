import { useState } from "react";
import { base44 } from "@/api/base44Client";
import {
  Sparkles, Loader2, ChevronDown, ChevronUp,
  AlertTriangle, Tag, FileText, ThumbsUp, ThumbsDown, RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AIAssistPanel({ form, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [feedback, setFeedback] = useState(null); // 'accepted' | 'rejected'

  const runAI = async () => {
    setLoading(true);
    setResult(null);
    setFeedback(null);
    try {
      const hasPhotos = (form.photo_urls || []).length > 0;

      const prompt = `You are an expert AI assistant for Metal X Renewables, a scrap metal and recycling company in Western Australia. Your role is to help drivers accurately classify and document loads.

DOCKET DATA:
- Material described: "${form.goods_weighed || "not specified"}"
- Driver comments: "${form.comments || "none"}"
- Contamination notes: "${form.contamination_notes || "none"}"
- Net weight: ${form.net_tonnes || "unknown"} tonnes
- Gross weight: ${form.gross_tonnes || "unknown"} tonnes
- Tare weight: ${form.tare_tonnes || "unknown"} tonnes
- From location: "${form.from_location || "unknown"}"
- From company: "${form.from_company || "unknown"}"
- Customer: "${form.customer_name || "unknown"}"
- Current material grade: "${form.material_grade || "not yet set"}"
- Photos attached: ${hasPhotos ? (form.photo_urls || []).length + " photos" : "none"}

TASK:
Based on this data, provide accurate classification for Australian scrap metal industry standards:

1. material_grade_suggestion: The single most accurate scrap grade (UPPERCASE). Use Australian industry standards: HEAVY MELT STEEL, LIGHT IRON, COPPER BRIGHT, COPPER BARE, COPPER WIRE, ALUMINIUM EXTRUSION, ALUMINIUM CAST, STAINLESS STEEL 304, STAINLESS STEEL 316, LEAD BATTERY, BRASS YELLOW, MIXED METALS, etc.

2. material_grade_options: 3-5 alternative grade options (UPPERCASE array).

3. contamination_notes: Specific contamination risks based on described material and location (UPPERCASE). Include deduction estimates if contamination is likely. Empty string if clean load expected.

4. smart_comments: 1-2 sentence professional note for the docket record — suitable for client-facing documentation (UPPERCASE).

5. confidence: "HIGH" if material is clearly described, "MEDIUM" if partially ambiguous, "LOW" if very unclear.

6. weight_anomaly: true if gross/tare/net weights appear unusual or inconsistent, false otherwise.

7. recommended_actions: Array of specific action strings the driver should take (e.g. "PHOTOGRAPH CONTAMINATION", "REQUEST CUSTOMER SIGNATURE", "SEPARATE STAINLESS FROM MILD STEEL"). Empty array if no actions needed.`;

      const res = await base44.integrations.Core.InvokeLLM({
        prompt,
        file_urls: (form.photo_urls || []).length > 0 ? form.photo_urls : undefined,
        response_json_schema: {
          type: "object",
          properties: {
            material_grade_suggestion: { type: "string" },
            material_grade_options: { type: "array", items: { type: "string" } },
            contamination_notes: { type: "string" },
            smart_comments: { type: "string" },
            confidence: { type: "string" },
            weight_anomaly: { type: "boolean" },
            recommended_actions: { type: "array", items: { type: "string" } },
          },
        },
      });

      setResult(res);
      setExpanded(true);
    } catch (err) {
      setResult({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  const applyGrade = (grade) => onUpdate({ material_grade: grade });

  const applyAll = () => {
    if (!result) return;
    const updates = {};
    if (result.material_grade_suggestion) updates.material_grade = result.material_grade_suggestion;
    if (result.contamination_notes) updates.contamination_notes = result.contamination_notes;
    if (result.smart_comments && !form.comments) updates.comments = result.smart_comments;
    onUpdate(updates);
    setFeedback("accepted");
  };

  const confidenceColor = { HIGH: "#1B7A45", MEDIUM: "#B45309", LOW: "#DC2626" };
  const confidenceBg = { HIGH: "#EDFBF3", MEDIUM: "#FFFBEB", LOW: "#FEF2F2" };

  return (
    <div className="rounded-[14px] border border-[#DCE9FA] bg-[#EFF4FF] overflow-hidden">
      {/* Header trigger */}
      <button
        type="button"
        onClick={() => (result ? setExpanded((e) => !e) : runAI())}
        disabled={loading}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#E5EEFB] transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#1E4D99] flex items-center justify-center shrink-0">
            {loading ? (
              <Loader2 className="w-4 h-4 text-white animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 text-white" />
            )}
          </div>
          <div className="text-left">
            <p className="text-sm font-bold text-[#1E4D99]">
              {loading ? "AI ANALYSING LOAD…" : result ? "AI ANALYSIS READY" : "RUN AI LOAD ANALYSIS"}
            </p>
            <p className="text-[10px] text-[#1E4D99]/70">
              {loading
                ? "Checking grade, weights & contamination…"
                : result
                ? "Grade · Contamination · Actions · Notes"
                : "AI grades material, checks weights & flags risks"}
            </p>
          </div>
        </div>
        {result && !loading && (
          expanded ? <ChevronUp className="w-4 h-4 text-[#1E4D99]" /> : <ChevronDown className="w-4 h-4 text-[#1E4D99]" />
        )}
      </button>

      {/* Results */}
      {expanded && result && !result.error && (
        <div className="border-t border-[#DCE9FA] px-4 pb-4 space-y-3">

          {/* Confidence + Weight Anomaly */}
          <div className="pt-3 flex items-center justify-between gap-2 flex-wrap">
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black"
              style={{ background: confidenceBg[result.confidence] || "#F4F7FC", color: confidenceColor[result.confidence] || "#7A8898" }}
            >
              <Sparkles className="w-3 h-3" />
              {result.confidence} CONFIDENCE
            </div>
            {result.weight_anomaly && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 text-[10px] font-black text-red-600 border border-red-200">
                <AlertTriangle className="w-3 h-3" /> WEIGHT ANOMALY DETECTED
              </div>
            )}
          </div>

          {/* Material Grade */}
          {result.material_grade_suggestion && (
            <div className="bg-white rounded-[10px] p-3 border border-[#EAEEF5]">
              <div className="flex items-center gap-1.5 mb-2">
                <Tag className="w-3.5 h-3.5 text-[#1E4D99]" />
                <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: "var(--mx-muted)" }}>
                  Suggested Grade
                </span>
              </div>
              <button
                type="button"
                onClick={() => applyGrade(result.material_grade_suggestion)}
                className={`text-sm font-black mb-2 px-3 py-1 rounded-full border transition-all ${
                  form.material_grade === result.material_grade_suggestion
                    ? "bg-[#1E4D99] text-white border-[#1E4D99]"
                    : "text-[#1E4D99] border-[#DCE9FA] hover:border-[#1E4D99]"
                }`}
              >
                {result.material_grade_suggestion}
              </button>
              {result.material_grade_options?.length > 0 && (
                <div>
                  <p className="text-[9px] font-bold text-[#7A8898] mb-1.5">OTHER OPTIONS:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {result.material_grade_options.map((g, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => applyGrade(g)}
                        className={`text-[10px] font-bold px-2 py-1 rounded-full border transition-all ${
                          form.material_grade === g
                            ? "bg-[#1E4D99] text-white border-[#1E4D99]"
                            : "bg-white text-[#1E4D99] border-[#DCE9FA] hover:border-[#1E4D99]"
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Contamination */}
          {result.contamination_notes && (
            <div className="bg-amber-50 rounded-[10px] p-3 border border-amber-200">
              <div className="flex items-center gap-1.5 mb-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span className="text-[9px] font-black uppercase tracking-widest text-amber-700">Contamination Alert</span>
              </div>
              <p className="text-xs text-amber-800">{result.contamination_notes}</p>
            </div>
          )}

          {/* Recommended Actions */}
          {result.recommended_actions?.length > 0 && (
            <div className="bg-[#EFF4FF] rounded-[10px] p-3 border border-[#DCE9FA]">
              <p className="text-[9px] font-black uppercase tracking-widest text-[#1E4D99] mb-2">Recommended Actions</p>
              <div className="flex flex-col gap-1">
                {result.recommended_actions.map((action, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className="w-4 h-4 rounded-full bg-[#1E4D99] flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-[8px] font-bold text-white">{i + 1}</span>
                    </div>
                    <p className="text-[10px] font-semibold text-[#1E4D99]">{action}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Smart Comment */}
          {result.smart_comments && (
            <div className="bg-white rounded-[10px] p-3 border border-[#EAEEF5]">
              <div className="flex items-center gap-1.5 mb-1">
                <FileText className="w-3.5 h-3.5 text-[#1E4D99]" />
                <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: "var(--mx-muted)" }}>
                  Smart Note
                </span>
              </div>
              <p className="text-xs" style={{ color: "var(--mx-text)" }}>{result.smart_comments}</p>
            </div>
          )}

          {/* Feedback row */}
          {feedback ? (
            <div className={`rounded-[10px] p-3 text-center text-xs font-bold ${feedback === "accepted" ? "bg-[#EDFBF3] text-[#1B7A45]" : "bg-[#F4F7FC] text-[#7A8898]"}`}>
              {feedback === "accepted" ? "✓ AI SUGGESTIONS APPLIED" : "FEEDBACK RECORDED — THANK YOU"}
            </div>
          ) : (
            <div className="flex gap-2">
              <Button
                type="button"
                onClick={applyAll}
                className="flex-1 h-9 text-xs font-bold rounded-[10px] bg-[#1E4D99] hover:bg-[#12305C] text-white"
              >
                <ThumbsUp className="w-3.5 h-3.5 mr-1.5" /> APPLY ALL
              </Button>
              <button
                type="button"
                onClick={() => setFeedback("rejected")}
                className="h-9 px-3 rounded-[10px] border border-[#EAEEF5] text-[10px] font-bold text-[#7A8898] hover:bg-[#F4F7FC] flex items-center gap-1"
              >
                <ThumbsDown className="w-3 h-3" /> NOT HELPFUL
              </button>
            </div>
          )}

          {/* Re-run */}
          <button
            type="button"
            onClick={runAI}
            className="w-full text-[10px] text-[#1E4D99] font-semibold flex items-center justify-center gap-1 hover:underline"
          >
            <RefreshCw className="w-3 h-3" /> RE-RUN ANALYSIS
          </button>
        </div>
      )}

      {result?.error && (
        <div className="px-4 pb-4 pt-2 border-t border-[#DCE9FA]">
          <p className="text-xs text-red-500">AI analysis failed: {result.error}</p>
          <button type="button" onClick={runAI} className="text-xs text-[#1E4D99] underline mt-1">
            Try again
          </button>
        </div>
      )}
    </div>
  );
}