import { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Camera, Upload, Loader2, CheckCircle2, AlertCircle, Save, ChevronRight, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const mx_input = "bg-white border border-[#EAEEF5] rounded-lg text-sm font-medium focus:ring-2 focus:ring-[#1E4D99] focus:border-[#1E4D99] placeholder:text-[#AAB0C4]";

const nowStr = () => new Date().toLocaleString('en-AU', {
  day: '2-digit', month: '2-digit', year: 'numeric',
  hour: '2-digit', minute: '2-digit', hour12: true,
});

const genTicket = () => `MX-S${Math.floor(Math.random() * 9000000 + 1000000)}`;
const todayStr = () => new Date().toISOString().slice(0, 10);

const EMPTY = {
  ticket_no: '', order_date: '', bill_to_name: 'Metal X',
  bill_to_address: 'PO Box Z5150, St Georges Terrace 6000',
  from_location: '', from_company: '', to_location: '', to_company: '',
  rego: '', driver_name: '', gross_tonnes: '', gross_datetime: '',
  tare_tonnes: '', tare_datetime: '', net_tonnes: '', net_datetime: '',
  goods_weighed: '', material_grade: '', comments: '',
  photo_urls: [], status: 'Pending',
  line_description: 'Internal Weight Record', qty: 1, uom: 'Each',
  unit_price: 0, ext_price: 0, total_price: 0,
  payment_status: 'Paid on Account', docket_no: '', docket_date: '',
  deliver: true, pickup: false, swap: false, material_grades: [],
};

// ── OCR Upload Panel ────────────────────────────────────────────────────────
function DriverOCRPanel({ onExtracted }) {
  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef = useRef();

  const handleFile = async (file) => {
    if (!file) return;
    setStatus("uploading");
    setErrorMsg("");
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setStatus("extracting");
      const response = await base44.functions.invoke("extractDocketData", { file_url });
      const extracted = response.data;
      if (extracted.error) { setErrorMsg(extracted.error); setStatus("error"); return; }
      onExtracted(extracted);
      setStatus("done");
      setTimeout(() => setStatus("idle"), 4000);
    } catch (err) {
      setErrorMsg(err.message || "Extraction failed");
      setStatus("error");
    }
  };

  return (
    <div className="mb-6">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,application/pdf"
        capture="environment"
        className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }}
      />

      {status === "idle" && (
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full flex items-center justify-center gap-4 py-7 rounded-[18px] border-2 border-dashed border-[#DCE9FA] bg-[#EFF4FF] hover:bg-[#E5EEFB] hover:border-[#1E4D99] transition-all group"
        >
          <div className="w-14 h-14 rounded-full bg-[#1E4D99] flex items-center justify-center group-hover:scale-105 transition-transform shadow-lg">
            <Camera className="w-7 h-7 text-white" />
          </div>
          <div className="text-left">
            <p className="text-base font-bold" style={{ color: '#1E4D99' }}>Scan Weighbridge Ticket</p>
            <p className="text-sm mt-0.5" style={{ color: 'var(--mx-muted)' }}>Take a photo or upload your ticket to auto-fill weights</p>
          </div>
          <Upload className="w-5 h-5 ml-auto mr-2" style={{ color: 'var(--mx-muted-2)' }} />
        </button>
      )}

      {(status === "uploading" || status === "extracting") && (
        <div className="w-full flex items-center justify-center gap-4 py-7 rounded-[18px] border border-[#DCE9FA] bg-[#EFF4FF]">
          <Loader2 className="w-7 h-7 text-[#1E4D99] animate-spin" />
          <div>
            <p className="text-base font-bold text-[#1E4D99]">
              {status === "uploading" ? "Uploading document…" : "Extracting data with AI…"}
            </p>
            <p className="text-sm mt-0.5" style={{ color: 'var(--mx-muted)' }}>This only takes a moment</p>
          </div>
        </div>
      )}

      {status === "done" && (
        <div className="w-full flex items-center justify-center gap-4 py-7 rounded-[18px] border border-[#C3EDD5] bg-[#EDFBF3]">
          <CheckCircle2 className="w-7 h-7 text-[#1B7A45]" />
          <div>
            <p className="text-base font-bold text-[#1B7A45]">Ticket scanned successfully!</p>
            <p className="text-sm mt-0.5 text-[#1B7A45]/70">Weight fields have been auto-filled — review below</p>
          </div>
        </div>
      )}

      {status === "error" && (
        <div className="w-full rounded-[18px] border border-red-200 bg-red-50 p-5">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-base font-bold text-red-600">Could not read ticket</p>
          </div>
          <p className="text-sm text-red-500 mb-3">{errorMsg}</p>
          <button onClick={() => setStatus("idle")} className="text-sm font-semibold text-red-600 underline">
            Try again
          </button>
        </div>
      )}
    </div>
  );
}

