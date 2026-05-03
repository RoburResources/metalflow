import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ChevronRight, ChevronLeft, Save, Eye } from "lucide-react";
import SignaturePad from "./SignaturePad";
import PhotoUpload from "./PhotoUpload";
import MaterialGradeSelector from "./MaterialGradeSelector";
import LocationSearch from "./LocationSearch";
import AIComments from "./AIComments";

const Section = ({ title, eyebrow, children }) => (
  <div className="mb-8">
    <div className="mb-4">
      <p className="text-[10px] font-bold tracking-[2px] uppercase" style={{ color: 'var(--mx-muted-2)' }}>{eyebrow}</p>
      <h3 className="text-base mt-0.5" style={{ color: 'var(--mx-text)', fontWeight: 800 }}>{title}</h3>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {children}
    </div>
  </div>
);

const Field = ({ label, children, full = false }) => (
  <div className={`flex flex-col gap-1.5 ${full ? 'md:col-span-2' : ''}`}>
    <Label className="text-[10px] font-bold tracking-[1.5px] uppercase" style={{ color: 'var(--mx-muted)' }}>{label}</Label>
    {children}
  </div>
);

const mx_input = "bg-white border border-[#EAEEF5] rounded-lg text-sm font-medium focus:ring-2 focus:ring-[#1E4D99] focus:border-[#1E4D99] placeholder:text-[#AAB0C4]";

