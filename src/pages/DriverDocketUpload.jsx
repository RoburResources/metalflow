import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, CheckCircle2, Save, ChevronRight, Truck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import ScheduleLookup from "@/components/driver/ScheduleLookup";
import AddressSuggest from "@/components/driver/AddressSuggest";
import AIAssistPanel from "@/components/driver/AIAssistPanel";
import PhotoAIPanel from "@/components/driver/PhotoAIPanel";

const mx_input = "bg-white border border-[#EAEEF5] rounded-lg text-sm font-medium focus:ring-2 focus:ring-[#1E4D99] focus:border-[#1E4D99] placeholder:text-[#AAB0C4] uppercase";
const mx_input_readonly = "bg-[#F4F7FC] border border-[#EAEEF5] rounded-lg text-sm font-semibold text-[#7A8898] px-3 h-9 w-full uppercase";

const nowStr = () => new Date().toLocaleString('en-AU', {
  day: '2-digit', month: '2-digit', year: 'numeric',
  hour: '2-digit', minute: '2-digit', hour12: true,
});
const genTicket = () => `DRV-S${Math.floor(Math.random() * 9000000 + 1000000)}`;
const todayStr = () => new Date().toISOString().slice(0, 10);

const DEFAULTS = {
  ticket_no: '', order_date: '',
  bill_to_name: 'METAL X RENEWABLES',
  bill_to_address: 'PO BOX Z5150, ST GEORGES TERRACE 6000',
  rego: '', driver_name: '', customer_name: '', customer_email: '',
  from_location: '', from_company: '', to_location: '', to_company: '',
  goods_weighed: '', material_grade: '', comments: '', contamination_notes: '',
  gross_tonnes: '', gross_datetime: '', tare_tonnes: '', tare_datetime: '',
  net_tonnes: '', net_datetime: '', photo_urls: [], driver_signature: '',
  status: 'Pending', schedule_id: '',
};

function FieldRow({ label, children, prefilled }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-[10px] font-bold tracking-[1.5px] uppercase flex items-center gap-2" style={{ color: 'var(--mx-muted)' }}>
        {label}
        {prefilled && <span className="text-[#1B7A45] normal-case font-semibold text-[9px]">● FROM SCHEDULE</span>}
      </Label>
      {children}
    </div>
  );
}

function WeightField({ label, field, value, datetime, onChange }) {
  return (
    <FieldRow label={label}>
      <Input
        className={mx_input}
        type="number" step="0.01" placeholder="0.00"
        value={value || ''}
        onChange={e => onChange(field, e.target.value)}
      />
      {datetime && <p className="text-[10px]" style={{ color: 'var(--mx-muted-2)' }}>⏱ {datetime}</p>}
    </FieldRow>
  );
}

// ── OCR Scan Panel ──────────────────────────────────────────────────────────
import { useRef } from "react";
import { Camera, Upload, AlertCircle } from "lucide-react";

function OCRScanPanel({ onExtracted }) {
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
      setErrorMsg(err.message || "EXTRACTION FAILED");
      setStatus("error");
    }
  };

  if (status === "idle") return (
    <>
      <input ref={fileInputRef} type="file" accept="image/*,application/pdf" capture="environment" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }} />
      <button onClick={() => fileInputRef.current?.click()}
        className="w-full flex items-center justify-center gap-4 py-6 rounded-[16px] border-2 border-dashed border-[#DCE9FA] bg-[#EFF4FF] hover:bg-[#E5EEFB] hover:border-[#1E4D99] transition-all group">
        <div className="w-12 h-12 rounded-full bg-[#1E4D99] flex items-center justify-center group-hover:scale-105 transition-transform shadow-lg">
          <Camera className="w-6 h-6 text-white" />
        </div>
        <div className="text-left">
          <p className="text-sm font-bold text-[#1E4D99]">SCAN WEIGHBRIDGE TICKET</p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--mx-muted)' }}>Take a photo or upload to auto-fill weights</p>
        </div>
        <Upload className="w-4 h-4 ml-auto mr-2" style={{ color: 'var(--mx-muted-2)' }} />
      </button>
    </>
  );

  if (status === "uploading" || status === "extracting") return (
    <div className="w-full flex items-center justify-center gap-4 py-6 rounded-[16px] border border-[#DCE9FA] bg-[#EFF4FF]">
      <Loader2 className="w-6 h-6 text-[#1E4D99] animate-spin" />
      <div>
        <p className="text-sm font-bold text-[#1E4D99]">{status === "uploading" ? "UPLOADING…" : "EXTRACTING WITH AI…"}</p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--mx-muted)' }}>This only takes a moment</p>
      </div>
    </div>
  );

  if (status === "done") return (
    <div className="w-full flex items-center justify-center gap-4 py-6 rounded-[16px] border border-[#C3EDD5] bg-[#EDFBF3]">
      <CheckCircle2 className="w-6 h-6 text-[#1B7A45]" />
      <div>
        <p className="text-sm font-bold text-[#1B7A45]">TICKET SCANNED SUCCESSFULLY!</p>
        <p className="text-xs mt-0.5 text-[#1B7A45]/70">Weight fields auto-filled — review below</p>
      </div>
    </div>
  );

  return (
    <div className="w-full rounded-[16px] border border-red-200 bg-red-50 p-4">
      <div className="flex items-center gap-2 mb-1">
        <AlertCircle className="w-4 h-4 text-red-500" />
        <p className="text-sm font-bold text-red-600">COULD NOT READ TICKET</p>
      </div>
      <p className="text-xs text-red-500 mb-2">{errorMsg}</p>
      <button onClick={() => setStatus("idle")} className="text-xs font-semibold text-red-600 underline">Try again</button>
    </div>
  );
}

