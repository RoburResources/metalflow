import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Sparkles, Loader2 } from "lucide-react";

export default function AIComments({ data, value, onChange }) {
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    const gradeStr = (data.material_grades || []).map(g => {
      let s = g.grade;
      if (data.material_grades.length > 1) s += ` (${g.percentage || 0}%)`;
      if (g.grade === 'Rubbish / Contamination') s += ` - ${g.rubbish_value || 0}${g.rubbish_unit === 'kg' ? 'kg' : '%'}`;
      return s;
    }).join(', ') || data.material_grade || 'unspecified material';

    const prompt = `You are a Metal X Renewables operations officer writing a concise internal docket comment for a weighbridge / grading record. 
    
Docket details:
- Ticket: ${data.ticket_no || 'N/A'}
- Date: ${data.order_date || 'today'}
- From: ${data.from_company ? data.from_company + ', ' : ''}${data.from_location || 'N/A'}
- To: ${data.to_company ? data.to_company + ', ' : ''}${data.to_location || 'N/A'}
- Vehicle Rego: ${data.rego || 'N/A'}
- Driver: ${data.driver_name || 'N/A'}
- Gross: ${data.gross_tonnes || 0}t | Tare: ${data.tare_tonnes || 0}t | Net: ${data.net_tonnes || 0}t
- Material: ${gradeStr}
- Contamination noted: ${data.contamination_notes || 'None'}

Write a professional 1-2 sentence operational comment suitable for an internal Metal X docket. Be factual, precise and concise. Do not add greetings or disclaimers.`;

    const result = await base44.integrations.Core.InvokeLLM({ prompt });
    onChange(result);
    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold tracking-[1.5px] uppercase" style={{ color: 'var(--mx-muted)' }}>Comments</span>
        <button
          onClick={generate}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border border-[#DCE9FA] bg-[#EFF4FF] hover:bg-[#E5EEFB] transition-all"
          style={{ color: '#1E4D99' }}
        >
          {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
          {loading ? 'Generating…' : 'AI Comment'}
        </button>
      </div>
      <textarea
        rows={3}
        className="w-full bg-white border border-[#EAEEF5] rounded-lg text-sm font-medium p-3 focus:ring-2 focus:ring-[#1E4D99] focus:border-[#1E4D99] outline-none resize-none"
        placeholder="Add operational comments or tap AI Comment to auto-generate…"
        value={value || ''}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  );
}