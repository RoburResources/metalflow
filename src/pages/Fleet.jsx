import { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ChevronLeft, Truck, AlertTriangle, CheckCircle2, Calendar, TrendingUp } from "lucide-react";

const MAINTENANCE_THRESHOLD = 50; // tonnes before maintenance alert

function getTonnesColor(t) {
  if (t >= MAINTENANCE_THRESHOLD) return "#ef4444";
  if (t >= MAINTENANCE_THRESHOLD * 0.75) return "#f59e0b";
  return "#1E4D99";
}

function MaintenanceBar({ current, threshold }) {
  const pct = Math.min(100, (current / threshold) * 100);
  const color = getTonnesColor(current);
  return (
    <div className="mt-2">
      <div className="flex justify-between mb-1">
        <span className="text-[10px] font-bold tracking-[1px] uppercase" style={{ color: '#AAB0C4' }}>
          Load since service
        </span>
        <span className="text-[10px] font-bold" style={{ color }}>
          {current.toFixed(1)}t / {threshold}t
        </span>
      </div>
      <div className="h-2 rounded-full bg-[#EAEEF5] overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}

// Mini calendar for the last 30 days
function ActivityCalendar({ dockets }) {
  const today = new Date();
  const days = Array.from({ length: 35 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (34 - i));
    return d.toISOString().slice(0, 10);
  });

  const activityMap = useMemo(() => {
    const map = {};
    dockets.forEach(d => {
      const date = d.order_date || d.created_date?.slice(0, 10);
      if (date) map[date] = (map[date] || 0) + 1;
    });
    return map;
  }, [dockets]);

  const weekLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const todayStr = today.toISOString().slice(0, 10);

  return (
    <div>
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {weekLabels.map((l, i) => (
          <div key={i} className="text-center text-[9px] font-bold" style={{ color: '#AAB0C4' }}>{l}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {days.map(day => {
          const count = activityMap[day] || 0;
          const isToday = day === todayStr;
          let bg = '#F4F7FC';
          if (count >= 3) bg = '#1E4D99';
          else if (count === 2) bg = '#5BA3F5';
          else if (count === 1) bg = '#90C4F9';
          return (
            <div
              key={day}
              title={`${day}: ${count} docket${count !== 1 ? 's' : ''}`}
              className="aspect-square rounded-[3px] cursor-default transition-all"
              style={{
                background: bg,
                outline: isToday ? '2px solid #1E4D99' : 'none',
                outlineOffset: '1px',
              }}
            />
          );
        })}
      </div>
      <div className="flex items-center gap-2 mt-2 justify-end">
        {[['None', '#F4F7FC'], ['1', '#90C4F9'], ['2', '#5BA3F5'], ['3+', '#1E4D99']].map(([l, c]) => (
          <div key={l} className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 rounded-[2px]" style={{ background: c }} />
            <span className="text-[9px]" style={{ color: '#AAB0C4' }}>{l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function VehicleCard({ rego, dockets }) {
  const totalNet = dockets.reduce((s, d) => s + (parseFloat(d.net_tonnes) || 0), 0);
  const totalGross = dockets.reduce((s, d) => s + (parseFloat(d.gross_tonnes) || 0), 0);
  const verified = dockets.filter(d => d.status === 'Verified').length;
  const lastDocket = dockets.sort((a, b) => (b.order_date || '').localeCompare(a.order_date || ''))[0];
  const needsMaintenance = totalNet >= MAINTENANCE_THRESHOLD;

  return (
    <div className="rounded-[16px] bg-white border border-[#EAEEF5] shadow-[0_2px_18px_rgba(11,25,41,0.06)] overflow-hidden">
      {/* Card Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#EAEEF5]" style={{ background: needsMaintenance ? '#FFF7ED' : '#F4F7FC' }}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-[10px] flex items-center justify-center ${needsMaintenance ? 'bg-red-100' : 'bg-[#EFF4FF]'}`}>
            <Truck className={`w-5 h-5 ${needsMaintenance ? 'text-red-500' : 'text-[#1E4D99]'}`} />
          </div>
          <div>
            <div className="text-base font-900" style={{ fontWeight: 900, color: 'var(--mx-text)' }}>{rego}</div>
            <div className="text-[10px] font-semibold" style={{ color: 'var(--mx-muted)' }}>{dockets.length} docket{dockets.length !== 1 ? 's' : ''}</div>
          </div>
        </div>
        {needsMaintenance ? (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-100 border border-red-200">
            <AlertTriangle className="w-3 h-3 text-red-500" />
            <span className="text-[10px] font-bold text-red-600">Maintenance Due</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#EDFBF3] border border-[#C3EDD5]">
            <CheckCircle2 className="w-3 h-3 text-[#1B7A45]" />
            <span className="text-[10px] font-bold text-[#1B7A45]">Operational</span>
          </div>
        )}
      </div>

      <div className="p-5 space-y-5">
        {/* KPI Row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total Net', value: totalNet.toFixed(2) + 't', color: getTonnesColor(totalNet) },
            { label: 'Total Gross', value: totalGross.toFixed(2) + 't', color: '#0D1A2E' },
            { label: 'Verified', value: verified, color: '#1B7A45' },
          ].map(k => (
            <div key={k.label} className="rounded-[10px] bg-[#F4F7FC] p-3 text-center">
              <div className="text-lg font-900" style={{ fontWeight: 900, color: k.color }}>{k.value}</div>
              <div className="text-[10px] font-semibold mt-0.5" style={{ color: '#AAB0C4' }}>{k.label}</div>
            </div>
          ))}
        </div>

        {/* Maintenance Bar */}
        <MaintenanceBar current={totalNet} threshold={MAINTENANCE_THRESHOLD} />

        {/* Last Activity */}
        {lastDocket && (
          <div className="rounded-[10px] border border-[#EAEEF5] p-3">
            <p className="text-[10px] font-bold tracking-[1px] uppercase mb-2" style={{ color: '#AAB0C4' }}>Last Activity</p>
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm font-700" style={{ fontWeight: 700, color: 'var(--mx-text)' }}>{lastDocket.ticket_no}</div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--mx-muted)' }}>{lastDocket.driver_name || '—'} · {lastDocket.from_location || '—'}</div>
              </div>
              <div className="text-right">
                <div className="text-xs font-semibold" style={{ color: '#1E4D99' }}>{lastDocket.net_tonnes ? parseFloat(lastDocket.net_tonnes).toFixed(2) + 't' : '—'}</div>
                <div className="text-[10px]" style={{ color: '#AAB0C4' }}>{lastDocket.order_date || '—'}</div>
              </div>
            </div>
          </div>
        )}

        {/* Activity Calendar */}
        <div>
          <p className="text-[10px] font-bold tracking-[1.5px] uppercase mb-2" style={{ color: '#AAB0C4' }}>
            <Calendar className="w-3 h-3 inline mr-1" />Activity — Last 35 Days
          </p>
          <ActivityCalendar dockets={dockets} />
        </div>
      </div>
    </div>
  );
}

export default function Fleet() {
  const { data: dockets = [], isLoading } = useQuery({
    queryKey: ['weight-dockets-fleet'],
    queryFn: () => base44.entities.WeightDocket.list('-order_date', 500),
  });

  const vehicleMap = useMemo(() => {
    const map = {};
    dockets.forEach(d => {
      if (!d.rego) return;
      if (!map[d.rego]) map[d.rego] = [];
      map[d.rego].push(d);
    });
    return map;
  }, [dockets]);

  const vehicles = Object.entries(vehicleMap).sort((a, b) => {
    const netA = a[1].reduce((s, d) => s + (parseFloat(d.net_tonnes) || 0), 0);
    const netB = b[1].reduce((s, d) => s + (parseFloat(d.net_tonnes) || 0), 0);
    return netB - netA;
  });

  const totalFleetNet = dockets.reduce((s, d) => s + (parseFloat(d.net_tonnes) || 0), 0);
  const maintenanceDue = vehicles.filter(([, d]) => d.reduce((s, x) => s + (parseFloat(x.net_tonnes) || 0), 0) >= MAINTENANCE_THRESHOLD).length;

  return (
    <div className="min-h-screen" style={{ background: 'var(--mx-paper)' }}>
      <nav className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-[#EAEEF5] shadow-[0_2px_18px_rgba(11,25,41,0.06)]">
        <div className="max-w-7xl mx-auto px-5 h-14 flex items-center gap-3">
          <Link to="/" className="w-8 h-8 flex items-center justify-center rounded-[8px] hover:bg-[#F4F7FC]">
            <ChevronLeft className="w-4 h-4" style={{ color: 'var(--mx-muted)' }} />
          </Link>
          <img src="https://media.base44.com/images/public/69f7b7e128899b8db1200527/c72ebbf3f_MetalXLogo.png" alt="Metal X" className="h-7 object-contain" />
          <span className="text-[10px] font-bold tracking-[2px] uppercase ml-2 pl-3 border-l border-[#EAEEF5]" style={{ color: 'var(--mx-muted-2)' }}>Fleet Dashboard</span>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-5 py-8">
        {/* Hero */}
        <div className="rounded-[18px] overflow-hidden mb-8" style={{ background: 'var(--mx-hero-gradient)' }}>
          <div className="px-7 py-5">
            <p className="text-[10px] font-bold tracking-[2px] uppercase text-[#90C4F9]">Metal X Fleet</p>
            <h1 className="text-2xl font-900 text-white mt-1" style={{ fontWeight: 900 }}>Vehicle Usage & Maintenance</h1>
            <p className="text-sm text-[#90C4F9] mt-1">Aggregated tonnage, activity heatmaps and maintenance triggers per registration</p>
          </div>
          <div className="grid grid-cols-3 border-t border-white/10">
            {[
              { label: 'Registered Vehicles', value: vehicles.length },
              { label: 'Total Fleet Net (t)', value: totalFleetNet.toFixed(1) },
              { label: 'Maintenance Alerts', value: maintenanceDue },
            ].map((k, i) => (
              <div key={k.label} className={`px-6 py-4 ${i < 2 ? 'border-r border-white/10' : ''}`}>
                <div className="text-xl font-900 text-white" style={{ fontWeight: 900, color: k.label === 'Maintenance Alerts' && k.value > 0 ? '#FCA5A5' : '#fff' }}>{k.value}</div>
                <div className="text-[10px] font-bold text-[#90C4F9] mt-0.5">{k.label}</div>
              </div>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-8 h-8 rounded-full border-2 border-[#EAEEF5] border-t-[#1E4D99] animate-spin" />
          </div>
        ) : vehicles.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 gap-3 rounded-[16px] bg-white border border-[#EAEEF5]">
            <Truck className="w-8 h-8" style={{ color: 'var(--mx-muted-2)' }} />
            <p className="text-sm" style={{ color: 'var(--mx-muted)' }}>No vehicle registrations recorded in dockets yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {vehicles.map(([rego, vehicleDockets]) => (
              <VehicleCard key={rego} rego={rego} dockets={vehicleDockets} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}