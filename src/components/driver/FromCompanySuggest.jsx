import { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function FromCompanySuggest({ value, onChange, prefilled }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const timeoutRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (inputValue) => {
    onChange(inputValue);
    if (!inputValue.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await base44.integrations.Core.InvokeLLM({
          prompt: `List 5 common recycling/scrap metal companies in Western Australia that might pick up materials. The user typed: "${inputValue}". Return as JSON array of company names only, e.g. ["Company A", "Company B"]. Focus on likely matches to what was typed.`,
          response_json_schema: {
            type: "object",
            properties: {
              companies: { type: "array", items: { type: "string" } }
            }
          }
        });
        setSuggestions(response.companies || []);
        setShowSuggestions(true);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  };

  const handleSelectSuggestion = (company) => {
    onChange(company);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  return (
    <div ref={containerRef} className="relative flex flex-col gap-1.5">
      <Label className="text-[10px] font-bold tracking-[1.5px] uppercase flex items-center gap-2" style={{ color: 'var(--mx-muted)' }}>
        FROM COMPANY
        {prefilled && <span className="text-[#1B7A45] normal-case font-semibold text-[9px]">● FROM SCHEDULE</span>}
      </Label>
      <div className="relative">
        <Input
          className="bg-white border border-[#EAEEF5] rounded-lg text-sm font-medium focus:ring-2 focus:ring-[#1E4D99] focus:border-[#1E4D99] placeholder:text-[#AAB0C4] uppercase"
          placeholder="COMPANY NAME"
          value={value || ""}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => value && setSuggestions([]) || setShowSuggestions(false)}
        />
        {loading && <Loader2 className="absolute right-3 top-2.5 w-4 h-4 text-[#1E4D99] animate-spin" />}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#EAEEF5] rounded-lg shadow-lg z-10">
          {suggestions.map((company, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSelectSuggestion(company)}
              className="w-full text-left px-3 py-2 text-sm hover:bg-[#EFF4FF] border-b border-[#EAEEF5] last:border-b-0 uppercase font-medium"
              style={{ color: 'var(--mx-text)' }}
            >
              {company}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}