import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Plus, ChevronLeft, Pencil, Trash2, X, Save, Loader2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import AddressSuggest from "@/components/driver/AddressSuggest";

const mx_input = "bg-white border border-[#EAEEF5] rounded-lg text-sm font-medium focus:ring-2 focus:ring-[#1E4D99] focus:border-[#1E4D99] placeholder:text-[#AAB0C4]";

const EMPTY = {
  company_name: "", contact_name: "", email: "", phone: "",
  billing_address: "", site_address: "", notes: "", active: true
};

function ClientForm({ initial, onSave, onClose, saving }) {
  const [form, setForm] = useState(initial || EMPTY);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 flex flex-col gap-1.5">
          <Label className="text-[10px] font-bold tracking-[1.5px] uppercase text-[#7A8898]">Company Name *</Label>
          <Input className={mx_input} value={form.company_name} onChange={e => set("company_name", e.target.value)} placeholder="e.g. Acme Metals" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-[10px] font-bold tracking-[1.5px] uppercase text-[#7A8898]">Contact Name</Label>
          <Input className={mx_input} value={form.contact_name} onChange={e => set("contact_name", e.target.value)} placeholder="Full name" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-[10px] font-bold tracking-[1.5px] uppercase text-[#7A8898]">Phone</Label>
          <Input className={mx_input} value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="08 9xxx xxxx" />
        </div>
        <div className="col-span-2 flex flex-col gap-1.5">
          <Label className="text-[10px] font-bold tracking-[1.5px] uppercase text-[#7A8898]">Email</Label>
          <Input className={mx_input} type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="accounts@company.com.au" />
        </div>
        <div className="col-span-2 flex flex-col gap-1.5">
          <AddressSuggest label="Billing Address" placeholder="Full billing address" value={form.billing_address} onChange={v => set("billing_address", v)} />
        </div>
        <div className="col-span-2 flex flex-col gap-1.5">
          <AddressSuggest label="Site Address" placeholder="Physical site address" value={form.site_address} onChange={v => set("site_address", v)} />
        </div>
        <div className="col-span-2 flex flex-col gap-1.5">
          <Label className="text-[10px] font-bold tracking-[1.5px] uppercase text-[#7A8898]">Notes</Label>
          <textarea
            rows={2}
            className="w-full bg-white border border-[#EAEEF5] rounded-lg text-sm font-medium p-3 focus:ring-2 focus:ring-[#1E4D99] outline-none resize-none"
            value={form.notes} onChange={e => set("notes", e.target.value)}
            placeholder="Special instructions or account notes…"
          />
        </div>
        <div className="col-span-2 flex items-center gap-2">
          <input
            type="checkbox"
            id="active"
            checked={!!form.active}
            onChange={e => set("active", e.target.checked)}
            className="w-4 h-4 accent-[#1E4D99]"
          />
          <Label htmlFor="active" className="text-sm font-semibold text-[#0D1A2E] cursor-pointer">Active client</Label>
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2 border-t border-[#EAEEF5]">
        <Button variant="outline" onClick={onClose} className="border-[#EAEEF5] text-[#7A8898] rounded-[10px]">
          <X className="w-4 h-4 mr-1" /> Cancel
        </Button>
        <Button
          onClick={() => onSave(form)}
          disabled={!form.company_name || saving}
          style={{ background: "var(--mx-hero-gradient)" }}
          className="text-white rounded-[10px]"
        >
          {saving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
          Save Client
        </Button>
      </div>
    </div>
  );
}

export default function Clients() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ["clients"],
    queryFn: () => base44.entities.Client.list("-created_date", 200),
  });

  const save = useMutation({
    mutationFn: (form) =>
      editing ? base44.entities.Client.update(editing.id, form) : base44.entities.Client.create(form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["clients"] }); setOpen(false); setEditing(null); },
  });

  const del = useMutation({
    mutationFn: (id) => base44.entities.Client.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["clients"] }),
  });

  const filtered = clients.filter(c => {
    const q = search.toLowerCase();
    return !q || [c.company_name, c.contact_name, c.email, c.phone].filter(Boolean).some(v => v.toLowerCase().includes(q));
  });

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
            <span className="text-[10px] font-bold tracking-[2px] uppercase ml-2 pl-3 border-l border-[#EAEEF5] text-[#AAB0C4]">Clients</span>
          </div>
          <Button onClick={() => { setEditing(null); setOpen(true); }} style={{ background: "var(--mx-hero-gradient)" }} className="text-white text-sm font-semibold rounded-[10px] h-9 px-4 flex items-center gap-1.5">
            <Plus className="w-4 h-4" /> New Client
          </Button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-5 py-8">
        {/* Hero */}
        <div className="rounded-[18px] overflow-hidden mb-8" style={{ background: "var(--mx-hero-gradient)" }}>
          <div className="px-7 py-6">
            <p className="text-[10px] font-bold tracking-[2px] uppercase text-[#90C4F9]">Metal X Renewables</p>
            <h1 className="text-2xl font-black text-white mt-1">Client Directory</h1>
            <p className="text-sm text-[#90C4F9] mt-1">Manage client details for docket pre-filling and email notifications</p>
          </div>
          <div className="grid grid-cols-3 border-t border-white/10">
            {[
              { label: "Total Clients", value: clients.length },
              { label: "Active", value: clients.filter(c => c.active).length },
              { label: "Inactive", value: clients.filter(c => !c.active).length },
            ].map((k, i) => (
              <div key={k.label} className={`px-6 py-4 ${i < 2 ? "border-r border-white/10" : ""}`}>
                <div className="text-xl font-black text-white">{k.value}</div>
                <div className="text-[10px] font-bold text-[#90C4F9] mt-0.5">{k.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="mb-5">
          <input
            type="text"
            placeholder="Search by company, contact, email or phone…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full max-w-sm px-4 h-10 bg-white border border-[#EAEEF5] rounded-[10px] text-sm focus:ring-2 focus:ring-[#1E4D99] outline-none"
          />
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-8 h-8 rounded-full border-2 border-[#EAEEF5] border-t-[#1E4D99] animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 gap-3">
            <Users className="w-8 h-8 text-[#AAB0C4]" />
            <p className="text-sm text-[#7A8898]">No clients found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(c => (
              <div key={c.id} className="rounded-[14px] bg-white border border-[#EAEEF5] shadow-[0_2px_18px_rgba(11,25,41,0.06)] p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-[10px] flex items-center justify-center text-[#1E4D99] font-black text-base" style={{ background: "#EFF4FF" }}>
                    {(c.company_name || "?")[0].toUpperCase()}
                  </div>
                  <div className="flex gap-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${c.active ? "bg-[#EDFBF3] text-[#1B7A45] border-[#C3EDD5]" : "bg-[#F4F4F6] text-[#AAB0C4] border-[#EAEEF5]"}`}>
                      {c.active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
                <h3 className="text-sm font-black text-[#0D1A2E] mb-0.5">{c.company_name}</h3>
                {c.contact_name && <p className="text-xs text-[#7A8898]">{c.contact_name}</p>}
                {c.email && <p className="text-xs text-[#1E4D99] mt-1">{c.email}</p>}
                {c.phone && <p className="text-xs text-[#7A8898]">{c.phone}</p>}
                {c.site_address && <p className="text-xs text-[#AAB0C4] mt-2 truncate">{c.site_address}</p>}
                <div className="flex gap-2 mt-4 pt-3 border-t border-[#EAEEF5]">
                  <button onClick={() => { setEditing(c); setOpen(true); }} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-[8px] bg-[#EFF4FF] text-[#1E4D99] text-xs font-semibold hover:bg-[#E5EEFB] transition-colors">
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button onClick={() => { if (confirm("Delete this client?")) del.mutate(c.id); }} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-[8px] bg-[#F4F7FC] text-[#AAB0C4] text-xs font-semibold hover:bg-red-50 hover:text-red-400 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Dialog open={open} onOpenChange={v => { setOpen(v); if (!v) setEditing(null); }}>
        <DialogContent className="max-w-xl rounded-[18px] border-[#EAEEF5]">
          <DialogHeader>
            <DialogTitle className="text-base font-black text-[#0D1A2E]">
              {editing ? "Edit Client" : "New Client"}
            </DialogTitle>
          </DialogHeader>
          <ClientForm
            initial={editing}
            onSave={(form) => save.mutate(form)}
            onClose={() => { setOpen(false); setEditing(null); }}
            saving={save.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}