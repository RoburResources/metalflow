import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ChevronRight, ChevronLeft, Save, Eye } from "lucide-react";

const Section = ({ title, eyebrow, children }) => (
  <div className="mb-8">
    <div className="mb-4">
      <p className="text-[10px] font-bold tracking-[2px] uppercase" style={{ color: 'var(--mx-muted-2)' }}>{eyebrow}</p>
      <h3 className="text-base font-800 mt-0.5" style={{ color: 'var(--mx-text)', fontWeight: 800 }}>{title}</h3>
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

const STEPS = [
  { id: 'ticket', label: 'Ticket Info', eyebrow: 'Step 1' },
  { id: 'weights', label: 'Weights', eyebrow: 'Step 2' },
  { id: 'grading', label: 'Grading Docket', eyebrow: 'Step 3' },
];

export default function DocketForm({ data, onChange, onPreview, onSave, saving }) {
  const [step, setStep] = useState(0);

  const set = (field, value) => onChange({ ...data, [field]: value });

  const computeNet = (gross, tare) => {
    const g = parseFloat(gross) || 0;
    const t = parseFloat(tare) || 0;
    const net = Math.max(0, g - t);
    return net > 0 ? net : '';
  };

  const handleGrossChange = (v) => {
    const net = computeNet(v, data.tare_tonnes);
    onChange({ ...data, gross_tonnes: v, net_tonnes: net || data.net_tonnes });
  };

  const handleTareChange = (v) => {
    const net = computeNet(data.gross_tonnes, v);
    onChange({ ...data, tare_tonnes: v, net_tonnes: net || data.net_tonnes });
  };

  return (
    <div className="rounded-[18px] bg-white border border-[#EAEEF5] shadow-[0_10px_40px_rgba(11,25,41,0.10)] overflow-hidden">
      {/* Step Nav */}
      <div className="flex border-b border-[#EAEEF5]">
        {STEPS.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setStep(i)}
            className={`flex-1 py-3 px-4 text-xs font-700 transition-all ${
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
        {/* STEP 0: Ticket Info */}
        {step === 0 && (
          <>
            <Section title="Ticket & Billing" eyebrow="Document Reference">
              <Field label="Ticket Number">
                <Input className={mx_input} placeholder="MX-S0005289" value={data.ticket_no || ''} onChange={e => set('ticket_no', e.target.value)} />
              </Field>
              <Field label="Order Date">
                <Input className={mx_input} type="date" value={data.order_date || ''} onChange={e => set('order_date', e.target.value)} />
              </Field>
              <Field label="Bill To — Name">
                <Input className={mx_input} placeholder="Metal X" value={data.bill_to_name || ''} onChange={e => set('bill_to_name', e.target.value)} />
              </Field>
              <Field label="Bill To — Address">
                <Input className={mx_input} placeholder="PO Box Z5150, St Georges Terrace 6000" value={data.bill_to_address || ''} onChange={e => set('bill_to_address', e.target.value)} />
              </Field>
              <Field label="Line Description">
                <Input className={mx_input} placeholder="Internal Weight Record" value={data.line_description || ''} onChange={e => set('line_description', e.target.value)} />
              </Field>
              <Field label="Payment Status">
                <Select value={data.payment_status || 'Paid on Account'} onValueChange={v => set('payment_status', v)}>
                  <SelectTrigger className={mx_input}><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['Paid on Account','Pending','Cash','Invoice'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
            </Section>
            <Section title="Load Details" eyebrow="Movement">
              <Field label="From Location">
                <Input className={mx_input} placeholder="METAL X" value={data.from_location || ''} onChange={e => set('from_location', e.target.value)} />
              </Field>
              <Field label="To Location">
                <Input className={mx_input} placeholder="WEST 2 WEST" value={data.to_location || ''} onChange={e => set('to_location', e.target.value)} />
              </Field>
              <Field label="Goods Weighed">
                <Input className={mx_input} placeholder="3401" value={data.goods_weighed || ''} onChange={e => set('goods_weighed', e.target.value)} />
              </Field>
              <Field label="Marks & Brands">
                <Input className={mx_input} value={data.marks_brands || ''} onChange={e => set('marks_brands', e.target.value)} />
              </Field>
              <Field label="Vehicle Rego">
                <Input className={mx_input} placeholder="1ISD240" value={data.rego || ''} onChange={e => set('rego', e.target.value)} />
              </Field>
            </Section>
            <Section title="Personnel" eyebrow="Signatories">
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
          <Section title="Weight Readings" eyebrow="Weighbridge Data">
            <Field label="Gross (Tonnes)">
              <Input className={mx_input} type="number" step="0.01" placeholder="7.62" value={data.gross_tonnes || ''} onChange={e => handleGrossChange(e.target.value)} />
            </Field>
            <Field label="Gross Date/Time">
              <Input className={mx_input} placeholder="22/04/2026 11:42 AM" value={data.gross_datetime || ''} onChange={e => set('gross_datetime', e.target.value)} />
            </Field>
            <Field label="Tare (Tonnes)">
              <Input className={mx_input} type="number" step="0.01" placeholder="6.24" value={data.tare_tonnes || ''} onChange={e => handleTareChange(e.target.value)} />
            </Field>
            <Field label="Tare Date/Time">
              <Input className={mx_input} placeholder="22/04/2026 11:51 AM" value={data.tare_datetime || ''} onChange={e => set('tare_datetime', e.target.value)} />
            </Field>
            <Field label="Net (Tonnes) — Auto-calculated">
              <Input className={mx_input + ' bg-[#F4F7FC]'} type="number" step="0.01" placeholder="1.38" value={data.net_tonnes || ''} onChange={e => set('net_tonnes', e.target.value)} />
            </Field>
            <Field label="Net Date/Time">
              <Input className={mx_input} placeholder="22/04/2026 11:52 AM" value={data.net_datetime || ''} onChange={e => set('net_datetime', e.target.value)} />
            </Field>
          </Section>
        )}

        {/* STEP 2: Grading Docket */}
        {step === 2 && (
          <>
            <Section title="Docket Reference" eyebrow="Material Grading Docket">
              <Field label="Docket Number">
                <Input className={mx_input} placeholder="3401" value={data.docket_no || ''} onChange={e => set('docket_no', e.target.value)} />
              </Field>
              <Field label="Docket Date">
                <Input className={mx_input} type="date" value={data.docket_date || ''} onChange={e => set('docket_date', e.target.value)} />
              </Field>
              <Field label="Customer Name">
                <Input className={mx_input} placeholder="Metal X" value={data.customer_name || ''} onChange={e => set('customer_name', e.target.value)} />
              </Field>
              <Field label="Site Address">
                <Input className={mx_input} placeholder="West 2 West" value={data.site_address || ''} onChange={e => set('site_address', e.target.value)} />
              </Field>
            </Section>
            <Section title="Transaction Type" eyebrow="Collection Mode">
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
            <Section title="Material Details" eyebrow="Grading">
              <Field label="Material Grade" full>
                <Input className={mx_input} placeholder="HMS O/S Blue" value={data.material_grade || ''} onChange={e => set('material_grade', e.target.value)} />
              </Field>
              <Field label="Product Description" full>
                <Input className={mx_input} placeholder="HMS O/S Blue less 50kg rubbish" value={data.product_description || ''} onChange={e => set('product_description', e.target.value)} />
              </Field>
              <Field label="Contamination / Deductions" full>
                <Textarea className={mx_input + ' resize-none'} rows={2} value={data.contamination_notes || ''} onChange={e => set('contamination_notes', e.target.value)} />
              </Field>
              <Field label="Comments" full>
                <Textarea className={mx_input + ' resize-none'} rows={2} value={data.comments || ''} onChange={e => set('comments', e.target.value)} />
              </Field>
            </Section>
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