// ── Weight Row ──────────────────────────────────────────────────────────────
function WeightRow({ label, field, datetimeField, value, datetime, onChange }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-[10px] font-bold tracking-[1.5px] uppercase" style={{ color: 'var(--mx-muted)' }}>{label}</Label>
      <Input
        className={mx_input}
        type="number"
        step="0.01"
        placeholder="0.00"
        value={value || ''}
        onChange={e => onChange(field, e.target.value)}
      />
      {datetime && (
        <p className="text-[10px]" style={{ color: 'var(--mx-muted-2)' }}>⏱ {datetime}</p>
      )}
    </div>
  );
}

// ── Main Page ───────────────────────────────────────────────────────────────
export default function DriverDocketUpload() {
  const qc = useQueryClient();
  const [form, setForm] = useState(() => {
    const ticket = genTicket();
    return { ...EMPTY, ticket_no: ticket, docket_no: ticket, order_date: todayStr(), docket_date: todayStr() };
  });
  const [saved, setSaved] = useState(false);

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const computeNet = (gross, tare) => {
    const g = parseFloat(gross) || 0;
    const t = parseFloat(tare) || 0;
    return g > 0 && t > 0 ? Math.max(0, g - t) : '';
  };

  const handleWeightChange = (field, value) => {
    const now = nowStr();
    const updates = { [field]: value };
    if (field === 'gross_tonnes') {
      updates.gross_datetime = now;
      const net = computeNet(value, form.tare_tonnes);
      updates.net_tonnes = net;
      if (net) updates.net_datetime = now;
    }
    if (field === 'tare_tonnes') {
      updates.tare_datetime = now;
      const net = computeNet(form.gross_tonnes, value);
      updates.net_tonnes = net;
      if (net) updates.net_datetime = now;
    }
    setForm(f => ({ ...f, ...updates }));
  };

  const handleExtracted = (extracted) => {
    const now = nowStr();
    const updates = {};
    if (extracted.gross_tonnes) { updates.gross_tonnes = extracted.gross_tonnes; updates.gross_datetime = now; }
    if (extracted.tare_tonnes) { updates.tare_tonnes = extracted.tare_tonnes; updates.tare_datetime = now; }
    if (extracted.net_tonnes) { updates.net_tonnes = extracted.net_tonnes; updates.net_datetime = now; }
    else if (extracted.gross_tonnes && extracted.tare_tonnes) {
      updates.net_tonnes = computeNet(extracted.gross_tonnes, extracted.tare_tonnes);
      if (updates.net_tonnes) updates.net_datetime = now;
    }
    if (extracted.notes_from_document) updates.comments = extracted.notes_from_document;
    if (extracted.material_grading_from_document) updates.material_grade = extracted.material_grading_from_document;
    setForm(f => ({ ...f, ...updates }));
  };

  const save = useMutation({
    mutationFn: () => base44.entities.WeightDocket.create(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['weight-dockets'] });
      setSaved(true);
    },
  });

  const handleNewJob = () => {
    const ticket = genTicket();
    setForm({ ...EMPTY, ticket_no: ticket, docket_no: ticket, order_date: todayStr(), docket_date: todayStr() });
    setSaved(false);
  };

  const isReady = form.gross_tonnes && form.tare_tonnes && form.rego;

  return (
    <div className="min-h-screen" style={{ background: 'var(--mx-paper)' }}>
      {/* Nav */}
      <nav className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-[#EAEEF5] shadow-[0_2px_18px_rgba(11,25,41,0.06)]">
        <div className="max-w-xl mx-auto px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="https://media.base44.com/images/public/69f7b7e128899b8db1200527/c72ebbf3f_MetalXLogo.png"
              alt="Metal X" className="h-7 object-contain"
            />
            <span className="text-[10px] font-bold tracking-[2px] uppercase ml-2 pl-3 border-l border-[#EAEEF5]" style={{ color: 'var(--mx-muted-2)' }}>
              Driver Portal
            </span>
          </div>
          <div className="w-8 h-8 rounded-full bg-[#EFF4FF] flex items-center justify-center">
            <Truck className="w-4 h-4 text-[#1E4D99]" />
          </div>
        </div>
      </nav>

      <main className="max-w-xl mx-auto px-5 py-8 space-y-6">

        {/* Job Header */}
        <div className="rounded-[18px] overflow-hidden" style={{ background: 'var(--mx-hero-gradient)' }}>
          <div className="px-6 py-5">
            <p className="text-[10px] font-bold tracking-[2px] uppercase text-[#90C4F9]">Current Job</p>
            <h1 className="text-xl font-black text-white mt-1">{form.ticket_no}</h1>
            <p className="text-sm text-[#90C4F9] mt-1">{form.order_date}</p>
          </div>
        </div>

        {saved ? (
          /* ── Success State ── */
          <div className="rounded-[18px] bg-white border border-[#EAEEF5] shadow-[0_10px_40px_rgba(11,25,41,0.10)] p-8 flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#EDFBF3] flex items-center justify-center">
              <CheckCircle2 className="w-9 h-9 text-[#1B7A45]" />
            </div>
            <div>
              <h2 className="text-xl font-black" style={{ color: 'var(--mx-text)' }}>Docket Submitted!</h2>
              <p className="text-sm mt-1" style={{ color: 'var(--mx-muted)' }}>Your weighbridge docket has been recorded successfully.</p>
            </div>
            <Button
              onClick={handleNewJob}
              style={{ background: 'var(--mx-hero-gradient)' }}
              className="text-white font-semibold rounded-[12px] h-11 px-6 mt-2"
            >
              Next Job <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        ) : (
          <>
            {/* ── Step 1: Scan Ticket ── */}
            <div className="rounded-[18px] bg-white border border-[#EAEEF5] shadow-[0_10px_40px_rgba(11,25,41,0.10)] p-5">
              <p className="text-[10px] font-bold tracking-[2px] uppercase mb-1" style={{ color: 'var(--mx-muted-2)' }}>Step 1</p>
              <h2 className="text-base font-black mb-4" style={{ color: 'var(--mx-text)' }}>Scan Your Ticket</h2>
              <DriverOCRPanel onExtracted={handleExtracted} />
            </div>

            {/* ── Step 2: Confirm Weights ── */}
            <div className="rounded-[18px] bg-white border border-[#EAEEF5] shadow-[0_10px_40px_rgba(11,25,41,0.10)] p-5">
              <p className="text-[10px] font-bold tracking-[2px] uppercase mb-1" style={{ color: 'var(--mx-muted-2)' }}>Step 2</p>
              <h2 className="text-base font-black mb-4" style={{ color: 'var(--mx-text)' }}>Confirm Weights</h2>
              <div className="grid grid-cols-1 gap-4">
                <WeightRow label="Gross (Tonnes)" field="gross_tonnes" value={form.gross_tonnes} datetime={form.gross_datetime} onChange={handleWeightChange} />
                <WeightRow label="Tare (Tonnes)" field="tare_tonnes" value={form.tare_tonnes} datetime={form.tare_datetime} onChange={handleWeightChange} />
                <div className="flex flex-col gap-1.5">
                  <Label className="text-[10px] font-bold tracking-[1.5px] uppercase" style={{ color: 'var(--mx-muted)' }}>Net (Tonnes) — Auto Calculated</Label>
                  <Input
                    className={mx_input + ' bg-[#EFF4FF] font-black text-[#1E4D99]'}
                    value={form.net_tonnes || ''}
                    readOnly
                    placeholder="Auto-calculated"
                  />
                  {form.net_datetime && <p className="text-[10px]" style={{ color: 'var(--mx-muted-2)' }}>⏱ {form.net_datetime}</p>}
                </div>
              </div>
            </div>

            {/* ── Step 3: Vehicle & Driver ── */}
            <div className="rounded-[18px] bg-white border border-[#EAEEF5] shadow-[0_10px_40px_rgba(11,25,41,0.10)] p-5">
              <p className="text-[10px] font-bold tracking-[2px] uppercase mb-1" style={{ color: 'var(--mx-muted-2)' }}>Step 3</p>
              <h2 className="text-base font-black mb-4" style={{ color: 'var(--mx-text)' }}>Vehicle & Driver Details</h2>
              <div className="grid grid-cols-1 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label className="text-[10px] font-bold tracking-[1.5px] uppercase" style={{ color: 'var(--mx-muted)' }}>Vehicle Rego *</Label>
                  <Input className={mx_input} placeholder="e.g. 1ISD240" value={form.rego || ''} onChange={e => set('rego', e.target.value)} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-[10px] font-bold tracking-[1.5px] uppercase" style={{ color: 'var(--mx-muted)' }}>Driver Name</Label>
                  <Input className={mx_input} placeholder="Your name" value={form.driver_name || ''} onChange={e => set('driver_name', e.target.value)} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-[10px] font-bold tracking-[1.5px] uppercase" style={{ color: 'var(--mx-muted)' }}>From Location</Label>
                  <Input className={mx_input} placeholder="Pickup address" value={form.from_location || ''} onChange={e => set('from_location', e.target.value)} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-[10px] font-bold tracking-[1.5px] uppercase" style={{ color: 'var(--mx-muted)' }}>To Location</Label>
                  <Input className={mx_input} placeholder="Delivery address" value={form.to_location || ''} onChange={e => set('to_location', e.target.value)} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-[10px] font-bold tracking-[1.5px] uppercase" style={{ color: 'var(--mx-muted)' }}>Comments</Label>
                  <textarea
                    rows={3}
                    className="w-full bg-white border border-[#EAEEF5] rounded-lg text-sm font-medium p-3 focus:ring-2 focus:ring-[#1E4D99] outline-none resize-none"
                    placeholder="Any notes about this load…"
                    value={form.comments || ''}
                    onChange={e => set('comments', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* ── Submit ── */}
            <Button
              onClick={() => save.mutate()}
              disabled={!isReady || save.isPending}
              style={{ background: isReady ? 'var(--mx-hero-gradient)' : undefined }}
              className="w-full h-14 text-base font-black rounded-[14px] text-white"
            >
              {save.isPending ? (
                <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Submitting…</>
              ) : (
                <><Save className="w-5 h-5 mr-2" /> Submit Docket</>
              )}
            </Button>
            {!isReady && (
              <p className="text-center text-xs" style={{ color: 'var(--mx-muted-2)' }}>
                * Gross weight, tare weight and vehicle rego are required to submit
              </p>
            )}
          </>
        )}
      </main>
    </div>
  );
}