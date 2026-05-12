import { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Search, FileText, Eye, ChevronLeft, X, Download, FileDown } from "lucide-react";
import { jsPDF } from "jspdf";

const statusColors = {
  Draft: 'bg-[#F4F7FC] text-[#7A8898] border-[#EAEEF5]',
  Pending: 'bg-[#EFF4FF] text-[#1E4D99] border-[#DCE9FA]',
  Verified: 'bg-[#EDFBF3] text-[#1B7A45] border-[#C3EDD5]',
  Archived: 'bg-[#F4F4F6] text-[#AAB0C4] border-[#EAEEF5]',
};

const fmt = (v) => v || '—';
const fmtNum = (v) => v ? parseFloat(v).toFixed(2) : '—';

function exportCSV(dockets) {
  const cols = ['Ticket No.', 'Order Date', 'Customer', 'Bill To', 'Driver', 'Rego', 'Gross (t)', 'Tare (t)', 'Net (t)', 'Status', 'Payment Status', 'From', 'To', 'Material Grade'];
  const rows = dockets.map(d => [
    d.ticket_no, d.order_date, d.customer_name, d.bill_to_name, d.driver_name, d.rego,
    d.gross_tonnes, d.tare_tonnes, d.net_tonnes, d.status, d.payment_status,
    d.from_location, d.to_location,
    d.material_grades?.map(g => g.grade).join('; ') || d.material_grade || '',
  ].map(v => `"${(v ?? '').toString().replace(/"/g, '""')}"`));
  const csv = [cols.map(c => `"${c}"`).join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `metal-x-dockets-${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function exportPDF(dockets) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const BLUE = '#1E4D99';

  // Header
  doc.setFillColor(8, 17, 31);
  doc.rect(0, 0, pageW, 18, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Metal X Renewables — Docket Report', 10, 11);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(144, 196, 249);
  doc.text(`Generated: ${new Date().toLocaleDateString('en-AU')}  |  ${dockets.length} records`, pageW - 10, 11, { align: 'right' });

  // Table columns
  const cols = [
    { label: 'Ticket No.', w: 32 },
    { label: 'Date', w: 22 },
    { label: 'Customer', w: 36 },
    { label: 'Driver', w: 28 },
    { label: 'Rego', w: 20 },
    { label: 'Gross (t)', w: 20 },
    { label: 'Tare (t)', w: 20 },
    { label: 'Net (t)', w: 20 },
    { label: 'Status', w: 22 },
    { label: 'From', w: 30 },
    { label: 'To', w: 30 },
  ];

  let x = 10, y = 26;

  // Column headers
  doc.setFillColor(239, 244, 255);
  doc.rect(x, y - 5, pageW - 20, 8, 'F');
  doc.setTextColor(30, 77, 153);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  cols.forEach(col => {
    doc.text(col.label, x + 1, y);
    x += col.w;
  });
  y += 5;

  // Rows
  dockets.forEach((d, i) => {
    if (y > 185) {
      doc.addPage();
      y = 15;
      // Re-draw header on new page
      doc.setFillColor(239, 244, 255);
      doc.rect(10, y - 5, pageW - 20, 8, 'F');
      doc.setTextColor(30, 77, 153);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      x = 10;
      cols.forEach(col => { doc.text(col.label, x + 1, y); x += col.w; });
      y += 5;
    }
    x = 10;
    doc.setFillColor(i % 2 === 0 ? 250 : 255, i % 2 === 0 ? 251 : 255, i % 2 === 0 ? 253 : 255);
    doc.rect(x, y - 4, pageW - 20, 6, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(13, 26, 46);
    const vals = [
      fmt(d.ticket_no), fmt(d.order_date),
      fmt(d.customer_name || d.bill_to_name),
      fmt(d.driver_name), fmt(d.rego),
      fmtNum(d.gross_tonnes), fmtNum(d.tare_tonnes), fmtNum(d.net_tonnes),
      fmt(d.status), fmt(d.from_location), fmt(d.to_location),
    ];
    vals.forEach((val, ci) => {
      const maxW = cols[ci].w - 2;
      const truncated = doc.getTextWidth(val) > maxW
        ? doc.splitTextToSize(val, maxW)[0].replace(/.$/, '…')
        : val;
      doc.text(truncated, x + 1, y);
      x += cols[ci].w;
    });
    // Net weight highlight
    if (d.net_tonnes) {
      doc.setTextColor(30, 77, 153);
      doc.setFont('helvetica', 'bold');
    }
    y += 6;
  });

  // Summary footer
  const totalNet = dockets.reduce((s, d) => s + (parseFloat(d.net_tonnes) || 0), 0);
  y += 4;
  doc.setFillColor(8, 17, 31);
  doc.rect(10, y - 4, pageW - 20, 9, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text(`Total Net Weight: ${totalNet.toFixed(2)} tonnes across ${dockets.length} dockets`, 14, y + 1);

  doc.save(`metal-x-dockets-${new Date().toISOString().slice(0,10)}.pdf`);
}

export default function DocketSearch() {
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selected, setSelected] = useState(new Set());

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
  const allFilteredIds = filtered.map(d => d.id);
  const allSelected = allFilteredIds.length > 0 && allFilteredIds.every(id => selected.has(id));
  const someSelected = allFilteredIds.some(id => selected.has(id));

  const toggleAll = () => {
    if (allSelected) {
      setSelected(prev => { const s = new Set(prev); allFilteredIds.forEach(id => s.delete(id)); return s; });
    } else {
      setSelected(prev => new Set([...prev, ...allFilteredIds]));
    }
  };

  const toggleOne = (id) => {
    setSelected(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  };

  const selectedDockets = filtered.filter(d => selected.has(d.id));
  const selCount = selectedDockets.length;

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
            <p className="text-sm text-[#90C4F9] mt-1">Search, filter and bulk-export weighbridge records</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 border-t border-white/10">
            {[
              { label: 'Total Records', value: dockets.length },
              { label: 'Verified', value: dockets.filter(d => d.status === 'Verified').length },
              { label: 'Showing', value: filtered.length },
              { label: 'Selected', value: selCount },
            ].map((k, i) => (
              <div key={k.label} className={`px-6 py-3 ${i < 3 ? 'border-r border-white/10' : ''}`}>
                <div className={`text-lg font-black ${k.label === 'Selected' && selCount > 0 ? 'text-[#90C4F9]' : 'text-white'}`}>{k.value}</div>
                <div className="text-[10px] font-bold text-[#90C4F9] mt-0.5">{k.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-[14px] border border-[#EAEEF5] shadow-[0_2px_18px_rgba(11,25,41,0.06)] p-5 mb-5">
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
            <div className="flex gap-1 flex-wrap">
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

        {/* Bulk Action Bar — shown when items selected */}
        {selCount > 0 && (
          <div className="flex items-center justify-between bg-[#0B1929] rounded-[12px] px-5 py-3 mb-4 shadow-[0_4px_20px_rgba(11,25,41,0.25)]">
            <span className="text-sm font-bold text-white">{selCount} docket{selCount > 1 ? 's' : ''} selected</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelected(new Set())}
                className="text-xs text-[#90C4F9] hover:text-white underline mr-2"
              >
                Deselect all
              </button>
              <button
                onClick={() => exportCSV(selectedDockets)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-[8px] text-xs font-bold border border-[#5BA3F5] text-[#90C4F9] hover:bg-white/10 transition-colors"
              >
                <FileDown className="w-4 h-4" /> Export CSV
              </button>
              <button
                onClick={() => exportPDF(selectedDockets)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-[8px] text-xs font-bold text-[#0B1929] bg-white hover:bg-[#EFF4FF] transition-colors"
              >
                <Download className="w-4 h-4" /> Export PDF
              </button>
            </div>
          </div>
        )}

        {/* Results Table */}
        <div className="rounded-[18px] bg-white border border-[#EAEEF5] shadow-[0_2px_18px_rgba(11,25,41,0.06)] overflow-hidden">
          {/* Header */}
          <div className="hidden md:grid grid-cols-[32px_1.4fr_0.9fr_1fr_0.9fr_0.8fr_0.7fr_auto] border-b border-[#EAEEF5] bg-[#F4F7FC]">
            {/* Select All checkbox */}
            <div className="px-3 py-3 flex items-center">
              <input
                type="checkbox"
                checked={allSelected}
                ref={el => { if (el) el.indeterminate = someSelected && !allSelected; }}
                onChange={toggleAll}
                className="w-3.5 h-3.5 accent-[#1E4D99] cursor-pointer"
              />
            </div>
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
            filtered.map(d => {
              const isChecked = selected.has(d.id);
              return (
                <div
                  key={d.id}
                  className={`grid grid-cols-1 md:grid-cols-[32px_1.4fr_0.9fr_1fr_0.9fr_0.8fr_0.7fr_auto] border-b border-[#EAEEF5] last:border-b-0 transition-colors ${isChecked ? 'bg-[#EFF4FF]' : 'hover:bg-[#F4F7FC]'}`}
                >
                  <div className="px-3 py-3.5 flex items-center">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleOne(d.id)}
                      className="w-3.5 h-3.5 accent-[#1E4D99] cursor-pointer"
                    />
                  </div>
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
              );
            })
          )}
        </div>

        <div className="flex items-center justify-between mt-3">
          {filtered.length > 0 && (
            <p className="text-[10px]" style={{ color: 'var(--mx-muted-2)' }}>
              Showing {filtered.length} of {dockets.length} records
              {selCount > 0 && ` · ${selCount} selected`}
            </p>
          )}
          {filtered.length > 0 && (
            <div className="flex gap-2">
              <button
                onClick={() => exportCSV(filtered)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-xs font-semibold border border-[#EAEEF5] text-[#7A8898] hover:bg-[#F4F7FC] hover:text-[#1E4D99] transition-colors"
              >
                <FileDown className="w-3.5 h-3.5" /> Export all as CSV
              </button>
              <button
                onClick={() => exportPDF(filtered)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-xs font-semibold border border-[#EAEEF5] text-[#7A8898] hover:bg-[#F4F7FC] hover:text-[#1E4D99] transition-colors"
              >
                <Download className="w-3.5 h-3.5" /> Export all as PDF
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}