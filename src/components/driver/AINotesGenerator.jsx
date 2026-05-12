import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AINotesGenerator({ field, docketData, onGenerate }) {
  const [loading, setLoading] = useState(false);

  const prompts = {
    contamination_notes: `Based on this load data, generate a contamination assessment in maximum 2 sentences only: 
Material: ${docketData.goods_weighed}
Grade: ${docketData.material_grade}
Pickup from: ${docketData.from_location}
Delivery to: ${docketData.to_location}
Net weight: ${docketData.net_tonnes}t
IMPORTANT: Your response must be 1-2 sentences maximum. No more.`,
    
    comments: `Generate professional Metal X comments for this docket in maximum 2 sentences only:
Material: ${docketData.goods_weighed}
Grade: ${docketData.material_grade}
Driver: ${docketData.driver_name}
Vehicle: ${docketData.rego}
Route: ${docketData.from_location} → ${docketData.to_location}
Net weight: ${docketData.net_tonnes}t
IMPORTANT: Your response must be 1-2 sentences maximum. No more.`
  };

  const handleGenerate = async () => {
    if (!prompts[field]) return;
    setLoading(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompts[field],
        model: 'claude_sonnet_4_6'
      });
      onGenerate(field, response);
    } catch (error) {
      console.error('Failed to generate notes:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleGenerate}
      disabled={loading}
      size="sm"
      variant="outline"
      className="h-7 text-xs gap-1.5"
    >
      {loading ? (
        <>
          <Loader2 className="w-3 h-3 animate-spin" />
          GENERATING…
        </>
      ) : (
        <>
          <Sparkles className="w-3 h-3" />
          AI GENERATE
        </>
      )}
    </Button>
  );
}