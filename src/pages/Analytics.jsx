import { useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ChevronLeft, BarChart2, TrendingUp, PieChart, Scale } from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, PieChart as RePieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { format, parseISO, startOfMonth, eachMonthOfInterval, min, max } from "date-fns";

const BLUE_PALETTE = ['#1E4D99','#5BA3F5','#90C4F9','#163D80','#3B82F6','#BFDBFE','#1D4ED8','#60A5FA','#93C5FD','#2563EB'];

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
    <div className="bg-white border border-[#EAEEF5] rounded-[10px] shadow-lg px-4 py-3">
      <p className="text-[10px] font-bold tracking-[1px] uppercase mb-1" style={{ color: 'var(--mx-muted-2)' }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-sm font-bold" style={{ color: p.color }}>
          {p.name}: {typeof p.value === 'number' ? p.value.toFixed(2) : p.value}
          {p.name.toLowerCase().includes('tonne') || p.name.toLowerCase().includes('net') ? 't' : ''}
        </p>
      ))}
    </div>
  );
};

export default function Analytics() {
  const { data: dockets = [], isLoading } = useQuery({
    queryKey: ['weight-dockets-analytics'],
    queryFn: () => base44.entities.WeightDocket.list('-order_date', 1000),
  });

  // Net tonnes by month
  const monthlyData = useMemo(() => {
    const withDates = dockets.filter(d => d.order_date && d.net_tonnes);
    if (!withDates.length) return [];
    const dates = withDates.map(d => parseISO(d.order_date));
    const start = startOfMonth(min(dates));
    const end = startOfMonth(max(dates));
    const months = eachMonthOfInterval({ start, end });
    return months.map(m => {
      const label = format(m, 'MMM yy');
      const inMonth = withDates.filter(d => d.order_date.startsWith(format(m, 'yyyy-MM')));
      const net = inMonth.reduce((s, d) => s + parseFloat(d.net_tonnes || 0), 0);
      const gross = inMonth.reduce((s, d) => s + parseFloat(d.gross_tonnes || 0), 0);
      const count = inMonth.length;
      return { label, net: +net.toFixed(2), gross: +gross.toFixed(2), count };
    });
  }, [dockets]);

  // Material grade breakdown
  const gradeData = useMemo(() => {
    const counts = {};
    const tonnes = {};
    dockets.forEach(d => {
      const grades = d.material_grades?.length
        ? d.material_grades.map(g => g.grade)
        : d.material_grade ? [d.material_grade] : ['Unspecified'];
      grades.forEach(g => {
        counts[g] = (counts[g] || 0) + 1;
        tonnes[g] = (tonnes[g] || 0) + parseFloat(d.net_tonnes || 0);
      });
    });
    return Object.entries(counts)
      .map(([grade, count]) => ({ grade, count, tonnes: +tonnes[grade].toFixed(2) }))
      .sort((a, b) => b.tonnes - a.tonnes);
  }, [dockets]);

  // Status breakdown
  const statusData = useMemo(() => {
    const counts = { Draft: 0, Pending: 0, Verified: 0, Archived: 0 };
    dockets.forEach(d => { if (counts[d.status] !== undefined) counts[d.status]++; });
    return Object.entries(counts).map(([name, value]) => ({ name, value })).filter(d => d.value > 0);
  }, [dockets]);

  const STATUS_COLORS = { Draft: '#AAB0C4', Pending: '#5BA3F5', Verified: '#22C55E', Archived: '#E2E8F0' };

  const totalNet = dockets.reduce((s, d) => s + parseFloat(d.net_tonnes || 0), 0);
  const verified = dockets.filter(d => d.status === 'Verified').length;
  const avgNet = dockets.filter(d => d.net_tonnes).length
    ? totalNet / dockets.filter(d => d.net_tonnes).length : 0;
  const topGrade = gradeData[0]?.grade || '—';

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
          <span className="text-[10px] font-bold tracking-[2px] uppercase ml-2 pl-3 border-l border-[#EAEEF5]" style={{ color: 'var(--mx-muted-2)' }}>Analytics</span>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-5 py-8">
        {/* Hero */}
        <div className="rounded-[18px] overflow-hidden mb-8" style={{ background: 'var(--mx-hero-gradient)' }}>
          <div className="px-7 py-6">
            <p className="text-[10px] font-bold tracking-[2px] uppercase text-[#90C4F9]">Metal X Renewables</p>
            <h1 className="text-2xl font-black text-white mt-1">Operations Analytics</h1>
            <p className="text-sm text-[#90C4F9] mt-1">Tonnage trends, material grade breakdown and docket status overview</p>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <KPI icon={Scale} label="Total Net Tonnes" value={totalNet.toFixed(2) + 't'} sub="All time" />
          <KPI icon={TrendingUp} label="Avg Net per Docket" value={avgNet.toFixed(2) + 't'} sub={`From ${dockets.length} records`} />
          <KPI icon={BarChart2} label="Verified Dockets" value={verified} sub={`${dockets.length > 0 ? Math.round(verified / dockets.length * 100) : 0}% completion rate`} />
          <KPI icon={PieChart} label="Top Material Grade" value={topGrade} sub={gradeData[0] ? `${gradeData[0].tonnes.toFixed(2)}t moved` : ''} />
        </div>

        {/* Monthly Net Tonnes Chart */}
        <div className="mb-6">
          <SectionTitle>Net Tonnes Moved — Monthly</SectionTitle>
          <Card>
            {monthlyData.length < 2 ? (
              <div className="h-64 flex items-center justify-center text-sm" style={{ color: 'var(--mx-muted)' }}>Not enough date data to chart monthly trends.</div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
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

        {/* Monthly Docket Count */}
        <div className="mb-6">
          <SectionTitle>Docket Count — Monthly</SectionTitle>
          <Card>
            {monthlyData.length < 2 ? (
              <div className="h-48 flex items-center justify-center text-sm" style={{ color: 'var(--mx-muted)' }}>Not enough data.</div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={monthlyData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EAEEF5" />
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#7A8898' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#7A8898' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Dockets" fill="#5BA3F5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>
        </div>

        {/* Grade + Status row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Material Grade Tonnes */}
          <div>
            <SectionTitle>Net Tonnes by Material Grade</SectionTitle>
            <Card className="h-full">
              {gradeData.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-sm" style={{ color: 'var(--mx-muted)' }}>No grade data available.</div>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
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

          {/* Status Pie */}
          <div>
            <SectionTitle>Docket Status Breakdown</SectionTitle>
            <Card className="h-full">
              {statusData.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-sm" style={{ color: 'var(--mx-muted)' }}>No data available.</div>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <RePieChart>
                    <Pie
                      data={statusData}
                      cx="50%" cy="50%"
                      innerRadius={60} outerRadius={95}
                      dataKey="value"
                      paddingAngle={3}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {statusData.map((entry) => (
                        <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || '#CBD5E1'} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(val) => [val, 'Dockets']} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                  </RePieChart>
                </ResponsiveContainer>
              )}
            </Card>
          </div>
        </div>

        {/* Grade count table */}
        {gradeData.length > 0 && (
          <div>
            <SectionTitle>Material Grade Summary Table</SectionTitle>
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#EAEEF5]">
                      {['Material Grade', 'Docket Count', 'Total Net (t)', 'Avg Net (t)'].map(h => (
                        <th key={h} className="px-4 py-2 text-left text-[10px] font-bold tracking-[1.5px] uppercase" style={{ color: 'var(--mx-muted-2)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {gradeData.map((g, i) => (
                      <tr key={g.grade} className={`border-b border-[#EAEEF5] last:border-0 ${i % 2 === 0 ? 'bg-white' : 'bg-[#FAFBFD]'}`}>
                        <td className="px-4 py-3 font-semibold" style={{ color: 'var(--mx-text)' }}>
                          <span className="inline-flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: BLUE_PALETTE[i % BLUE_PALETTE.length] }} />
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