import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Sparkles, Loader2, ChevronDown, ChevronUp, AlertTriangle, Tag, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AIAssistPanel({ form, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [expanded, setExpanded] = useState(false);

  const runAI = async () => {
    setLoading(true);
    setResult(null);
    try {
      const prompt = `You are an expert in scrap metal and recycling operations for Metal X Renewables in Australia.
      
Given this driver docket data:
- Goods/Material described: "${form.goods_weighed || 'not specified'}"
- Driver comments: "${form.comments || 'none'}"
- Net weight: ${form.net_tonnes || 'unknown'} tonnes
- From location: "${form.from_location || 'unknown'}"
- Customer: "${form.customer_name || 'unknown'}"
- Photo count: ${(form.photo_urls || []).length}

Please provide:
1. material_grade_suggestion: The most likely scrap metal grade (e.g. "HEAVY MELT STEEL", "COPPER BRIGHT", "ALUMINIUM EXTRUSION", etc.) in UPPERCASE
2. material_grade_options: Array of 3-5 possible grade options in UPPERCASE
3. contamination_notes: Any contamination risks or notes based on the description, in UPPERCASE. Empty string if none.
4. smart_comments: A brief professional operational note for this load in UPPERCASE. 
5. confidence: "HIGH", "MEDIUM" or "LOW"`;

      const res = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            material_grade_suggestion: { type: "string" },
            material_grade_options: { type: "array", items: { type: "string" } },
            contamination_notes: { type: "string" },
            smart_comments: { type: "string" },
            confidence: { type: "string" }
          }
        }
      });
      setResult(res);
      setExpanded(true);
    } catch (err) {
      setResult({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  const applyGrade = (grade) => {
    onUpdate({ material_grade: grade });
  };

  const applyAll = () => {
    if (!result) return;
    const updates = {};
    if (result.material_grade_suggestion) updates.material_grade = result.material_grade_suggestion;
    if (result.contamination_notes) updates.contamination_notes = result.contamination_notes;
    if (result.smart_comments && !form.comments) updates.comments = result.smart_comments;
    onUpdate(updates);
  };

  const confidenceColor = { HIGH: '#1B7A45', MEDIUM: '#B45309', LOW: '#DC2626' };

  return (
    <div className="rounded-[14px] border border-[#DCE9FA] bg-[#EFF4FF] overflow-hidden">
      <button
        type="button"
        onClick={() => result ? setExpanded(e => !e) : runAI()}
        disabled={loading}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#E5EEFB] transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#1E4D99] flex items-center justify-center">
            {loading ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <Sparkles className="w-4 h-4 text-white" />}
          </div>
          <div className="text-left">
            <p className="text-sm font-bold text-[#1E4D99]">
              {loading ? 'AI ANALYSING LOAD…' : result ? 'AI ANALYSIS COMPLETE' : 'RUN AI LOAD ANALYSIS'}
            </p>
            <p className="text-[10px] text-[#1E4D99]/70">
              {loading ? 'Please wait…' : result ? 'Tap to review suggestions' : 'Grade suggestion, contamination check & smart notes'}
            </p>
          </div>
        </div>
        {result && !loading && (expanded ? <ChevronUp className="w-4 h-4 text-[#1E4D99]" /> : <ChevronDown className="w-4 h-4 text-[#1E4D99]" />)}
      </button>

      {expanded && result && !result.error && (
        <div className="px-4 pb-4 space-y-3 border-t border-[#DCE9FA]">
          {/* Confidence */}
          <div className="pt-3 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--mx-muted)' }}>AI Confidence</span>
            <span className="text-xs font-black" style={{ color: confidenceColor[result.confidence] || '#7A8898' }}>
              {result.confidence}
            </span>
          </div>

          {/* Material Grade */}
          {result.material_grade_suggestion && (
            <div className="bg-white rounded-[10px] p-3 border border-[#EAEEF5]">
              <div className="flex items-center gap-1.5 mb-2">
                <Tag className="w-3.5 h-3.5 text-[#1E4D99]" />
                <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--mx-muted)' }}>Suggested Grade</span>
              </div>
              <p className="text-sm font-black text-[#1E4D99] mb-2">{result.material_grade_suggestion}</p>
              {result.material_grade_options?.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {result.material_grade_options.map((g, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => applyGrade(g)}
                      className={`text-[10px] font-bold px-2 py-1 rounded-full border transition-all ${form.material_grade === g ? 'bg-[#1E4D99] text-white border-[#1E4D99]' : 'bg-white text-[#1E4D99] border-[#DCE9FA] hover:border-[#1E4D99]'}`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Contamination */}
          {result.contamination_notes && (
            <div className="bg-amber-50 rounded-[10px] p-3 border border-amber-200">
              <div className="flex items-center gap-1.5 mb-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-700">Contamination Alert</span>
              </div>
              <p className="text-xs text-amber-800">{result.contamination_notes}</p>
            </div>
          )}

          {/* Smart Comment */}
          {result.smart_comments && (
            <div className="bg-white rounded-[10px] p-3 border border-[#EAEEF5]">
              <div className="flex items-center gap-1.5 mb-1">
                <FileText className="w-3.5 h-3.5 text-[#1E4D99]" />
                <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--mx-muted)' }}>Smart Note</span>
              </div>
              <p className="text-xs" style={{ color: 'var(--mx-text)' }}>{result.smart_comments}</p>
            </div>
          )}

          {/* Apply All */}
          <Button
            type="button"
            onClick={applyAll}
            className="w-full h-9 text-xs font-bold rounded-[10px] bg-[#1E4D99] hover:bg-[#12305C] text-white"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1.5" /> APPLY AI SUGGESTIONS
          </Button>

          <button
            type="button"
            onClick={runAI}
            className="w-full text-[11px] text-[#1E4D99] underline font-semibold text-center"
          >
            Re-run analysis
          </button>
        </div>
      )}

      {result?.error && (
        <div className="px-4 pb-4 pt-2 border-t border-[#DCE9FA]">
          <p className="text-xs text-red-500">AI analysis failed: {result.error}</p>
          <button type="button" onClick={runAI} className="text-xs text-[#1E4D99] underline mt-1">Try again</button>
        </div>
      )}
    </div>
  );
}