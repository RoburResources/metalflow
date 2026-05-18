import { useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ChevronLeft, BarChart2, TrendingUp, PieChart, Scale, Truck, AlertTriangle, MapPin } from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, PieChart as RePieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { format, parseISO, startOfDay, eachDayOfInterval, min, max, subDays } from "date-fns";

const BLUE_PALETTE = ['#1E4D99','#5BA3F5','#90C4F9','#163D80','#3B82F6','#BFDBFE','#1D4ED8','#60A5FA','#93C5FD','#2563EB'];
const STATUS_COLORS = { Draft: '#AAB0C4', Pending: '#5BA3F5', Verified: '#22C55E', Archived: '#E2E8F0' };

const KPI = ({ label, value, sub, icon: Icon }) => (
  <div className="bg-white rounded-[14px] border border-[#EAEEF5] shadow-[0_2px_18px_rgba(11,25,41,0.06)] p-5">
    <div className="w-9 h-9 rounded-[10px] flex items-center justify-center mb-3 bg-[#EFF4FF]">
      <Icon className="w-4 h-4 text-[#1E4D99]" />
    </div>
    <div className="text-2xl font-black" style={{ color: 'var(--mx-text)' }}>{value}</div>
    <div className="text-xs font-semibold mt-0.5" style={{ color: 'var(--mx-muted)' }}>{label}</div>
    {sub && <div className="text-[10px] mt-0.5" style={{ color: 'var(--mx-muted-2)' }}>{sub}</div>}
  </div>
);

const SectionTitle = ({ children }) => (
  <h2 className="text-sm font-bold tracking-[1px] uppercase mb-4" style={{ color: 'var(--mx-muted)' }}>{children}</h2>
);

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-[14px] border border-[#EAEEF5] shadow-[0_2px_18px_rgba(11,25,41,0.06)] p-5 ${className}`}>
    {children}
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-[#EAEEF5] rounded-[10px] shadow-lg px-4 py-3 max-w-[220px]">
      <p className="text-[10px] font-bold tracking-[1px] uppercase mb-1" style={{ color: 'var(--mx-muted-2)' }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-sm font-bold" style={{ color: p.color }}>
          {p.name}: {typeof p.value === 'number' ? p.value.toFixed(2) : p.value}
          {String(p.name).toLowerCase().includes('tonne') || String(p.name).toLowerCase().includes('net') ? 't' : ''}
        </p>
      ))}
    </div>
  );
};

const EmptyState = ({ msg }) => (
  <div className="h-48 flex items-center justify-center text-sm" style={{ color: 'var(--mx-muted)' }}>{msg}</div>
);

