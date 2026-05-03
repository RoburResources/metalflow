import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, Plus } from "lucide-react";

const GRADES = [
  "HMS 1&2", "HMS 1", "HMS 2", "Light Iron", "Shredder Feed",
  "Cast Iron", "Stainless Steel 304", "Stainless Steel 316",
  "Copper", "Brass", "Aluminium Cast", "Aluminium Extrusion",
  "Aluminium Turnings", "Lead", "Zinc", "Tin",
  "Electric Motors", "Wire / Cable", "Batteries",
  "Rubbish / Contamination", "Other"
];

const isRubbish = (g) => g === "Rubbish / Contamination";

export default function MaterialGradeSelector({ grades = [], onChange }) {
  const [search, setSearch] = useState("");

  const toggleGrade = (grade) => {
    if (grades.find(g => g.grade === grade)) {
      onChange(grades.filter(g => g.grade !== grade));
    } else {
      onChange([...grades, { grade, percentage: grades.length === 0 ? 100 : 0, rubbish_unit: "percentage", rubbish_value: 0 }]);
    }
  };

  const updateField = (grade, field, value) => {
    onChange(grades.map(g => g.grade === grade ? { ...g, [field]: value } : g));
  };

  const autoBalance = (changedGrade, newPct) => {
    const others = grades.filter(g => g.grade !== changedGrade);
    if (others.length === 0) {
      onChange(grades.map(g => g.grade === changedGrade ? { ...g, percentage: Math.min(100, Math.max(0, newPct)) } : g));
      return;
    }
    const remaining = 100 - Math.min(100, Math.max(0, newPct));
    const totalOthers = others.reduce((s, g) => s + (g.percentage || 0), 0) || 1;
    onChange(grades.map(g => g.grade === changedGrade
      ? { ...g, percentage: Math.min(100, Math.max(0, newPct)) }
      : { ...g, percentage: Math.round((g.percentage / totalOthers) * remaining) }
    ));
  };

  const totalPct = grades.reduce((s, g) => s + (g.percentage || 0), 0);
  const filtered = GRADES.filter(g => g.toLowerCase().includes(search.toLowerCase()));
  const multi = grades.length > 1;

  return (
    <div className="flex flex-col gap-4">
      {/* Selected grades */}
      {grades.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-[1.5px] uppercase" style={{ color: 'var(--mx-muted)' }}>Selected Grades</span>
            {multi && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${totalPct === 100 ? 'bg-[#EDFBF3] text-[#1B7A45]' : 'bg-[#FEF3CD] text-[#92610B]'}`}>
                Total: {totalPct}%
              </span>
            )}
          </div>
          {grades.map(g => (
            <div key={g.grade} className="rounded-[10px] border border-[#EAEEF5] bg-[#F4F7FC] p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-700" style={{ fontWeight: 700, color: 'var(--mx-text)' }}>{g.grade}</span>
                <button onClick={() => toggleGrade(g.grade)} className="w-5 h-5 rounded-full bg-[#EAEEF5] hover:bg-red-100 hover:text-red-500 flex items-center justify-center">
                  <X className="w-3 h-3" />
                </button>
              </div>
              {multi && (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-[#7A8898] w-16">Split %</span>
                  <input
                    type="range" min={0} max={100} step={1}
                    value={g.percentage || 0}
                    onChange={e => autoBalance(g.grade, parseInt(e.target.value))}
                    className="flex-1 accent-[#1E4D99]"
                  />
                  <input
                    type="number" min={0} max={100}
                    value={g.percentage || 0}
                    onChange={e => autoBalance(g.grade, parseInt(e.target.value))}
                    className="w-14 text-center text-xs font-700 border border-[#EAEEF5] rounded-[6px] bg-white h-7"
                    style={{ fontWeight: 700 }}
                  />
                  <span className="text-[10px] text-[#7A8898]">%</span>
                </div>
              )}
              {isRubbish(g.grade) && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-[#7A8898] w-16">Unit</span>
                  <div className="flex gap-1">
                    {['percentage', 'kg'].map(u => (
                      <button
                        key={u}
                        onClick={() => updateField(g.grade, 'rubbish_unit', u)}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-all ${g.rubbish_unit === u ? 'bg-[#1E4D99] text-white border-[#1E4D99]' : 'bg-white text-[#7A8898] border-[#EAEEF5]'}`}
                      >
                        {u === 'percentage' ? '%' : 'kg'}
                      </button>
                    ))}
                  </div>
                  <input
                    type="number" min={0} step={g.rubbish_unit === 'kg' ? 1 : 0.1}
                    value={g.rubbish_value || ''}
                    onChange={e => updateField(g.grade, 'rubbish_value', parseFloat(e.target.value))}
                    placeholder="0"
                    className="w-16 text-xs font-700 border border-[#EAEEF5] rounded-[6px] bg-white h-7 px-2"
                  />
                  <span className="text-[10px] text-[#7A8898]">{g.rubbish_unit === 'kg' ? 'kg' : '%'}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Grade picker */}
      <div>
        <span className="text-[10px] font-bold tracking-[1.5px] uppercase mb-2 block" style={{ color: 'var(--mx-muted)' }}>Add Grade</span>
        <Input
          placeholder="Search grades…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="mb-2 bg-white border border-[#EAEEF5] rounded-lg text-sm"
        />
        <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
          {filtered.map(grade => {
            const selected = grades.find(g => g.grade === grade);
            return (
              <button
                key={grade}
                onClick={() => toggleGrade(grade)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  selected
                    ? 'bg-[#1E4D99] text-white border-[#1E4D99]'
                    : 'bg-white text-[#0D1A2E] border-[#EAEEF5] hover:border-[#1E4D99] hover:bg-[#EFF4FF]'
                }`}
              >
                {selected ? '✓ ' : ''}{grade}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}