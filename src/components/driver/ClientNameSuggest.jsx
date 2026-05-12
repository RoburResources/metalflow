import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function ClientNameSuggest({ value, onChange, prefilled }) {
  const [input, setInput] = useState(value || "");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const fetchSuggestions = async (query) => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    setLoading(true);
    try {
      const response = await base44.functions.invoke("suggestClientNames", { query });
      setSuggestions(response.data?.suggestions || []);
      setShowSuggestions(true);
    } catch (error) {
      console.error("Failed to fetch suggestions:", error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value.toUpperCase();
    setInput(val);
    onChange(val);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(val);
    }, 300);
  };

  const handleSelectSuggestion = (suggestion) => {
    setInput(suggestion);
    onChange(suggestion);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const mx_input = "bg-white border border-[#EAEEF5] rounded-lg text-sm font-medium focus:ring-2 focus:ring-[#1E4D99] focus:border-[#1E4D99] placeholder:text-[#AAB0C4] uppercase";

  return (
    <div className="flex flex-col gap-1.5 relative" ref={dropdownRef}>
      <Label className="text-[10px] font-bold tracking-[1.5px] uppercase flex items-center gap-2" style={{ color: 'var(--mx-muted)' }}>
        CUSTOMER / CLIENT
        {prefilled && <span className="text-[#1B7A45] normal-case font-semibold text-[9px]">● FROM SCHEDULE</span>}
      </Label>
      <div className="relative">
        <Input
          className={mx_input}
          placeholder="CLIENT NAME"
          value={input}
          onChange={handleInputChange}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="w-4 h-4 text-[#1E4D99] animate-spin" />
          </div>
        )}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#EAEEF5] rounded-lg shadow-lg z-10">
            {suggestions.map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectSuggestion(suggestion)}
                className="w-full text-left px-3 py-2 text-xs font-medium text-[#0D1A2E] hover:bg-[#EFF4FF] border-b border-[#EAEEF5] last:border-b-0 uppercase"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}