export default function Analytics() {
  const [dateRange, setDateRange] = useState('90');

  const { data: dockets = [], isLoading } = useQuery({
    queryKey: ['weight-dockets-analytics'],
    queryFn: () => base44.entities.WeightDocket.list('-order_date', 1000),
  });

  const filtered = useMemo(() => {
    if (dateRange === 'all') return dockets;
    const cutoff = subDays(new Date(), parseInt(dateRange));
    return dockets.filter(d => d.order_date && parseISO(d.order_date) >= cutoff);
  }, [dockets, dateRange]);

  // ── Daily net tonnes by grade (last 30 days) ──────────────────────────────
  const dailyByGrade = useMemo(() => {
    const recent = filtered.filter(d => d.order_date && d.net_tonnes);
    if (!recent.length) return { data: [], grades: [] };
    const dates = recent.map(d => parseISO(d.order_date));
    const start = max([min(dates), subDays(new Date(), parseInt(dateRange === 'all' ? 365 : dateRange))]);
    const end = max(dates);
    const days = eachDayOfInterval({ start, end });
    const allGrades = [...new Set(recent.flatMap(d =>
      d.material_grades?.length ? d.material_grades.map(g => g.grade) : d.material_grade ? [d.material_grade] : []
    ))].slice(0, 6); // top 6 grades for readability

    const data = days.map(day => {
      const label = format(day, 'dd/MM');
      const dayStr = format(day, 'yyyy-MM-dd');
      const row = { label };
      const dayDockets = recent.filter(d => d.order_date === dayStr);
      allGrades.forEach(g => {
        row[g] = dayDockets.reduce((s, d) => {
          const grades = d.material_grades?.length ? d.material_grades : d.material_grade ? [{ grade: d.material_grade }] : [];
          const match = grades.find(x => x.grade === g);
          return match ? s + parseFloat(d.net_tonnes || 0) : s;
        }, 0);
      });
      return row;
    });
    return { data, grades: allGrades };
  }, [filtered, dateRange]);

  // ── Monthly summary ───────────────────────────────────────────────────────
  const monthlyData = useMemo(() => {
    const withDates = filtered.filter(d => d.order_date && d.net_tonnes);
    if (!withDates.length) return [];
    const monthMap = {};
    withDates.forEach(d => {
      const key = d.order_date.slice(0, 7);
      if (!monthMap[key]) monthMap[key] = { net: 0, gross: 0, count: 0 };
      monthMap[key].net += parseFloat(d.net_tonnes || 0);
      monthMap[key].gross += parseFloat(d.gross_tonnes || 0);
      monthMap[key].count++;
    });
    return Object.entries(monthMap).sort(([a], [b]) => a.localeCompare(b)).map(([key, v]) => ({
      label: format(parseISO(key + '-01'), 'MMM yy'),
      net: +v.net.toFixed(2), gross: +v.gross.toFixed(2), count: v.count
    }));
  }, [filtered]);

  // ── Top vehicle registrations ─────────────────────────────────────────────
  const vehicleData = useMemo(() => {
    const map = {};
    filtered.forEach(d => {
      if (!d.rego) return;
      if (!map[d.rego]) map[d.rego] = { rego: d.rego, loads: 0, net: 0, verified: 0 };
      map[d.rego].loads++;
      map[d.rego].net += parseFloat(d.net_tonnes || 0);
      if (d.status === 'Verified') map[d.rego].verified++;
    });
    return Object.values(map)
      .map(v => ({ ...v, net: +v.net.toFixed(2) }))
      .sort((a, b) => b.net - a.net)
      .slice(0, 10);
  }, [filtered]);

  // ── Contamination by location ─────────────────────────────────────────────
  const contaminationByLocation = useMemo(() => {
    const map = {};
    filtered.forEach(d => {
      if (!d.contamination_notes || !d.from_location) return;
      const loc = d.from_location.split(',')[0].trim(); // first part of address
      if (!map[loc]) map[loc] = { location: loc, count: 0, mentions: [] };
      map[loc].count++;
      map[loc].mentions.push(d.contamination_notes.slice(0, 80));
    });
    return Object.values(map).sort((a, b) => b.count - a.count).slice(0, 10);
  }, [filtered]);

  // ── Material grade breakdown ──────────────────────────────────────────────
  const gradeData = useMemo(() => {
    const counts = {}; const tonnes = {};
    filtered.forEach(d => {
      const grades = d.material_grades?.length ? d.material_grades.map(g => g.grade) : d.material_grade ? [d.material_grade] : ['Unspecified'];
      grades.forEach(g => { counts[g] = (counts[g] || 0) + 1; tonnes[g] = (tonnes[g] || 0) + parseFloat(d.net_tonnes || 0); });
    });
    return Object.entries(counts).map(([grade, count]) => ({ grade, count, tonnes: +tonnes[grade].toFixed(2) })).sort((a, b) => b.tonnes - a.tonnes);
  }, [filtered]);

  // ── Status breakdown ──────────────────────────────────────────────────────
  const statusData = useMemo(() => {
    const counts = { Draft: 0, Pending: 0, Verified: 0, Archived: 0 };
    filtered.forEach(d => { if (counts[d.status] !== undefined) counts[d.status]++; });
    return Object.entries(counts).map(([name, value]) => ({ name, value })).filter(d => d.value > 0);
  }, [filtered]);

  const totalNet = filtered.reduce((s, d) => s + parseFloat(d.net_tonnes || 0), 0);
  const verified = filtered.filter(d => d.status === 'Verified').length;
  const avgNet = filtered.filter(d => d.net_tonnes).length ? totalNet / filtered.filter(d => d.net_tonnes).length : 0;
  const topGrade = gradeData[0]?.grade || '—';
  const contaminatedCount = filtered.filter(d => d.contamination_notes).length;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--mx-paper)' }}>
        <div className="w-8 h-8 rounded-full border-2 border-[#EAEEF5] border-t-[#1E4D99] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--mx-paper)' }}>
      {/* Nav */}
      <nav className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-[#EAEEF5] shadow-[0_2px_18px_rgba(11,25,41,0.06)]">
        <div className="max-w-6xl mx-auto px-5 h-14 flex items-center gap-3">
          <Link to="/" className="w-8 h-8 flex items-center justify-center rounded-[8px] hover:bg-[#F4F7FC]">
            <ChevronLeft className="w-4 h-4" style={{ color: 'var(--mx-muted)' }} />
          </Link>
          <img src="https://media.base44.com/images/public/69f7b7e128899b8db1200527/c72ebbf3f_MetalXLogo.png" alt="Metal X" className="h-7 object-contain" />
          <span className="text-[10px] font-bold tracking-[2px] uppercase ml-2 pl-3 border-l border-[#EAEEF5]" style={{ color: 'var(--mx-muted-2)' }}>Operations Analytics</span>
          {/* Date Range Filter */}
          <div className="ml-auto flex gap-1">
            {[['30','30d'], ['90','90d'], ['180','6m'], ['365','1yr'], ['all','All']].map(([v, label]) => (
              <button
                key={v}
                onClick={() => setDateRange(v)}
                className={`px-3 py-1.5 rounded-[8px] text-xs font-semibold border transition-all ${dateRange === v ? 'bg-[#1E4D99] text-white border-[#1E4D99]' : 'bg-white text-[#7A8898] border-[#EAEEF5] hover:border-[#1E4D99]'}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-5 py-8 space-y-8">
        {/* Hero */}
        <div className="rounded-[18px] overflow-hidden" style={{ background: 'var(--mx-hero-gradient)' }}>
          <div className="px-7 py-6">
            <p className="text-[10px] font-bold tracking-[2px] uppercase text-[#90C4F9]">Metal X Renewables</p>
            <h1 className="text-2xl font-black text-white mt-1">Operations Analytics</h1>
            <p className="text-sm text-[#90C4F9] mt-1">Material trends · Fleet performance · Contamination patterns · Grade breakdown</p>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPI icon={Scale} label="Total Net Tonnes" value={totalNet.toFixed(2) + 't'} sub={`${filtered.length} dockets`} />
          <KPI icon={TrendingUp} label="Avg Net/Docket" value={avgNet.toFixed(2) + 't'} sub="All selected period" />
          <KPI icon={BarChart2} label="Verified" value={verified} sub={`${filtered.length > 0 ? Math.round(verified / filtered.length * 100) : 0}% rate`} />
          <KPI icon={AlertTriangle} label="Contamination Flags" value={contaminatedCount} sub={`${filtered.length > 0 ? Math.round(contaminatedCount / filtered.length * 100) : 0}% of loads`} />
        </div>

        {/* Daily Net Tonnes by Grade */}
        <div>
          <SectionTitle>Daily Net Tonnes by Material Grade</SectionTitle>
          <Card>
            {dailyByGrade.data.length < 2 ? (
              <EmptyState msg="Not enough data to chart daily trends." />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dailyByGrade.data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EAEEF5" />
                  <XAxis dataKey="label" tick={{ fontSize: 9, fill: '#7A8898' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 10, fill: '#7A8898' }} axisLine={false} tickLine={false} unit="t" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 10 }} />
                  {dailyByGrade.grades.map((g, i) => (
                    <Bar key={g} dataKey={g} stackId="a" fill={BLUE_PALETTE[i % BLUE_PALETTE.length]} radius={i === dailyByGrade.grades.length - 1 ? [3, 3, 0, 0] : [0, 0, 0, 0]} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>
        </div>

        {/* Monthly Net Tonnes */}
        <div>
          <SectionTitle>Net Tonnes Moved — Monthly</SectionTitle>
          <Card>
            {monthlyData.length < 2 ? (
              <EmptyState msg="Not enough monthly data." />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={monthlyData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="netGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1E4D99" stopOpacity={0.18} />
                      <stop offset="95%" stopColor="#1E4D99" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EAEEF5" />
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#7A8898' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#7A8898' }} axisLine={false} tickLine={false} unit="t" />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="net" name="Net Tonnes" stroke="#1E4D99" strokeWidth={2.5} fill="url(#netGrad)" dot={{ r: 3, fill: '#1E4D99' }} activeDot={{ r: 5 }} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </Card>
        </div>

        {/* Fleet Performance */}
        <div>
          <SectionTitle>Top Vehicle Registrations by Net Tonnes</SectionTitle>
          <Card>
            {vehicleData.length === 0 ? (
              <EmptyState msg="No vehicle data available." />
            ) : (
              <>
                <ResponsiveContainer width="100%" height={Math.max(240, vehicleData.length * 36)}>
                  <BarChart data={vehicleData} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#EAEEF5" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 10, fill: '#7A8898' }} axisLine={false} tickLine={false} unit="t" />
                    <YAxis type="category" dataKey="rego" tick={{ fontSize: 10, fill: '#7A8898' }} axisLine={false} tickLine={false} width={80} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="net" name="Net Tonnes" radius={[0, 4, 4, 0]}>
                      {vehicleData.map((_, i) => <Cell key={i} fill={BLUE_PALETTE[i % BLUE_PALETTE.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#EAEEF5]">
                        {['Rego', 'Loads', 'Net Tonnes', 'Verified', 'Avg/Load'].map(h => (
                          <th key={h} className="px-3 py-2 text-left text-[9px] font-bold tracking-[1.5px] uppercase" style={{ color: 'var(--mx-muted-2)' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {vehicleData.map((v, i) => (
                        <tr key={v.rego} className="border-b border-[#EAEEF5] last:border-0 hover:bg-[#F4F7FC]">
                          <td className="px-3 py-2.5 font-black text-[#1E4D99] flex items-center gap-1.5">
                            <Truck className="w-3.5 h-3.5" /> {v.rego}
                          </td>
                          <td className="px-3 py-2.5 font-semibold" style={{ color: 'var(--mx-muted)' }}>{v.loads}</td>
                          <td className="px-3 py-2.5 font-black" style={{ color: 'var(--mx-text)' }}>{v.net.toFixed(2)}t</td>
                          <td className="px-3 py-2.5">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EDFBF3] text-[#1B7A45] border border-[#C3EDD5]">{v.verified}</span>
                          </td>
                          <td className="px-3 py-2.5 text-xs" style={{ color: 'var(--mx-muted)' }}>{(v.net / v.loads).toFixed(2)}t</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </Card>
        </div>

        {/* Grade + Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <SectionTitle>Net Tonnes by Material Grade</SectionTitle>
            <Card className="h-full">
              {gradeData.length === 0 ? (
                <EmptyState msg="No grade data available." />
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={gradeData} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#EAEEF5" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 10, fill: '#7A8898' }} axisLine={false} tickLine={false} unit="t" />
                    <YAxis type="category" dataKey="grade" tick={{ fontSize: 9, fill: '#7A8898' }} axisLine={false} tickLine={false} width={110} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="tonnes" name="Net Tonnes" radius={[0, 4, 4, 0]}>
                      {gradeData.map((_, i) => <Cell key={i} fill={BLUE_PALETTE[i % BLUE_PALETTE.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Card>
          </div>

          <div>
            <SectionTitle>Docket Status Breakdown</SectionTitle>
            <Card className="h-full">
              {statusData.length === 0 ? (
                <EmptyState msg="No data available." />
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <RePieChart>
                    <Pie data={statusData} cx="50%" cy="50%" innerRadius={65} outerRadius={100} dataKey="value" paddingAngle={3}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                      {statusData.map((entry) => <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || '#CBD5E1'} />)}
                    </Pie>
                    <Tooltip formatter={(val) => [val, 'Dockets']} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                  </RePieChart>
                </ResponsiveContainer>
              )}
            </Card>
          </div>
        </div>

        {/* Contamination by Location */}
        <div>
          <SectionTitle>Contamination Flags by Pickup Location</SectionTitle>
          {contaminationByLocation.length === 0 ? (
            <Card><EmptyState msg="No contamination reports found in selected period." /></Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <ResponsiveContainer width="100%" height={Math.max(200, contaminationByLocation.length * 36)}>
                  <BarChart data={contaminationByLocation} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#EAEEF5" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 10, fill: '#7A8898' }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <YAxis type="category" dataKey="location" tick={{ fontSize: 9, fill: '#7A8898' }} axisLine={false} tickLine={false} width={100} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" name="Reports" fill="#F59E0B" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
              <Card>
                <p className="text-[9px] font-black uppercase tracking-widest mb-3" style={{ color: 'var(--mx-muted-2)' }}>Location Detail</p>
                <div className="space-y-3 max-h-72 overflow-y-auto">
                  {contaminationByLocation.map((loc, i) => (
                    <div key={loc.location} className="flex gap-3 items-start">
                      <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
                        <MapPin className="w-3 h-3 text-amber-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-bold truncate" style={{ color: 'var(--mx-text)' }}>{loc.location}</p>
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 shrink-0">{loc.count}×</span>
                        </div>
                        <p className="text-[10px] mt-0.5 truncate" style={{ color: 'var(--mx-muted)' }}>{loc.mentions[0]}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}
        </div>

        {/* Grade Summary Table */}
        {gradeData.length > 0 && (
          <div>
            <SectionTitle>Material Grade Summary Table</SectionTitle>
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#EAEEF5]">
                      {['Material Grade', 'Dockets', 'Total Net (t)', 'Avg Net (t)'].map(h => (
                        <th key={h} className="px-4 py-2 text-left text-[10px] font-bold tracking-[1.5px] uppercase" style={{ color: 'var(--mx-muted-2)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {gradeData.map((g, i) => (
                      <tr key={g.grade} className={`border-b border-[#EAEEF5] last:border-0 ${i % 2 === 0 ? 'bg-white' : 'bg-[#FAFBFD]'}`}>
                        <td className="px-4 py-3 font-semibold" style={{ color: 'var(--mx-text)' }}>
                          <span className="inline-flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ background: BLUE_PALETTE[i % BLUE_PALETTE.length] }} />
                            {g.grade}
                          </span>
                        </td>
                        <td className="px-4 py-3" style={{ color: 'var(--mx-muted)' }}>{g.count}</td>
                        <td className="px-4 py-3 font-bold" style={{ color: '#1E4D99' }}>{g.tonnes.toFixed(2)}t</td>
                        <td className="px-4 py-3" style={{ color: 'var(--mx-muted)' }}>{(g.tonnes / g.count).toFixed(2)}t</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}