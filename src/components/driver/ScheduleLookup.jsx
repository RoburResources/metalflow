import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Search, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const mx_input = "bg-white border border-[#EAEEF5] rounded-lg text-sm font-medium focus:ring-2 focus:ring-[#1E4D99] focus:border-[#1E4D99] placeholder:text-[#AAB0C4] uppercase";

export default function ScheduleLookup({ onScheduleLoaded, scheduleId, onScheduleIdChange }) {
  const [loading, setLoading] = useState(false);
  const [found, setFound] = useState(null); // null=idle, true=found, false=not found

  const handleLookup = async () => {
    if (!scheduleId?.trim()) return;
    setLoading(true);
    setFound(null);
    try {
      const results = await base44.entities.Schedule.filter({ job_id: scheduleId.trim().toUpperCase() });
      if (results.length > 0) {
        setFound(true);
        onScheduleLoaded(results[0]);
      } else {
        setFound(false);
      }
    } catch {
      setFound(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Label className="text-[10px] font-bold tracking-[1.5px] uppercase" style={{ color: 'var(--mx-muted)' }}>
        Job / Schedule ID (Optional)
      </Label>
      <div className="flex gap-2">
        <Input
          className={mx_input + " flex-1"}
          placeholder="E.G. JOB-001"
          value={scheduleId || ''}
          onChange={e => { onScheduleIdChange(e.target.value.toUpperCase()); setFound(null); }}
          onKeyDown={e => e.key === 'Enter' && handleLookup()}
        />
        <Button
          type="button"
          onClick={handleLookup}
          disabled={!scheduleId?.trim() || loading}
          className="h-9 px-3 rounded-[10px] bg-[#1E4D99] hover:bg-[#12305C] text-white shrink-0"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
        </Button>
      </div>
      {found === true && (
        <p className="text-[11px] text-[#1B7A45] flex items-center gap-1 font-semibold">
          <CheckCircle2 className="w-3.5 h-3.5" /> Schedule found — details pre-filled below
        </p>
      )}
      {found === false && (
        <p className="text-[11px] text-red-500 flex items-center gap-1 font-semibold">
          <XCircle className="w-3.5 h-3.5" /> No schedule found — please fill in manually
        </p>
      )}
    </div>
  );
}