// ── Photo AI Result Banner ──────────────────────────────────────────────────
function PhotoAIBanner({ result, onDismiss }) {
  if (!result) return null;
  return (
    <div className={`rounded-[12px] p-3 border flex gap-3 items-start ${result.contamination_detected ? 'bg-amber-50 border-amber-200' : 'bg-[#EDFBF3] border-[#C3EDD5]'}`}>
      <div className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${result.contamination_detected ? 'bg-amber-100' : 'bg-[#C3EDD5]'}`}>
        <Sparkles className={`w-3.5 h-3.5 ${result.contamination_detected ? 'text-amber-600' : 'text-[#1B7A45]'}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: result.contamination_detected ? '#92400E' : '#1B7A45' }}>
          AI PHOTO ANALYSIS
        </p>
        {result.summary && <p className="text-xs font-semibold" style={{ color: 'var(--mx-text)' }}>{result.summary}</p>}
        {result.contamination_detected && <p className="text-xs text-amber-700 mt-0.5">⚠ {result.contamination_detected}</p>}
        {result.material_observed && <p className="text-xs text-[#1E4D99] mt-0.5">Material: {result.material_observed}</p>}
        {result.quality_issues && <p className="text-xs text-[#7A8898] mt-0.5">{result.quality_issues}</p>}
      </div>
      <button onClick={onDismiss} className="text-[10px] text-[#7A8898] underline shrink-0">Dismiss</button>
    </div>
  );
}

