import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Plus, ChevronLeft, Pencil, Trash2, X, Save, Loader2, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import AddressSuggest from "@/components/driver/AddressSuggest";

const statusColors = {
  Assigned:    "bg-[#EFF4FF] text-[#1E4D99] border-[#DCE9FA]",
  "In Progress": "bg-[#FFF8E6] text-[#B45309] border-[#FDE68A]",
  Completed:   "bg-[#EDFBF3] text-[#1B7A45] border-[#C3EDD5]",
  Cancelled:   "bg-[#F4F4F6] text-[#AAB0C4] border-[#EAEEF5]",
};

const EMPTY = {
  job_id: "", status: "Assigned", driver_name: "", vehicle_rego: "",
  start_time: "", end_time: "", pickup_location: "", delivery_location: "",
  client_name: "", expected_material: "", sequence_number: "", notes: "", linked_ticket_no: ""
};

const mx_input = "bg-white border border-[#EAEEF5] rounded-lg text-sm font-medium focus:ring-2 focus:ring-[#1E4D99] focus:border-[#1E4D99] placeholder:text-[#AAB0C4]";

function ClientSuggest({ value, onChange, clients }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();
  const filtered = clients.filter(c => c.active && c.company_name?.toLowerCase().includes(value.toLowerCase())).slice(0, 6);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <Input
        className={mx_input}
        value={value}
        onChange={e => { onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder="e.g. Acme Metals"
      />
      {open && filtered.length > 0 && (
        <div className="absolute z-50 top-full mt-1 w-full bg-white border border-[#EAEEF5] rounded-[10px] shadow-lg overflow-hidden">
          {filtered.map(c => (
            <button key={c.id} type="button" onMouseDown={() => { onChange(c.company_name); setOpen(false); }}
              className="w-full text-left px-3 py-2 text-sm hover:bg-[#EFF4FF] text-[#0D1A2E] border-b border-[#EAEEF5] last:border-0">
              <span className="font-semibold">{c.company_name}</span>
              {c.site_address && <span className="text-xs text-[#AAB0C4] ml-2">{c.site_address}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function DriverSuggest({ value, onChange, driverOptions }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();
  const filtered = [...new Set(driverOptions)].filter(d => d?.toLowerCase().includes(value.toLowerCase())).slice(0, 5);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <Input
        className={mx_input}
        value={value}
        onChange={e => { onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder="Driver's full name"
      />
      {open && filtered.length > 0 && (
        <div className="absolute z-50 top-full mt-1 w-full bg-white border border-[#EAEEF5] rounded-[10px] shadow-lg overflow-hidden">
          {filtered.map(d => (
            <button key={d} type="button" onMouseDown={() => { onChange(d); setOpen(false); }}
              className="w-full text-left px-3 py-2 text-sm hover:bg-[#EFF4FF] text-[#0D1A2E] border-b border-[#EAEEF5] last:border-0">
              {d}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function JobForm({ initial, onSave, onClose, saving, clients, previousJobs }) {
  const [form, setForm] = useState(initial || EMPTY);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const driverOptions = previousJobs.map(j => j.driver_name).filter(Boolean);
  const regoOptions = [...new Set(previousJobs.map(j => j.vehicle_rego).filter(Boolean))];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label className="text-[10px] font-bold tracking-[1.5px] uppercase text-[#7A8898]">Job ID *</Label>
          <Input className={mx_input} value={form.job_id} onChange={e => set("job_id", e.target.value)} placeholder="e.g. JOB-001" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-[10px] font-bold tracking-[1.5px] uppercase text-[#7A8898]">Status</Label>
          <select
            className="h-10 px-3 bg-white border border-[#EAEEF5] rounded-lg text-sm font-medium focus:ring-2 focus:ring-[#1E4D99] outline-none"
            value={form.status} onChange={e => set("status", e.target.value)}
          >
            {["Assigned", "In Progress", "Completed", "Cancelled"].map(s => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-[10px] font-bold tracking-[1.5px] uppercase text-[#7A8898]">Driver Name</Label>
          <DriverSuggest value={form.driver_name} onChange={v => set("driver_name", v)} driverOptions={driverOptions} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-[10px] font-bold tracking-[1.5px] uppercase text-[#7A8898]">Vehicle Rego</Label>
          <div className="relative">
            <Input className={mx_input} value={form.vehicle_rego} onChange={e => set("vehicle_rego", e.target.value)} placeholder="e.g. 1ISD240" list="rego-options" />
            <datalist id="rego-options">
              {regoOptions.map(r => <option key={r} value={r} />)}
            </datalist>
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-[10px] font-bold tracking-[1.5px] uppercase text-[#7A8898]">Client</Label>
          <ClientSuggest value={form.client_name} onChange={v => set("client_name", v)} clients={clients} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-[10px] font-bold tracking-[1.5px] uppercase text-[#7A8898]">Expected Material</Label>
          <Input className={mx_input} value={form.expected_material} onChange={e => set("expected_material", e.target.value)} placeholder="e.g. Scrap Steel" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-[10px] font-bold tracking-[1.5px] uppercase text-[#7A8898]">Start Time</Label>
          <Input className={mx_input} type="datetime-local" value={form.start_time} onChange={e => set("start_time", e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-[10px] font-bold tracking-[1.5px] uppercase text-[#7A8898]">End Time</Label>
          <Input className={mx_input} type="datetime-local" value={form.end_time} onChange={e => set("end_time", e.target.value)} />
        </div>
        <div className="col-span-2 flex flex-col gap-1.5">
          <Label className="text-[10px] font-bold tracking-[1.5px] uppercase text-[#7A8898]">Pickup Location</Label>
          <AddressSuggest label="" placeholder="Pickup address" value={form.pickup_location} onChange={v => set("pickup_location", v)} />
        </div>
        <div className="col-span-2 flex flex-col gap-1.5">
          <Label className="text-[10px] font-bold tracking-[1.5px] uppercase text-[#7A8898]">Delivery Location</Label>
          <AddressSuggest label="" placeholder="Delivery address" value={form.delivery_location} onChange={v => set("delivery_location", v)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-[10px] font-bold tracking-[1.5px] uppercase text-[#7A8898]">Sequence #</Label>
          <Input className={mx_input} type="number" value={form.sequence_number} onChange={e => set("sequence_number", e.target.value)} placeholder="1" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-[10px] font-bold tracking-[1.5px] uppercase text-[#7A8898]">Linked Ticket No.</Label>
          <Input className={mx_input} value={form.linked_ticket_no} onChange={e => set("linked_ticket_no", e.target.value)} placeholder="e.g. MX-S0005289" />
        </div>
        <div className="col-span-2 flex flex-col gap-1.5">
          <Label className="text-[10px] font-bold tracking-[1.5px] uppercase text-[#7A8898]">Notes</Label>
          <textarea
            rows={2}
            className="w-full bg-white border border-[#EAEEF5] rounded-lg text-sm font-medium p-3 focus:ring-2 focus:ring-[#1E4D99] outline-none resize-none"
            value={form.notes} onChange={e => set("notes", e.target.value)}
            placeholder="Driver instructions…"
          />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2 border-t border-[#EAEEF5]">
        <Button variant="outline" onClick={onClose} className="border-[#EAEEF5] text-[#7A8898] rounded-[10px]">
          <X className="w-4 h-4 mr-1" /> Cancel
        </Button>
        <Button
          onClick={() => onSave(form)}
          disabled={!form.job_id || saving}
          style={{ background: "var(--mx-hero-gradient)" }}
          className="text-white rounded-[10px]"
        >
          {saving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
          Save Job
        </Button>
      </div>
    </div>
  );
}

export default function Schedules() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All");

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ["schedules"],
    queryFn: () => base44.entities.Schedule.list("-start_time", 200),
  });

  const { data: clients = [] } = useQuery({
    queryKey: ["clients"],
    queryFn: () => base44.entities.Client.list("-created_date", 200),
  });

  const save = useMutation({
    mutationFn: (form) =>
      editing ? base44.entities.Schedule.update(editing.id, form) : base44.entities.Schedule.create(form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["schedules"] }); setOpen(false); setEditing(null); },
  });

  const del = useMutation({
    mutationFn: (id) => base44.entities.Schedule.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["schedules"] }),
  });

  const openNew = () => { setEditing(null); setOpen(true); };
  const openEdit = (job) => { setEditing(job); setOpen(true); };

  const filtered = statusFilter === "All" ? jobs : jobs.filter(j => j.status === statusFilter);

  return (
    <div className="min-h-screen" style={{ background: "var(--mx-paper)" }}>
      {/* Nav */}
      <nav className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-[#EAEEF5] shadow-[0_2px_18px_rgba(11,25,41,0.06)]">
        <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="w-8 h-8 flex items-center justify-center rounded-[8px] hover:bg-[#F4F7FC]">
              <ChevronLeft className="w-4 h-4 text-[#7A8898]" />
            </Link>
            <img src="https://media.base44.com/images/public/69f7b7e128899b8db1200527/c72ebbf3f_MetalXLogo.png" alt="Metal X" className="h-7 object-contain" />
            <span className="text-[10px] font-bold tracking-[2px] uppercase ml-2 pl-3 border-l border-[#EAEEF5] text-[#AAB0C4]">Job Schedule</span>
          </div>
          <Button onClick={openNew} style={{ background: "var(--mx-hero-gradient)" }} className="text-white text-sm font-semibold rounded-[10px] h-9 px-4 flex items-center gap-1.5">
            <Plus className="w-4 h-4" /> New Job
          </Button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-5 py-8">
        {/* Hero */}
        <div className="rounded-[18px] overflow-hidden mb-8" style={{ background: "var(--mx-hero-gradient)" }}>
          <div className="px-7 py-6">
            <p className="text-[10px] font-bold tracking-[2px] uppercase text-[#90C4F9]">Metal X Renewables</p>
            <h1 className="text-2xl font-black text-white mt-1">Job Schedule</h1>
            <p className="text-sm text-[#90C4F9] mt-1">Manage driver job assignments and sequences</p>
          </div>
          <div className="grid grid-cols-4 border-t border-white/10">
            {[
              { label: "Total Jobs", value: jobs.length },
              { label: "Assigned", value: jobs.filter(j => j.status === "Assigned").length },
              { label: "In Progress", value: jobs.filter(j => j.status === "In Progress").length },
              { label: "Completed", value: jobs.filter(j => j.status === "Completed").length },
            ].map((k, i) => (
              <div key={k.label} className={`px-6 py-4 ${i < 3 ? "border-r border-white/10" : ""}`}>
                <div className="text-xl font-black text-white">{k.value}</div>
                <div className="text-[10px] font-bold text-[#90C4F9] mt-0.5">{k.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-1 mb-5">
          {["All", "Assigned", "In Progress", "Completed", "Cancelled"].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 rounded-[8px] text-xs font-semibold border transition-all ${statusFilter === s ? "bg-[#1E4D99] text-white border-[#1E4D99]" : "bg-white text-[#7A8898] border-[#EAEEF5] hover:border-[#1E4D99]"}`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="rounded-[18px] bg-white border border-[#EAEEF5] shadow-[0_2px_18px_rgba(11,25,41,0.06)] overflow-hidden">
          <div className="hidden md:grid grid-cols-[1.2fr_1fr_1fr_1fr_1.2fr_1.2fr_0.8fr_auto] border-b border-[#EAEEF5] bg-[#F4F7FC]">
            {["Job ID", "Driver", "Rego", "Client", "Pickup", "Delivery", "Status", ""].map(h => (
              <div key={h} className="px-4 py-3 text-[10px] font-bold tracking-[1.5px] uppercase text-[#AAB0C4]">{h}</div>
            ))}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <div className="w-8 h-8 rounded-full border-2 border-[#EAEEF5] border-t-[#1E4D99] animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 gap-3">
              <CalendarDays className="w-8 h-8 text-[#AAB0C4]" />
              <p className="text-sm text-[#7A8898]">No jobs found.</p>
            </div>
          ) : filtered.map(job => (
            <div key={job.id} className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr_1fr_1fr_1.2fr_1.2fr_0.8fr_auto] border-b border-[#EAEEF5] last:border-b-0 hover:bg-[#F4F7FC] transition-colors">
              <div className="px-4 py-3.5 flex items-center">
                <span className="text-sm font-bold text-[#0D1A2E]">{job.job_id}</span>
              </div>
              <div className="px-4 py-3.5 flex items-center text-sm text-[#7A8898]">{job.driver_name || "—"}</div>
              <div className="px-4 py-3.5 flex items-center text-sm font-semibold text-[#0D1A2E]">{job.vehicle_rego || "—"}</div>
              <div className="px-4 py-3.5 flex items-center text-sm text-[#7A8898]">{job.client_name || "—"}</div>
              <div className="px-4 py-3.5 flex items-center text-xs text-[#7A8898] truncate">{job.pickup_location || "—"}</div>
              <div className="px-4 py-3.5 flex items-center text-xs text-[#7A8898] truncate">{job.delivery_location || "—"}</div>
              <div className="px-4 py-3.5 flex items-center">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusColors[job.status] || statusColors.Assigned}`}>
                  {job.status}
                </span>
              </div>
              <div className="px-3 py-3.5 flex items-center gap-1">
                <button onClick={() => openEdit(job)} className="w-7 h-7 rounded-[7px] bg-[#EFF4FF] flex items-center justify-center hover:bg-[#E5EEFB] text-[#1E4D99]">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => { if (confirm("Delete this job?")) del.mutate(job.id); }} className="w-7 h-7 rounded-[7px] bg-[#F4F7FC] flex items-center justify-center hover:bg-red-50 text-[#AAB0C4] hover:text-red-400">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Dialog */}
      <Dialog open={open} onOpenChange={v => { setOpen(v); if (!v) setEditing(null); }}>
        <DialogContent className="max-w-2xl rounded-[18px] border-[#EAEEF5]">
          <DialogHeader>
            <DialogTitle className="text-base font-black text-[#0D1A2E]">
              {editing ? "Edit Job" : "New Job"}
            </DialogTitle>
          </DialogHeader>
          <JobForm
            initial={editing}
            onSave={(form) => save.mutate(form)}
            onClose={() => { setOpen(false); setEditing(null); }}
            saving={save.isPending}
            clients={clients}
            previousJobs={jobs}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}