import { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, MapPin } from "lucide-react";
import { Label } from "@/components/ui/label";

const mx_input = "bg-white border border-[#EAEEF5] rounded-lg text-sm font-medium focus:ring-2 focus:ring-[#1E4D99] focus:border-[#1E4D99] placeholder:text-[#AAB0C4] w-full px-3 h-9 outline-none uppercase";

export default function AddressSuggest({ label, value, onChange, placeholder, prefilled }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef(null);
  const wrapRef = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleInput = (val) => {
    const upper = val.toUpperCase();
    onChange(upper);
    clearTimeout(debounceRef.current);
    if (upper.length < 3) { setSuggestions([]); setOpen(false); return; }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await base44.integrations.Core.InvokeLLM({
          prompt: `Suggest 5 real Australian addresses or location names that match "${upper}". Return only a JSON array of strings, each being a complete address in UPPERCASE. No explanation.`,
          response_json_schema: {
            type: "object",
            properties: { suggestions: { type: "array", items: { type: "string" } } }
          }
        });
        setSuggestions(res.suggestions || []);
        setOpen(true);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 700);
  };

  const pick = (s) => { onChange(s); setSuggestions([]); setOpen(false); };

  return (
    <div className="flex flex-col gap-1.5 relative" ref={wrapRef}>
      <Label className="text-[10px] font-bold tracking-[1.5px] uppercase" style={{ color: 'var(--mx-muted)' }}>
        {label}
        {prefilled && <span className="ml-2 text-[#1B7A45] normal-case font-semibold">(from schedule)</span>}
      </Label>
      <div className="relative">
        <input
          className={mx_input}
          placeholder={placeholder}
          value={value || ''}
          onChange={e => handleInput(e.target.value)}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
        />
        {loading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-[#1E4D99]" />}
      </div>
      {open && suggestions.length > 0 && (
        <div className="absolute top-full mt-1 left-0 right-0 z-50 bg-white border border-[#EAEEF5] rounded-[10px] shadow-[0_10px_40px_rgba(11,25,41,0.10)] overflow-hidden">
          {suggestions.map((s, i) => (
            <button
              key={i}
              type="button"
              onClick={() => pick(s)}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-left text-sm hover:bg-[#EFF4FF] border-b border-[#EAEEF5] last:border-b-0"
            >
              <MapPin className="w-3.5 h-3.5 text-[#1E4D99] shrink-0" />
              <span className="truncate" style={{ color: 'var(--mx-text)' }}>{s}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}