// ── Main Page ───────────────────────────────────────────────────────────────
export default function DriverDocketUpload() {
  const qc = useQueryClient();
  const [form, setForm] = useState(() => {
    const ticket = genTicket();
    return { ...DEFAULTS, ticket_no: ticket, order_date: todayStr() };
  });
  const [scheduleId, setScheduleId] = useState('');
  const [prefilledFields, setPrefilledFields] = useState({});
  const [saved, setSaved] = useState(false);
  const [photoAIResult, setPhotoAIResult] = useState(null);

  const set = (field, val) => setForm(f => ({ ...f, [field]: typeof val === 'string' ? val.toUpperCase() : val }));
  const setMany = (updates) => setForm(f => ({ ...f, ...Object.fromEntries(Object.entries(updates).map(([k, v]) => [k, typeof v === 'string' ? v.toUpperCase() : v])) }));

  const computeNet = (gross, tare) => {
    const g = parseFloat(gross) || 0, t = parseFloat(tare) || 0;
    return g > 0 && t > 0 ? Math.max(0, g - t) : '';
  };

  const handleWeightChange = (field, value) => {
    const now = nowStr();
    const updates = { [field]: value };
    if (field === 'gross_tonnes') {
      updates.gross_datetime = now;
      const net = computeNet(value, form.tare_tonnes);
      updates.net_tonnes = net; if (net) updates.net_datetime = now;
    }
    if (field === 'tare_tonnes') {
      updates.tare_datetime = now;
      const net = computeNet(form.gross_tonnes, value);
      updates.net_tonnes = net; if (net) updates.net_datetime = now;
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
    if (extracted.notes_from_document) updates.comments = extracted.notes_from_document.toUpperCase();
    if (extracted.material_grading_from_document) updates.material_grade = extracted.material_grading_from_document.toUpperCase();
    setForm(f => ({ ...f, ...updates }));
  };

  const handleScheduleLoaded = (schedule) => {
    const filled = {};
    const updates = {};
    if (schedule.vehicle_rego) { updates.rego = schedule.vehicle_rego.toUpperCase(); filled.rego = true; }
    if (schedule.driver_name) { updates.driver_name = schedule.driver_name.toUpperCase(); filled.driver_name = true; }
    if (schedule.client_name) { updates.customer_name = schedule.client_name.toUpperCase(); filled.customer_name = true; }
    if (schedule.pickup_location) { updates.from_location = schedule.pickup_location.toUpperCase(); filled.from_location = true; }
    if (schedule.delivery_location) { updates.to_location = schedule.delivery_location.toUpperCase(); filled.to_location = true; }
    if (schedule.expected_material) { updates.goods_weighed = schedule.expected_material.toUpperCase(); filled.goods_weighed = true; }
    updates.schedule_id = schedule.job_id;
    setForm(f => ({ ...f, ...updates }));
    setPrefilledFields(filled);
  };

  const handleAIUpdate = (updates) => setMany(updates);

  const save = useMutation({
    mutationFn: () => base44.entities.DriverDocket.create({ ...form, schedule_id: scheduleId }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['driver-dockets'] }); setSaved(true); },
  });

  const handleNewJob = () => {
    const ticket = genTicket();
    setForm({ ...DEFAULTS, ticket_no: ticket, order_date: todayStr() });
    setScheduleId('');
    setPrefilledFields({});
    setSaved(false);
    setPhotoAIResult(null);
  };

  const isReady = form.gross_tonnes && form.tare_tonnes && form.rego;

  return (
    <div className="min-h-screen" style={{ background: 'var(--mx-paper)' }}>
      {/* Nav */}
      <nav className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-[#EAEEF5] shadow-[0_2px_18px_rgba(11,25,41,0.06)]">
        <div className="max-w-xl mx-auto px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="https://media.base44.com/images/public/69f7b7e128899b8db1200527/c72ebbf3f_MetalXLogo.png" alt="Metal X" className="h-7 object-contain" />
            <span className="text-[10px] font-bold tracking-[2px] uppercase ml-2 pl-3 border-l border-[#EAEEF5]" style={{ color: 'var(--mx-muted-2)' }}>Driver Portal</span>
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
          {/* Metal X Details */}
          <div className="px-6 py-3 border-t border-white/10 flex justify-between items-center">
            <div>
              <p className="text-[10px] font-bold text-[#90C4F9]">{form.bill_to_name}</p>
              <p className="text-[9px] text-[#5BA3F5]">{form.bill_to_address}</p>
            </div>
          </div>
        </div>

        {saved ? (
          <div className="rounded-[18px] bg-white border border-[#EAEEF5] shadow-[0_10px_40px_rgba(11,25,41,0.10)] p-8 flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#EDFBF3] flex items-center justify-center">
              <CheckCircle2 className="w-9 h-9 text-[#1B7A45]" />
            </div>
            <div>
              <h2 className="text-xl font-black" style={{ color: 'var(--mx-text)' }}>DOCKET SUBMITTED!</h2>
              <p className="text-sm mt-1" style={{ color: 'var(--mx-muted)' }}>Your docket has been recorded successfully.</p>
            </div>
            <Button onClick={handleNewJob} style={{ background: 'var(--mx-hero-gradient)' }}
              className="text-white font-semibold rounded-[12px] h-11 px-6 mt-2">
              Next Job <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        ) : (
          <>
            {/* ── Step 0: Schedule Lookup ── */}
            <div className="rounded-[18px] bg-white border border-[#EAEEF5] shadow-[0_10px_40px_rgba(11,25,41,0.10)] p-5">
              <p className="text-[10px] font-bold tracking-[2px] uppercase mb-1" style={{ color: 'var(--mx-muted-2)' }}>Step 1</p>
              <h2 className="text-base font-black mb-4" style={{ color: 'var(--mx-text)' }}>LINK TO SCHEDULE</h2>
              <ScheduleLookup
                scheduleId={scheduleId}
                onScheduleIdChange={setScheduleId}
                onScheduleLoaded={handleScheduleLoaded}
              />
            </div>

            {/* ── Step 1: Scan Ticket ── */}
            <div className="rounded-[18px] bg-white border border-[#EAEEF5] shadow-[0_10px_40px_rgba(11,25,41,0.10)] p-5">
              <p className="text-[10px] font-bold tracking-[2px] uppercase mb-1" style={{ color: 'var(--mx-muted-2)' }}>Step 2</p>
              <h2 className="text-base font-black mb-4" style={{ color: 'var(--mx-text)' }}>SCAN TICKET</h2>
              <OCRScanPanel onExtracted={handleExtracted} />
            </div>

            {/* ── Step 2: Confirm Weights ── */}
            <div className="rounded-[18px] bg-white border border-[#EAEEF5] shadow-[0_10px_40px_rgba(11,25,41,0.10)] p-5">
              <p className="text-[10px] font-bold tracking-[2px] uppercase mb-1" style={{ color: 'var(--mx-muted-2)' }}>Step 3</p>
              <h2 className="text-base font-black mb-4" style={{ color: 'var(--mx-text)' }}>CONFIRM WEIGHTS</h2>
              <div className="grid grid-cols-1 gap-4">
                <WeightField label="GROSS (TONNES)" field="gross_tonnes" value={form.gross_tonnes} datetime={form.gross_datetime} onChange={handleWeightChange} />
                <WeightField label="TARE (TONNES)" field="tare_tonnes" value={form.tare_tonnes} datetime={form.tare_datetime} onChange={handleWeightChange} />
                <FieldRow label="NET (TONNES) — AUTO CALCULATED">
                  <Input className={mx_input + ' bg-[#EFF4FF] font-black text-[#1E4D99]'} value={form.net_tonnes || ''} readOnly placeholder="AUTO-CALCULATED" />
                  {form.net_datetime && <p className="text-[10px]" style={{ color: 'var(--mx-muted-2)' }}>⏱ {form.net_datetime}</p>}
                </FieldRow>
              </div>
            </div>

            {/* ── Step 3: Vehicle & Driver ── */}
            <div className="rounded-[18px] bg-white border border-[#EAEEF5] shadow-[0_10px_40px_rgba(11,25,41,0.10)] p-5">
              <p className="text-[10px] font-bold tracking-[2px] uppercase mb-1" style={{ color: 'var(--mx-muted-2)' }}>Step 4</p>
              <h2 className="text-base font-black mb-4" style={{ color: 'var(--mx-text)' }}>VEHICLE & DRIVER</h2>
              <div className="grid grid-cols-1 gap-4">
                <FieldRow label="VEHICLE REGO *" prefilled={prefilledFields.rego}>
                  <Input className={mx_input} placeholder="E.G. 1ISD240" value={form.rego || ''} onChange={e => set('rego', e.target.value)} />
                </FieldRow>
                <FieldRow label="DRIVER NAME" prefilled={prefilledFields.driver_name}>
                  <Input className={mx_input} placeholder="YOUR NAME" value={form.driver_name || ''} onChange={e => set('driver_name', e.target.value)} />
                </FieldRow>
                <FieldRow label="CUSTOMER / CLIENT" prefilled={prefilledFields.customer_name}>
                  <Input className={mx_input} placeholder="CLIENT NAME" value={form.customer_name || ''} onChange={e => set('customer_name', e.target.value)} />
                </FieldRow>
                <FieldRow label="GOODS / MATERIAL" prefilled={prefilledFields.goods_weighed}>
                  <Input className={mx_input} placeholder="E.G. HEAVY MELT STEEL" value={form.goods_weighed || ''} onChange={e => set('goods_weighed', e.target.value)} />
                </FieldRow>
              </div>
            </div>

            {/* ── Step 4: Locations ── */}
            <div className="rounded-[18px] bg-white border border-[#EAEEF5] shadow-[0_10px_40px_rgba(11,25,41,0.10)] p-5">
              <p className="text-[10px] font-bold tracking-[2px] uppercase mb-1" style={{ color: 'var(--mx-muted-2)' }}>Step 5</p>
              <h2 className="text-base font-black mb-4" style={{ color: 'var(--mx-text)' }}>LOCATIONS</h2>
              <div className="grid grid-cols-1 gap-4">
                <AddressSuggest
                  label="FROM LOCATION"
                  placeholder="PICKUP ADDRESS"
                  value={form.from_location}
                  onChange={val => set('from_location', val)}
                  prefilled={prefilledFields.from_location}
                />
                <FieldRow label="FROM COMPANY">
                  <Input className={mx_input} placeholder="COMPANY NAME" value={form.from_company || ''} onChange={e => set('from_company', e.target.value)} />
                </FieldRow>
                <AddressSuggest
                  label="TO LOCATION"
                  placeholder="DELIVERY ADDRESS"
                  value={form.to_location}
                  onChange={val => set('to_location', val)}
                  prefilled={prefilledFields.to_location}
                />
                <FieldRow label="TO COMPANY">
                  <Input className={mx_input} placeholder="COMPANY NAME" value={form.to_company || ''} onChange={e => set('to_company', e.target.value)} />
                </FieldRow>
              </div>
            </div>

            {/* ── Step 5: Photos ── */}
            <div className="rounded-[18px] bg-white border border-[#EAEEF5] shadow-[0_10px_40px_rgba(11,25,41,0.10)] p-5">
              <p className="text-[10px] font-bold tracking-[2px] uppercase mb-1" style={{ color: 'var(--mx-muted-2)' }}>Step 6</p>
              <h2 className="text-base font-black mb-4" style={{ color: 'var(--mx-text)' }}>PHOTOS</h2>
              <PhotoAIPanel
                photoUrls={form.photo_urls}
                onPhotosChange={urls => setForm(f => ({ ...f, photo_urls: urls }))}
                onAIResult={res => { setPhotoAIResult(res); if (res.contamination_detected) set('contamination_notes', res.contamination_detected); }}
              />
              {photoAIResult && <div className="mt-3"><PhotoAIBanner result={photoAIResult} onDismiss={() => setPhotoAIResult(null)} /></div>}
            </div>

            {/* ── Step 6: AI Analysis ── */}
            <div className="rounded-[18px] bg-white border border-[#EAEEF5] shadow-[0_10px_40px_rgba(11,25,41,0.10)] p-5">
              <p className="text-[10px] font-bold tracking-[2px] uppercase mb-1" style={{ color: 'var(--mx-muted-2)' }}>Step 7</p>
              <h2 className="text-base font-black mb-4" style={{ color: 'var(--mx-text)' }}>AI LOAD ANALYSIS</h2>
              <AIAssistPanel form={form} onUpdate={handleAIUpdate} />
            </div>

            {/* ── Step 7: Notes & Material ── */}
            <div className="rounded-[18px] bg-white border border-[#EAEEF5] shadow-[0_10px_40px_rgba(11,25,41,0.10)] p-5">
              <p className="text-[10px] font-bold tracking-[2px] uppercase mb-1" style={{ color: 'var(--mx-muted-2)' }}>Step 8</p>
              <h2 className="text-base font-black mb-4" style={{ color: 'var(--mx-text)' }}>NOTES & GRADING</h2>
              <div className="grid grid-cols-1 gap-4">
                <FieldRow label="MATERIAL GRADE">
                  <Input className={mx_input} placeholder="E.G. HEAVY MELT STEEL" value={form.material_grade || ''} onChange={e => set('material_grade', e.target.value)} />
                </FieldRow>
                <FieldRow label="CONTAMINATION NOTES">
                  <textarea rows={2} className="w-full bg-white border border-[#EAEEF5] rounded-lg text-sm font-medium p-3 focus:ring-2 focus:ring-[#1E4D99] outline-none resize-none uppercase placeholder:text-[#AAB0C4] placeholder:normal-case"
                    placeholder="Any contamination observations…"
                    value={form.contamination_notes || ''}
                    onChange={e => set('contamination_notes', e.target.value)} />
                </FieldRow>
                <FieldRow label="DRIVER COMMENTS">
                  <textarea rows={3} className="w-full bg-white border border-[#EAEEF5] rounded-lg text-sm font-medium p-3 focus:ring-2 focus:ring-[#1E4D99] outline-none resize-none uppercase placeholder:text-[#AAB0C4] placeholder:normal-case"
                    placeholder="Any notes about this load…"
                    value={form.comments || ''}
                    onChange={e => set('comments', e.target.value)} />
                </FieldRow>
              </div>
            </div>

            {/* ── Submit ── */}
            <Button
              onClick={() => save.mutate()}
              disabled={!isReady || save.isPending}
              style={{ background: isReady ? 'var(--mx-hero-gradient)' : undefined }}
              className="w-full h-14 text-base font-black rounded-[14px] text-white"
            >
              {save.isPending
                ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" />SUBMITTING…</>
                : <><Save className="w-5 h-5 mr-2" />SUBMIT DOCKET</>}
            </Button>
            {!isReady && (
              <p className="text-center text-xs pb-8" style={{ color: 'var(--mx-muted-2)' }}>
                * GROSS WEIGHT, TARE WEIGHT AND VEHICLE REGO ARE REQUIRED
              </p>
            )}
          </>
        )}
      </main>
    </div>
  );
}