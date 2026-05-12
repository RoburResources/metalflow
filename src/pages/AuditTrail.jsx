import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ChevronLeft, ShieldCheck, Mail, AlertTriangle, Info, Search, RefreshCw } from "lucide-react";

const EVENT_ICONS = {
  docket_verified: ShieldCheck,
  email_sent: Mail,
  automation_error: AlertTriangle,
};
const EVENT_LABELS = {
  docket_verified: 'Docket Verified',
  email_sent: 'Email Sent',
  automation_error: 'Automation Error',
};
const STATUS_STYLES = {
  success: 'bg-[#EDFBF3] text-[#1B7A45] border-[#C3EDD5]',
  failed: 'bg-red-50 text-red-600 border-red-200',
  info: 'bg-[#EFF4FF] text-[#1E4D99] border-[#DCE9FA]',
};

export default function AuditTrail() {
  const [search, setSearch] = useState('');
  const [eventFilter, setEventFilter] = useState('All');

  const { data: logs = [], isLoading, refetch } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: () => base44.entities.AuditLog.list('-created_date', 200),
    refetchInterval: 30000,
  });

  const filtered = logs.filter(l => {
    const q = search.toLowerCase();
    const matchSearch = !q || [l.ticket_no, l.customer_name, l.customer_email, l.rego, l.details]
      .filter(Boolean).some(v => v.toLowerCase().includes(q));
    const matchEvent = eventFilter === 'All' || l.event_type === eventFilter;
    return matchSearch && matchEvent;
  });

  const byType = logs.reduce((acc, l) => { acc[l.event_type] = (acc[l.event_type] || 0) + 1; return acc; }, {});

  return (
    <div className="min-h-screen" style={{ background: 'var(--mx-paper)' }}>
      <nav className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-[#EAEEF5] shadow-[0_2px_18px_rgba(11,25,41,0.06)]">
        <div className="max-w-7xl mx-auto px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="w-8 h-8 flex items-center justify-center rounded-[8px] hover:bg-[#F4F7FC]">
              <ChevronLeft className="w-4 h-4" style={{ color: 'var(--mx-muted)' }} />
            </Link>
            <img src="https://media.base44.com/images/public/69f7b7e128899b8db1200527/c72ebbf3f_MetalXLogo.png" alt="Metal X" className="h-7 object-contain" />
            <span className="text-[10px] font-bold tracking-[2px] uppercase ml-2 pl-3 border-l border-[#EAEEF5]" style={{ color: 'var(--mx-muted-2)' }}>Audit Trail</span>
          </div>
          <button onClick={() => refetch()} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-[8px] border border-[#EAEEF5] hover:bg-[#EFF4FF]" style={{ color: 'var(--mx-muted)', fontWeight: 600 }}>
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-5 py-8">
        {/* Hero */}
        <div className="rounded-[18px] overflow-hidden mb-8" style={{ background: 'var(--mx-hero-gradient)' }}>
          <div className="px-7 py-5">
            <p className="text-[10px] font-bold tracking-[2px] uppercase text-[#90C4F9]">System Events</p>
            <h1 className="text-2xl font-900 text-white mt-1" style={{ fontWeight: 900 }}>Audit Trail</h1>
            <p className="text-sm text-[#90C4F9] mt-1">Automated workflow events — verifications, emails, and system actions</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 border-t border-white/10">
            {[
              { label: 'Total Events', value: logs.length },
              { label: 'Verifications', value: byType['docket_verified'] || 0 },
              { label: 'Emails Sent', value: byType['email_sent'] || 0 },
            ].map((k, i) => (
              <div key={k.label} className={`px-6 py-4 ${i < 2 ? 'border-r border-white/10' : ''}`}>
                <div className="text-xl font-900 text-white" style={{ fontWeight: 900 }}>{k.value}</div>
                <div className="text-[10px] font-bold text-[#90C4F9] mt-0.5">{k.label}</div>
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
              placeholder="Search ticket, customer, rego…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 h-10 bg-white border border-[#EAEEF5] rounded-[10px] text-sm focus:ring-2 focus:ring-[#1E4D99] outline-none"
            />
          </div>
          <div className="flex gap-1">
            {['All', 'docket_verified', 'email_sent', 'automation_error'].map(t => (
              <button
                key={t}
                onClick={() => setEventFilter(t)}
                className={`px-3 py-2 rounded-[8px] text-xs font-semibold border transition-all ${eventFilter === t ? 'bg-[#1E4D99] text-white border-[#1E4D99]' : 'bg-white text-[#7A8898] border-[#EAEEF5] hover:border-[#1E4D99]'}`}
              >
                {t === 'All' ? 'All' : EVENT_LABELS[t] || t}
              </button>
            ))}
          </div>
        </div>

        {/* Log Table */}
        <div className="rounded-[18px] bg-white border border-[#EAEEF5] shadow-[0_2px_18px_rgba(11,25,41,0.06)] overflow-x-auto">
          <div className="hidden md:grid border-b border-[#EAEEF5] bg-[#F4F7FC] grid-cols-[160px_1fr_1fr_120px_80px_100px]">
            {['Time', 'Ticket / Details', 'Customer', 'Rego', 'Net (t)', 'Status'].map(h => (
              <div key={h} className="px-4 py-3 text-[10px] font-bold tracking-[1.5px] uppercase" style={{ color: 'var(--mx-muted-2)' }}>{h}</div>
            ))}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <div className="w-8 h-8 rounded-full border-2 border-[#EAEEF5] border-t-[#1E4D99] animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 gap-3">
              <ShieldCheck className="w-8 h-8" style={{ color: 'var(--mx-muted-2)' }} />
              <p className="text-sm" style={{ color: 'var(--mx-muted)' }}>{logs.length === 0 ? 'No audit events yet. Verify a docket to trigger the automation.' : 'No results match your filters.'}</p>
            </div>
          ) : filtered.map(log => {
            const Icon = EVENT_ICONS[log.event_type] || Info;
            const statusStyle = STATUS_STYLES[log.status] || STATUS_STYLES.info;
            const time = log.created_date ? new Date(log.created_date).toLocaleString('en-AU', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }) : '—';
            return (
              <div key={log.id} className="grid grid-cols-1 md:grid-cols-[160px_1fr_1fr_120px_80px_100px] border-b border-[#EAEEF5] last:border-b-0 hover:bg-[#F4F7FC] transition-colors overflow-hidden">
                <div className="px-4 py-3.5 flex items-center gap-2">
                  <div className="w-7 h-7 rounded-[8px] flex items-center justify-center shrink-0 bg-[#EFF4FF]">
                    <Icon className="w-3.5 h-3.5 text-[#1E4D99]" />
                  </div>
                  <span className="text-[11px]" style={{ color: 'var(--mx-muted)' }}>{time}</span>
                </div>
                <div className="px-4 py-3.5">
                  <div className="text-sm font-700" style={{ fontWeight: 700, color: 'var(--mx-text)' }}>{log.ticket_no || EVENT_LABELS[log.event_type] || log.event_type}</div>
                  {log.details && <div className="text-xs mt-0.5 truncate" style={{ color: 'var(--mx-muted)' }}>{log.details}</div>}
                </div>
                <div className="px-4 py-3.5">
                  <div className="text-sm" style={{ color: 'var(--mx-text)' }}>{log.customer_name || '—'}</div>
                  {log.customer_email && <div className="text-xs mt-0.5" style={{ color: '#1E4D99' }}>{log.customer_email}</div>}
                </div>
                <div className="px-4 py-3.5 flex items-center text-sm font-semibold" style={{ color: 'var(--mx-text)' }}>{log.rego || '—'}</div>
                <div className="px-4 py-3.5 flex items-center text-sm font-700" style={{ fontWeight: 700, color: '#1E4D99' }}>
                  {log.net_tonnes ? parseFloat(log.net_tonnes).toFixed(2) + 't' : '—'}
                </div>
                <div className="px-4 py-3.5 flex items-center">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusStyle}`}>
                    {log.status || 'info'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        {filtered.length > 0 && (
          <p className="text-[10px] mt-3 text-right" style={{ color: 'var(--mx-muted-2)' }}>
            Showing {filtered.length} of {logs.length} events
          </p>
        )}
      </main>
    </div>
  );
}