const nowStr = () => {
  const d = new Date();
  return d.toLocaleString('en-AU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
};

const todayStr = () => new Date().toISOString().slice(0, 10);

const genTicket = () => {
  const num = Math.floor(Math.random() * 9000000 + 1000000);
  return `MX-S${num}`;
};

const STEPS = [
  { id: 'ticket', label: 'Ticket & Load', eyebrow: 'Step 1' },
  { id: 'weights', label: 'Weights', eyebrow: 'Step 2' },
  { id: 'grading', label: 'Grading', eyebrow: 'Step 3' },
  { id: 'signatures', label: 'Signatures & Photos', eyebrow: 'Step 4' },
];

export default function DocketForm({ data, onChange, onPreview, onSave, saving, isNew }) {
  const [step, setStep] = useState(0);

  // Auto-populate on new docket
  useEffect(() => {
    if (isNew && !data.ticket_no) {
      const ticket = genTicket();
      onChange({
        ...data,
        ticket_no: ticket,
        docket_no: ticket,
        order_date: todayStr(),
        docket_date: todayStr(),
      });
    }
  }, [isNew]);

  const set = (field, value) => onChange({ ...data, [field]: value });

  const computeNet = (gross, tare) => {
    const g = parseFloat(gross) || 0;
    const t = parseFloat(tare) || 0;
    return Math.max(0, g - t) || '';
  };

  const handleWeightChange = (field, value) => {
    const now = nowStr();
    const updates = { [field]: value };
    if (field === 'gross_tonnes') {
      updates.gross_datetime = now;
      updates.net_tonnes = computeNet(value, data.tare_tonnes);
      if (updates.net_tonnes) updates.net_datetime = now;
    }
    if (field === 'tare_tonnes') {
      updates.tare_datetime = now;
      updates.net_tonnes = computeNet(data.gross_tonnes, value);
      if (updates.net_tonnes) updates.net_datetime = now;
    }
    onChange({ ...data, ...updates });
  };

  return (
    <div className="rounded-[18px] bg-white border border-[#EAEEF5] shadow-[0_10px_40px_rgba(11,25,41,0.10)] overflow-hidden">
      {/* Step Nav */}
      <div className="flex border-b border-[#EAEEF5] overflow-x-auto">
        {STEPS.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setStep(i)}
            className={`flex-1 min-w-[80px] py-3 px-3 text-xs transition-all whitespace-nowrap ${
              i === step
                ? 'border-b-2 border-[#1E4D99] text-[#1E4D99] bg-[#EFF4FF]'
                : 'text-[#7A8898] hover:text-[#0D1A2E] hover:bg-[#F4F7FC]'
            }`}
            style={{ fontWeight: i === step ? 700 : 600 }}
          >
            <span className="block text-[9px] tracking-[1.5px] uppercase opacity-70">{s.eyebrow}</span>
            <span>{s.label}</span>
          </button>
        ))}
      </div>

      <div className="p-6">
        {/* STEP 0: Ticket & Load */}
        {step === 0 && (
          <>
            <Section title="Ticket & Billing" eyebrow="Document Reference">
              <Field label="Ticket Number (Auto-generated)">
                <div className="flex gap-2">
                  <Input className={mx_input + ' bg-[#F4F7FC] flex-1'} value={data.ticket_no || ''} readOnly />
                  <button onClick={() => { const t = genTicket(); set('ticket_no', t); set('docket_no', t); }} className="px-3 py-2 text-xs font-semibold rounded-lg border border-[#EAEEF5] hover:bg-[#EFF4FF] text-[#1E4D99]">↻</button>
                </div>
              </Field>
              <Field label="Order Date (Auto)">
                <Input className={mx_input + ' bg-[#F4F7FC]'} type="date" value={data.order_date || ''} readOnly />
              </Field>
              <Field label="Bill To — Name">
                <Input className={mx_input} placeholder="Metal X" value={data.bill_to_name || ''} onChange={e => set('bill_to_name', e.target.value)} />
              </Field>
              <Field label="Bill To — Address">
                <Input className={mx_input} placeholder="PO Box Z5150, St Georges Terrace 6000" value={data.bill_to_address || ''} onChange={e => set('bill_to_address', e.target.value)} />
              </Field>
              <Field label="Customer Email (for verified docket delivery)">
                <Input className={mx_input} type="email" placeholder="customer@example.com" value={data.customer_email || ''} onChange={e => set('customer_email', e.target.value)} />
              </Field>
              <Field label="Payment Status">
                <Select value={data.payment_status || 'Paid on Account'} onValueChange={v => set('payment_status', v)}>
                  <SelectTrigger className={mx_input}><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['Paid on Account','Pending','Cash','Invoice'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Docket Status">
                <Select value={data.status || 'Draft'} onValueChange={v => set('status', v)}>
                  <SelectTrigger className={mx_input}><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['Draft','Pending','Verified','Archived'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
            </Section>

            <Section title="From Location" eyebrow="Origin">
              <div className="md:col-span-2">
                <LocationSearch
                  label="From"
                  value={data.from_location || ''}
                  company={data.from_company || ''}
                  onChangeLocation={v => set('from_location', v)}
                  onChangeCompany={v => set('from_company', v)}
                />
              </div>
            </Section>

            <Section title="To Location" eyebrow="Destination">
              <div className="md:col-span-2">
                <LocationSearch
                  label="To"
                  value={data.to_location || ''}
                  company={data.to_company || ''}
                  onChangeLocation={v => set('to_location', v)}
                  onChangeCompany={v => set('to_company', v)}
                />
              </div>
            </Section>

            <Section title="Vehicle & Load" eyebrow="Movement">
              <Field label="Vehicle Rego">
                <Input className={mx_input} placeholder="1ISD240" value={data.rego || ''} onChange={e => set('rego', e.target.value)} />
              </Field>
              <Field label="Goods Weighed / Reference">
                <Input className={mx_input} placeholder="3401" value={data.goods_weighed || ''} onChange={e => set('goods_weighed', e.target.value)} />
              </Field>
              <Field label="Driver Name">
                <Input className={mx_input} placeholder="MICHAEL" value={data.driver_name || ''} onChange={e => set('driver_name', e.target.value)} />
              </Field>
              <Field label="Weigh Person Name">
                <Input className={mx_input} value={data.weigh_person_name || ''} onChange={e => set('weigh_person_name', e.target.value)} />
              </Field>
            </Section>
          </>
        )}

        {/* STEP 1: Weights */}
        {step === 1 && (
          <Section title="Weight Readings" eyebrow="Weighbridge Data — Date/Time Auto-Captured">
            <Field label="Gross (Tonnes)">
              <Input className={mx_input} type="number" step="0.01" placeholder="7.62" value={data.gross_tonnes || ''} onChange={e => handleWeightChange('gross_tonnes', e.target.value)} />
            </Field>
            <Field label="Gross Date/Time (Auto)">
              <Input className={mx_input + ' bg-[#F4F7FC]'} value={data.gross_datetime || ''} readOnly placeholder="Auto-captured on entry" />
            </Field>
            <Field label="Tare (Tonnes)">
              <Input className={mx_input} type="number" step="0.01" placeholder="6.24" value={data.tare_tonnes || ''} onChange={e => handleWeightChange('tare_tonnes', e.target.value)} />
            </Field>
            <Field label="Tare Date/Time (Auto)">
              <Input className={mx_input + ' bg-[#F4F7FC]'} value={data.tare_datetime || ''} readOnly placeholder="Auto-captured on entry" />
            </Field>
            <Field label="Net (Tonnes) — Auto-calculated">
              <Input className={mx_input + ' bg-[#EFF4FF] font-bold text-[#1E4D99]'} type="number" step="0.01" value={data.net_tonnes || ''} readOnly />
            </Field>
            <Field label="Net Date/Time (Auto)">
              <Input className={mx_input + ' bg-[#F4F7FC]'} value={data.net_datetime || ''} readOnly placeholder="Auto-calculated" />
            </Field>
          </Section>
        )}

        {/* STEP 2: Grading */}
        {step === 2 && (
          <>
            <Section title="Docket Reference" eyebrow="Material Grading Docket">
              <Field label="Docket Number (= Job No = Ticket No)">
                <Input className={mx_input + ' bg-[#F4F7FC]'} value={data.docket_no || data.ticket_no || ''} readOnly />
              </Field>
              <Field label="Docket Date (Auto)">
                <Input className={mx_input + ' bg-[#F4F7FC]'} type="date" value={data.docket_date || ''} readOnly />
              </Field>
              <Field label="Customer Name">
                <Input className={mx_input} placeholder="Metal X" value={data.customer_name || ''} onChange={e => set('customer_name', e.target.value)} />
              </Field>
              <Field label="Site Address">
                <Input className={mx_input} placeholder="West 2 West" value={data.site_address || ''} onChange={e => set('site_address', e.target.value)} />
              </Field>
            </Section>

            <Section title="Collection Mode" eyebrow="Transaction Type">
              <Field label="Pickup">
                <div className="flex items-center gap-2 pt-1">
                  <Switch checked={!!data.pickup} onCheckedChange={v => set('pickup', v)} />
                  <span className="text-sm text-[#7A8898]">{data.pickup ? 'Yes' : 'No'}</span>
                </div>
              </Field>
              <Field label="Swap">
                <div className="flex items-center gap-2 pt-1">
                  <Switch checked={!!data.swap} onCheckedChange={v => set('swap', v)} />
                  <span className="text-sm text-[#7A8898]">{data.swap ? 'Yes' : 'No'}</span>
                </div>
              </Field>
              <Field label="Deliver">
                <div className="flex items-center gap-2 pt-1">
                  <Switch checked={data.deliver !== false} onCheckedChange={v => set('deliver', v)} />
                  <span className="text-sm text-[#7A8898]">{data.deliver !== false ? 'Yes' : 'No'}</span>
                </div>
              </Field>
              <Field label="Cash Payment">
                <Input className={mx_input} placeholder="$0.00" value={data.cash_payment || ''} onChange={e => set('cash_payment', e.target.value)} />
              </Field>
              <Field label="Amount $">
                <Input className={mx_input} type="number" step="0.01" value={data.amount || ''} onChange={e => set('amount', e.target.value)} />
              </Field>
            </Section>

            <div className="mb-8">
              <div className="mb-4">
                <p className="text-[10px] font-bold tracking-[2px] uppercase" style={{ color: 'var(--mx-muted-2)' }}>Grading</p>
                <h3 className="text-base mt-0.5" style={{ color: 'var(--mx-text)', fontWeight: 800 }}>Material Grade</h3>
              </div>
              <MaterialGradeSelector
                grades={data.material_grades || []}
                onChange={v => set('material_grades', v)}
              />
            </div>

            <div className="mb-8">
              <div className="mb-4">
                <p className="text-[10px] font-bold tracking-[2px] uppercase" style={{ color: 'var(--mx-muted-2)' }}>Notes</p>
                <h3 className="text-base mt-0.5" style={{ color: 'var(--mx-text)', fontWeight: 800 }}>Contamination & Comments</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold tracking-[1.5px] uppercase block mb-1.5" style={{ color: 'var(--mx-muted)' }}>Contamination / Deductions</label>
                  <textarea
                    rows={2}
                    className="w-full bg-white border border-[#EAEEF5] rounded-lg text-sm font-medium p-3 focus:ring-2 focus:ring-[#1E4D99] outline-none resize-none"
                    value={data.contamination_notes || ''}
                    onChange={e => set('contamination_notes', e.target.value)}
                  />
                </div>
                <AIComments data={data} value={data.comments} onChange={v => set('comments', v)} />
              </div>
            </div>
          </>
        )}

        {/* STEP 3: Signatures & Photos */}
        {step === 3 && (
          <>
            <Section title="Driver Signature" eyebrow="Signatures">
              <div className="md:col-span-2">
                <SignaturePad
                  label="Driver Signature"
                  value={data.driver_signature}
                  onChange={v => set('driver_signature', v)}
                />
              </div>
              <div className="md:col-span-2">
                <SignaturePad
                  label="Weigh Person Signature"
                  value={data.weigh_person_signature}
                  onChange={v => set('weigh_person_signature', v)}
                />
              </div>
            </Section>
            <div className="mb-8">
              <div className="mb-4">
                <p className="text-[10px] font-bold tracking-[2px] uppercase" style={{ color: 'var(--mx-muted-2)' }}>Evidence</p>
                <h3 className="text-base mt-0.5" style={{ color: 'var(--mx-text)', fontWeight: 800 }}>Photos</h3>
              </div>
              <PhotoUpload
                photos={data.photo_urls || []}
                onChange={v => set('photo_urls', v)}
              />
            </div>
          </>
        )}
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between px-6 py-4 bg-[#F4F7FC] border-t border-[#EAEEF5]">
        <Button variant="ghost" onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0} className="text-[#7A8898] hover:text-[#0D1A2E]">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onPreview} className="border-[#EAEEF5] text-[#1E4D99] hover:bg-[#EFF4FF]">
            <Eye className="w-4 h-4 mr-1.5" /> Preview
          </Button>
          {step < STEPS.length - 1 ? (
            <Button onClick={() => setStep(s => s + 1)} style={{ background: 'var(--mx-hero-gradient)' }} className="text-white font-semibold">
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={onSave} disabled={saving} style={{ background: 'var(--mx-hero-gradient)' }} className="text-white font-semibold">
              <Save className="w-4 h-4 mr-1.5" /> {saving ? 'Saving…' : 'Save Docket'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}