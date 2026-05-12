import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Search, Plus, FileText, Trash2, Eye, Truck, ShieldCheck, BarChart2, CalendarDays, Users } from "lucide-react";
import MXLogo from "@/components/docket/MXLogo";

const statusColors = {
  Draft: 'bg-[#F4F7FC] text-[#7A8898] border-[#EAEEF5]',
  Pending: 'bg-[#EFF4FF] text-[#1E4D99] border-[#DCE9FA]',
  Verified: 'bg-[#EDFBF3] text-[#1B7A45] border-[#C3EDD5]',
  Archived: 'bg-[#F4F4F6] text-[#AAB0C4] border-[#EAEEF5]',
};

// eslint-disable-next-line no-unused-vars
const KPI = ({ label, value, sub, icon: Icon, color }) => (
  <div className="rounded-[14px] bg-white border border-[#EAEEF5] shadow-[0_2px_18px_rgba(11,25,41,0.06)] p-5">
    <div className="flex items-start justify-between mb-3">
      <div className={`w-9 h-9 rounded-[10px] flex items-center justify-center ${color}`}>
        <Icon className="w-4 h-4" />
      </div>
    </div>
    <div className="text-2xl font-900 mb-0.5" style={{ fontWeight: 900, color: 'var(--mx-text)' }}>{value}</div>
    <div className="text-xs font-semibold" style={{ color: 'var(--mx-muted)' }}>{label}</div>
    {sub && <div className="text-[10px] mt-0.5" style={{ color: 'var(--mx-muted-2)' }}>{sub}</div>}
  </div>
);

