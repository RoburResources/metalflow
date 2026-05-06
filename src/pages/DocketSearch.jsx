import { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Search, FileText, Eye, ChevronLeft, X } from "lucide-react";

const statusColors = {
  Draft: 'bg-[#F4F7FC] text-[#7A8898] border-[#EAEEF5]',
  Pending: 'bg-[#EFF4FF] text-[#1E4D99] border-[#DCE9FA]',
  Verified: 'bg-[#EDFBF3] text-[#1B7A45] border-[#C3EDD5]',
  Archived: 'bg-[#F4F4F6] text-[#AAB0C4] border-[#EAEEF5]',
};

export default function DocketSearch() {
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const { data: dockets = [], isLoading } = useQuery({
    queryKey: ['weight-dockets-search'],
    queryFn: () => base44.entities.WeightDocket.list('-order_date', 500),
  });

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return dockets.filter(d => {
      const matchSearch = !q || [d.ticket_no, d.customer_name, d.bill_to_name, d.driver_name, d.rego]
        .filter(Boolean).some(v => v.toLowerCase().includes(q));
      const matchStatus = statusFilter === 'All' || d.status === statusFilter;
      const matchFrom = !fromDate || (d.order_date || '') >= fromDate;
      const matchTo = !toDate || (d.order_date || '') <= toDate;
      return matchSearch && matchStatus && matchFrom && matchTo;
    });
  }, [dockets, search, statusFilter, fromDate, toDate]);

  const clearAll = () => {
    setSearch(''); setFromDate(''); setToDate(''); setStatusFilter('All');
  };

  const hasFilters = search || fromDate || toDate || statusFilter !== 'All';

  return (
    <div className="min-h-screen" style={{ background: 'var(--mx-paper)' }}>
      {/* Nav */}
      <nav className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-[#EAEEF5] shadow-[0_2px_18px_rgba(11,25,41,0.06)]">
        <div className="max-w-6xl mx-auto px-5 h-14 flex items-center gap-3">
          <Link to="/" className="w-8 h-8 flex items-center justify-center rounded-[8px] hover:bg-[#F4F7FC]">
            <ChevronLeft className="w-4 h-4" style={{ color: 'var(--mx-muted)' }} />
          </Link>
          <img src="https://media.base44.com/images/public/69f7b7e128899b8db1200527/c72ebbf3f_MetalXLogo.png" alt="Metal X" className="h-7 object-contain" />
          <span className="text-[10px] font-bold tracking-[2px] uppercase ml-2 pl-3 border-l border-[#EAEEF5]" style={{ color: 'var(--mx-muted-2)' }}>Docket Search</span>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-5 py-8">
        {/* Hero */}
        <div className="rounded-[18px] overflow-hidden mb-6" style={{ background: 'var(--mx-hero-gradient)' }}>
          <div className="px-7 py-5">
            <p className="text-[10px] font-bold tracking-[2px] uppercase text-[#90C4F9]">Metal X Renewables</p>
            <h1 className="text-xl font-black text-white mt-1">Docket Search & History</h1>
            <p className="text-sm text-[#90C4F9] mt-1">Search and filter all weighbridge records by ticket number, customer, date or status</p>
          </div>
          <div className="grid grid-cols-3 border-t border-white/10">
            {[
              { label: 'Total Records', value: dockets.length },
              { label: 'Verified', value: dockets.filter(d => d.status === 'Verified').length },
              { label: 'Showing', value: filtered.length },
            ].map((k, i) => (
              <div key={k.label} className={`px-6 py-3 ${i < 2 ? 'border-r border-white/10' : ''}`}>
                <div className="text-lg font-black text-white">{k.value}</div>
                <div className="text-[10px] font-bold text-[#90C4F9] mt-0.5">{k.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-[14px] border border-[#EAEEF5] shadow-[0_2px_18px_rgba(11,25,41,0.06)] p-5 mb-5">
          {/* Main search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--mx-muted-2)' }} />
            <input
              type="text"
              placeholder="Search by ticket number, customer name, driver or vehicle rego…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 h-11 bg-[#F4F7FC] border border-[#EAEEF5] rounded-[10px] text-sm focus:ring-2 focus:ring-[#1E4D99] outline-none font-medium"
              style={{ color: 'var(--mx-text)' }}
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-4 h-4" style={{ color: 'var(--mx-muted-2)' }} />
              </button>
            )}
          </div>

          {/* Date Range + Status */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold tracking-[1.5px] uppercase" style={{ color: 'var(--mx-muted-2)' }}>From</span>
              <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)}
                className="h-9 px-3 bg-[#F4F7FC] border border-[#EAEEF5] rounded-[8px] text-sm focus:ring-2 focus:ring-[#1E4D99] outline-none" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold tracking-[1.5px] uppercase" style={{ color: 'var(--mx-muted-2)' }}>To</span>
              <input type="date" value={toDate} onChange={e => setToDate(e.target.value)}
                className="h-9 px-3 bg-[#F4F7FC] border border-[#EAEEF5] rounded-[8px] text-sm focus:ring-2 focus:ring-[#1E4D99] outline-none" />
            </div>
            <div className="flex gap-1 ml-auto flex-wrap">
              {['All', 'Draft', 'Pending', 'Verified', 'Archived'].map(s => (
                <button key={s} onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-[8px] text-xs font-semibold border transition-all ${statusFilter === s ? 'bg-[#1E4D99] text-white border-[#1E4D99]' : 'bg-white text-[#7A8898] border-[#EAEEF5] hover:border-[#1E4D99]'}`}>
                  {s}
                </button>
              ))}
            </div>
            {hasFilters && (
              <button onClick={clearAll} className="flex items-center gap-1 text-xs text-[#7A8898] hover:text-[#0D1A2E] underline">
                <X className="w-3 h-3" /> Clear all
              </button>
            )}
          </div>
        </div>

        {/* Results Table */}
        <div className="rounded-[18px] bg-white border border-[#EAEEF5] shadow-[0_2px_18px_rgba(11,25,41,0.06)] overflow-hidden">
          {/* Header */}
          <div className="hidden md:grid grid-cols-[1.4fr_0.9fr_1fr_0.9fr_0.8fr_0.7fr_auto] border-b border-[#EAEEF5] bg-[#F4F7FC]">
            {['Ticket No.', 'Date', 'Customer / Bill To', 'Driver', 'Net (t)', 'Status', ''].map(h => (
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
              <p className="text-sm" style={{ color: 'var(--mx-muted)' }}>
                {dockets.length === 0 ? 'No dockets found.' : 'No results match your search.'}
              </p>
              {hasFilters && <button onClick={clearAll} className="text-xs text-[#1E4D99] underline">Clear filters</button>}
            </div>
          ) : (
            filtered.map(d => (
              <div key={d.id} className="grid grid-cols-1 md:grid-cols-[1.4fr_0.9fr_1fr_0.9fr_0.8fr_0.7fr_auto] border-b border-[#EAEEF5] last:border-b-0 hover:bg-[#F4F7FC] transition-colors">
                <div className="px-4 py-3.5 flex items-center gap-2">
                  <div className="w-7 h-7 rounded-[8px] bg-[#EFF4FF] flex items-center justify-center shrink-0">
                    <FileText className="w-3.5 h-3.5 text-[#1E4D99]" />
                  </div>
                  <span className="text-sm font-bold truncate" style={{ color: 'var(--mx-text)' }}>{d.ticket_no || '—'}</span>
                </div>
                <div className="px-4 py-3.5 flex items-center text-sm" style={{ color: 'var(--mx-muted)' }}>{d.order_date || '—'}</div>
                <div className="px-4 py-3.5 flex items-center text-sm font-semibold truncate" style={{ color: 'var(--mx-text)' }}>{d.customer_name || d.bill_to_name || '—'}</div>
                <div className="px-4 py-3.5 flex items-center text-sm truncate" style={{ color: 'var(--mx-muted)' }}>{d.driver_name || '—'}</div>
                <div className="px-4 py-3.5 flex items-center">
                  <span className="text-sm font-bold" style={{ color: '#1E4D99' }}>
                    {d.net_tonnes ? parseFloat(d.net_tonnes).toFixed(2) + 't' : '—'}
                  </span>
                </div>
                <div className="px-4 py-3.5 flex items-center">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusColors[d.status] || statusColors.Draft}`}>
                    {d.status || 'Draft'}
                  </span>
                </div>
                <div className="px-3 py-3.5 flex items-center">
                  <Link to={`/docket?id=${d.id}`}>
                    <button className="w-7 h-7 rounded-[7px] bg-[#EFF4FF] flex items-center justify-center hover:bg-[#E5EEFB] text-[#1E4D99]">
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </Link>
                </div>
              </div>
            ))
          )}
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