export default function Dashboard() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("");

  const { data: dockets = [], isLoading } = useQuery({
    queryKey: ['weight-dockets'],
    queryFn: () => base44.entities.WeightDocket.list('-created_date', 200),
  });

  const del = useMutation({
    mutationFn: (id) => base44.entities.WeightDocket.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['weight-dockets'] }),
  });

  const filtered = dockets.filter(d => {
    const q = search.toLowerCase();
    const matchSearch = !q || [d.ticket_no, d.rego, d.driver_name, d.from_location, d.to_location, d.bill_to_name, d.customer_name]
      .filter(Boolean).some(v => v.toLowerCase().includes(q));
    const matchStatus = statusFilter === 'All' || d.status === statusFilter;
    const matchDate = !dateFilter || (d.order_date || '').startsWith(dateFilter);
    return matchSearch && matchStatus && matchDate;
  });

  const totalNet = dockets.reduce((s, d) => s + (parseFloat(d.net_tonnes) || 0), 0);
  const verified = dockets.filter(d => d.status === 'Verified').length;
  const today = dockets.filter(d => (d.order_date || '') === new Date().toISOString().slice(0, 10)).length;

  return (
    <div className="min-h-screen" style={{ background: 'var(--mx-paper)' }}>
      {/* Nav */}
      <nav className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-[#EAEEF5] shadow-[0_2px_18px_rgba(11,25,41,0.06)]">
        <div className="max-w-7xl mx-auto px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="https://media.base44.com/images/public/69f7b7e128899b8db1200527/c72ebbf3f_MetalXLogo.png" alt="Metal X" className="h-8 object-contain" />
            <span className="text-[10px] font-bold tracking-[2px] uppercase ml-2 pl-3 border-l border-[#EAEEF5]" style={{ color: 'var(--mx-muted-2)' }}>Operations Dashboard</span>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/driver">
              <button className="text-[#1E4D99] text-xs font-semibold rounded-[10px] h-9 px-3 flex items-center gap-1.5 border border-[#DCE9FA] bg-[#EFF4FF] hover:bg-[#E5EEFB]">
                <Truck className="w-4 h-4" /> Driver Portal
              </button>
            </Link>
            <Link to="/clients">
              <button className="text-[#1E4D99] text-xs font-semibold rounded-[10px] h-9 px-3 flex items-center gap-1.5 border border-[#DCE9FA] bg-[#EFF4FF] hover:bg-[#E5EEFB]">
                <Users className="w-4 h-4" /> Clients
              </button>
            </Link>
            <Link to="/schedules">
              <button className="text-[#1E4D99] text-xs font-semibold rounded-[10px] h-9 px-3 flex items-center gap-1.5 border border-[#DCE9FA] bg-[#EFF4FF] hover:bg-[#E5EEFB]">
                <CalendarDays className="w-4 h-4" /> Schedule
              </button>
            </Link>
            <Link to="/fleet">
              <button className="text-[#1E4D99] text-xs font-semibold rounded-[10px] h-9 px-3 flex items-center gap-1.5 border border-[#DCE9FA] bg-[#EFF4FF] hover:bg-[#E5EEFB]">
                <Truck className="w-4 h-4" /> Fleet
              </button>
            </Link>
            <Link to="/search">
              <button className="text-[#1E4D99] text-xs font-semibold rounded-[10px] h-9 px-3 flex items-center gap-1.5 border border-[#DCE9FA] bg-[#EFF4FF] hover:bg-[#E5EEFB]">
                <Search className="w-4 h-4" /> Search
              </button>
            </Link>
            <Link to="/analytics">
              <button className="text-[#1E4D99] text-xs font-semibold rounded-[10px] h-9 px-3 flex items-center gap-1.5 border border-[#DCE9FA] bg-[#EFF4FF] hover:bg-[#E5EEFB]">
                <BarChart2 className="w-4 h-4" /> Analytics
              </button>
            </Link>
            <Link to="/audit">
              <button className="text-[#1E4D99] text-xs font-semibold rounded-[10px] h-9 px-3 flex items-center gap-1.5 border border-[#DCE9FA] bg-[#EFF4FF] hover:bg-[#E5EEFB]">
                <ShieldCheck className="w-4 h-4" /> Audit
              </button>
            </Link>
            <Link to="/docket">
              <button style={{ background: 'var(--mx-hero-gradient)' }} className="text-white text-sm font-semibold rounded-[10px] h-9 px-4 flex items-center gap-1.5">
                <Plus className="w-4 h-4" /> New Docket
              </button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-5 py-8">
        {/* Hero */}
        <div className="rounded-[18px] overflow-hidden mb-8" style={{ background: 'var(--mx-hero-gradient)' }}>
          <div className="px-7 py-6">
            <p className="text-[10px] font-bold tracking-[2px] uppercase text-[#90C4F9]">Metal X Renewables</p>
            <h1 className="text-2xl font-900 text-white mt-1" style={{ fontWeight: 900 }}>Weight Docket Dashboard</h1>
            <p className="text-sm text-[#90C4F9] mt-1">All weighbridge records, grading dockets and material movements</p>
          </div>
          <div className="grid grid-cols-4 border-t border-white/10">
            {[
              { label: 'Total Dockets', value: dockets.length, sub: 'All time' },
              { label: 'Today', value: today, sub: 'Dockets today' },
              { label: 'Total Net (t)', value: totalNet.toFixed(2), sub: 'Tonnes weighed' },
              { label: 'Verified', value: verified, sub: 'Completed' },
            ].map((k, i) => (
              <div key={k.label} className={`px-6 py-4 ${i < 3 ? 'border-r border-white/10' : ''}`}>
                <div className="text-xl font-900 text-white" style={{ fontWeight: 900 }}>{k.value}</div>
                <div className="text-[10px] font-bold text-[#90C4F9] mt-0.5">{k.label}</div>
                <div className="text-[9px] text-[#5BA3F5]">{k.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--mx-muted-2)' }} />
            <input
              type="text"
              placeholder="Search ticket, rego, driver, location…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 h-10 bg-white border border-[#EAEEF5] rounded-[10px] text-sm focus:ring-2 focus:ring-[#1E4D99] outline-none"
            />
          </div>
          <div className="flex gap-1">
            {['All', 'Draft', 'Pending', 'Verified', 'Archived'].map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-2 rounded-[8px] text-xs font-semibold border transition-all ${statusFilter === s ? 'bg-[#1E4D99] text-white border-[#1E4D99]' : 'bg-white text-[#7A8898] border-[#EAEEF5] hover:border-[#1E4D99]'}`}
              >
                {s}
              </button>
            ))}
          </div>
          <input
            type="date"
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value)}
            className="h-10 px-3 bg-white border border-[#EAEEF5] rounded-[10px] text-sm focus:ring-2 focus:ring-[#1E4D99] outline-none"
          />
          {(search || statusFilter !== 'All' || dateFilter) && (
            <button onClick={() => { setSearch(''); setStatusFilter('All'); setDateFilter(''); }} className="text-xs text-[#7A8898] hover:text-[#0D1A2E] underline">
              Clear
            </button>
          )}
        </div>

        {/* Table */}
        <div className="rounded-[18px] bg-white border border-[#EAEEF5] shadow-[0_2px_18px_rgba(11,25,41,0.06)] overflow-hidden">
          {/* Table header */}
          <div className="hidden md:grid grid-cols-[1.4fr_1fr_0.9fr_0.9fr_0.9fr_0.8fr_0.8fr_auto] gap-0 border-b border-[#EAEEF5] bg-[#F4F7FC]">
            {['Ticket No.', 'Date', 'Vehicle Rego', 'Driver', 'Net (t)', 'From', 'Status', ''].map(h => (
              <div key={h} className="px-4 py-3 text-[10px] font-bold tracking-[1.5px] uppercase" style={{ color: 'var(--mx-muted-2)' }}>{h}</div>
            ))}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <div className="w-8 h-8 rounded-full border-2 border-[#EAEEF5] border-t-[#1E4D99] animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 gap-3">
              <FileText className="w-8 h-8" style={{ color: 'var(--mx-muted-2)' }} />
              <p className="text-sm" style={{ color: 'var(--mx-muted)' }}>{dockets.length === 0 ? 'No dockets yet.' : 'No results match your filters.'}</p>
            </div>
          ) : filtered.map(d => (
            <div key={d.id} className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr_0.9fr_0.9fr_0.9fr_0.8fr_0.8fr_auto] gap-0 border-b border-[#EAEEF5] last:border-b-0 hover:bg-[#F4F7FC] transition-colors">
              <div className="px-4 py-3.5 flex items-center gap-2">
                <div className="w-7 h-7 rounded-[8px] bg-[#EFF4FF] flex items-center justify-center shrink-0">
                  <FileText className="w-3.5 h-3.5 text-[#1E4D99]" />
                </div>
                <span className="text-sm font-700 truncate" style={{ fontWeight: 700, color: 'var(--mx-text)' }}>{d.ticket_no || '—'}</span>
              </div>
              <div className="px-4 py-3.5 flex items-center text-sm" style={{ color: 'var(--mx-muted)' }}>{d.order_date || '—'}</div>
              <div className="px-4 py-3.5 flex items-center text-sm font-semibold" style={{ color: 'var(--mx-text)' }}>{d.rego || '—'}</div>
              <div className="px-4 py-3.5 flex items-center text-sm" style={{ color: 'var(--mx-muted)' }}>{d.driver_name || '—'}</div>
              <div className="px-4 py-3.5 flex items-center">
                <span className="text-sm font-700" style={{ fontWeight: 700, color: '#1E4D99' }}>
                  {d.net_tonnes ? parseFloat(d.net_tonnes).toFixed(2) + 't' : '—'}
                </span>
              </div>
              <div className="px-4 py-3.5 flex items-center text-xs truncate" style={{ color: 'var(--mx-muted)' }}>{d.from_location || '—'}</div>
              <div className="px-4 py-3.5 flex items-center">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusColors[d.status] || statusColors.Draft}`}>
                  {d.status || 'Draft'}
                </span>
              </div>
              <div className="px-3 py-3.5 flex items-center gap-1">
                <Link to={`/docket?id=${d.id}`}>
                  <button className="w-7 h-7 rounded-[7px] bg-[#EFF4FF] flex items-center justify-center hover:bg-[#E5EEFB] text-[#1E4D99]">
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                </Link>
                <button onClick={() => { if (confirm('Delete this docket?')) del.mutate(d.id); }} className="w-7 h-7 rounded-[7px] bg-[#F4F7FC] flex items-center justify-center hover:bg-red-50 text-[#AAB0C4] hover:text-red-400">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {filtered.length > 0 && (
          <p className="text-[10px] mt-3 text-right" style={{ color: 'var(--mx-muted-2)' }}>
            Showing {filtered.length} of {dockets.length} records
          </p>
        )}
      </main>
    </div>
  );
}