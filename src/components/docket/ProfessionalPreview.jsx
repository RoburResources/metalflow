import { Printer } from "lucide-react";

const LOGO_URL = "https://media.base44.com/images/public/69f7b7e128899b8db1200527/c72ebbf3f_MetalXLogo.png";
const fmt = (v, fallback = "—") => v || fallback;
const fmtNum = (v, decimals = 2) => v ? parseFloat(v).toFixed(decimals) : "—";

const PRINT_STYLES = `
@media print {
  body * { visibility: hidden !important; }
  #mx-print-zone, #mx-print-zone * { visibility: visible !important; }
  #mx-print-zone {
    position: fixed !important;
    inset: 0 !important;
    width: 210mm !important;
    height: 297mm !important;
    margin: 0 !important;
    padding: 0 !important;
    overflow: hidden !important;
    background: #fff !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  @page { size: A4 portrait; margin: 0; }
}
`;

const BLUE = '#1E4D99';
const BORDER = '#e2e8f0';
const MUTED = '#64748b';
const LABEL_COLOR = '#1E4D99';

const SectionLabel = ({ children, light = false }) => (
  <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: light ? '#93C5FD' : LABEL_COLOR, marginBottom: 5 }}>
    {children}
  </div>
);

const Checkbox = ({ checked, label, light = false }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
    <div style={{
      width: 13, height: 13, border: `1.5px solid ${checked ? (light ? '#93C5FD' : BLUE) : '#cbd5e1'}`,
      borderRadius: 2, background: checked ? (light ? '#3B82F6' : BLUE) : 'rgba(255,255,255,0.3)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 9, color: '#fff', fontWeight: 900, flexShrink: 0
    }}>{checked ? '✓' : ''}</div>
    <span style={{ fontSize: 10, color: checked ? (light ? '#DBEAFE' : BLUE) : MUTED, fontWeight: checked ? 700 : 400 }}>{label}</span>
  </div>
);

export default function ProfessionalPreview({ data = {} }) {
  const handlePrint = () => {
    const style = document.createElement('style');
    style.innerHTML = PRINT_STYLES;
    document.head.appendChild(style);
    window.print();
    setTimeout(() => document.head.removeChild(style), 1000);
  };

  return (
    <div>
      {/* Print Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }} className="no-print">
        <button
          onClick={handlePrint}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 16px', borderRadius: 8, border: '1px solid #BFDBFE',
            background: '#EFF6FF', color: '#1E4D99', fontWeight: 700, fontSize: 13,
            cursor: 'pointer', fontFamily: 'Inter, sans-serif',
          }}
        >
          <Printer size={16} /> Print / Save as PDF
        </button>
      </div>

    <div id="mx-print-zone" style={{
      width: '210mm', height: '297mm', margin: '0 auto',
      background: '#f8fafc', fontFamily: 'Inter, Helvetica, Arial, sans-serif',
      fontSize: 10, lineHeight: 1.3, color: '#0D1A2E',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>

      {/* ══════════════════════════════════════════
          TOP HALF — DIRECT MEASUREMENT TICKET (WHITE)
      ══════════════════════════════════════════ */}
      <div style={{ background: '#fff', flex: '0 0 auto', borderBottom: '2px solid #e2e8f0' }}>

        {/* Header */}
        <div style={{ padding: '14px 28px 12px', borderBottom: `1px solid ${BORDER}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <img src={LOGO_URL} alt="Metal X" style={{ height: 44, objectFit: 'contain', marginBottom: 3 }} />
            <div style={{ fontSize: 9, color: MUTED }}>Renewables Pty Ltd · ABN 90 687 484 975</div>
            <div style={{ marginTop: 5, display: 'inline-block', border: `1px solid ${BLUE}`, borderRadius: 3, padding: '2px 8px', fontSize: 8, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: BLUE }}>
              DIRECT MEASUREMENT TICKET
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 9, color: MUTED, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 2 }}>Ticket Reference</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: BLUE, letterSpacing: 1 }}>{fmt(data.ticket_no, 'MX-XXXXXXX')}</div>
            <div style={{ fontSize: 10, color: MUTED, marginTop: 2 }}>{fmt(data.order_date)}</div>
          </div>
        </div>

        <div style={{ padding: '10px 28px 14px' }}>
          {/* Issued By / Bill To */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 10 }}>
            {[
              { label: 'Issued By', lines: ['Metal X Renewables Pty Ltd', 'PO Box Z5150, St Georges Terrace 6000', 'Perth, Western Australia'] },
              { label: 'Bill To', lines: [fmt(data.bill_to_name), fmt(data.bill_to_address), `Payment: ${fmt(data.payment_status)}`] },
            ].map(({ label, lines }) => (
              <div key={label} style={{ border: `1px solid ${BORDER}`, borderRadius: 6, padding: '8px 12px', background: '#FAFBFD' }}>
                <SectionLabel>{label}</SectionLabel>
                <div style={{ fontWeight: 700, fontSize: 11, marginBottom: 2 }}>{lines[0]}</div>
                {lines.slice(1).map((l, i) => <div key={i} style={{ color: MUTED, fontSize: 10 }}>{l}</div>)}
              </div>
            ))}
          </div>

          {/* Movement + Weights side by side */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 12, marginBottom: 10 }}>
            {/* Movement */}
            <div style={{ border: `1px solid ${BORDER}`, borderRadius: 6, padding: '8px 12px', background: '#FAFBFD' }}>
              <SectionLabel>Movement Details</SectionLabel>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
                {[
                  ['From', data.from_location], ['To', data.to_location],
                  ['Goods / Ref', data.goods_weighed], ['Rego', data.rego],
                  ['Driver', data.driver_name], ['Weigh Person', data.weigh_person_name],
                ].map(([l, v]) => (
                  <div key={l} style={{ padding: '4px 8px 4px 0', borderBottom: `1px solid ${BORDER}` }}>
                    <div style={{ fontSize: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: MUTED }}>{l}</div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#0D1A2E' }}>{fmt(v)}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Weights */}
            <div style={{ border: `1px solid ${BORDER}`, borderRadius: 6, padding: '8px 12px', background: '#FAFBFD' }}>
              <SectionLabel>Weight Readings</SectionLabel>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                    {['', 'Tonnes', 'Date / Time'].map((h, i) => (
                      <th key={i} style={{ padding: '3px 6px', textAlign: i === 1 ? 'center' : 'left', fontSize: 8, fontWeight: 700, textTransform: 'uppercase', color: MUTED }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Gross', data.gross_tonnes, data.gross_datetime],
                    ['Tare', data.tare_tonnes, data.tare_datetime],
                    ['Front Axle', '', ''],
                    ['Rear Axle', '', ''],
                    ['Net', data.net_tonnes, data.net_datetime],
                  ].map(([label, t, dt]) => (
                    <tr key={label} style={{ borderBottom: `1px solid ${BORDER}`, background: label === 'Net' ? '#EFF6FF' : 'transparent' }}>
                      <td style={{ padding: '4px 6px', fontWeight: label === 'Net' ? 900 : 500, color: label === 'Net' ? BLUE : '#0D1A2E' }}>{label}</td>
                      <td style={{ padding: '4px 6px', textAlign: 'center', fontWeight: 900, color: label === 'Net' ? BLUE : '#0D1A2E', fontSize: label === 'Net' ? 12 : 10 }}>{t ? fmtNum(t) : ''}</td>
                      <td style={{ padding: '4px 6px', color: MUTED, fontSize: 9 }}>{dt || ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Billing line items */}
          <div style={{ border: `1px solid ${BORDER}`, borderRadius: 6, padding: '8px 12px', background: '#FAFBFD', marginBottom: 10 }}>
            <SectionLabel>Billing Line Items</SectionLabel>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                  {['Description', 'Qty', 'UOM', 'Unit Price', 'Ext Price'].map((h, i) => (
                    <th key={h} style={{ padding: '3px 8px', textAlign: i >= 3 ? 'right' : i === 1 ? 'center' : 'left', fontSize: 8, fontWeight: 700, textTransform: 'uppercase', color: MUTED }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '5px 8px' }}>{fmt(data.line_description, 'Internal Weight Record')}</td>
                  <td style={{ padding: '5px 8px', textAlign: 'center' }}>{fmtNum(data.qty, 0)}</td>
                  <td style={{ padding: '5px 8px' }}>{fmt(data.uom, 'Each')}</td>
                  <td style={{ padding: '5px 8px', textAlign: 'right' }}>${fmtNum(data.unit_price)}</td>
                  <td style={{ padding: '5px 8px', textAlign: 'right' }}>${fmtNum(data.ext_price)}</td>
                </tr>
              </tbody>
            </table>
            <div style={{ marginTop: 6, background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 4, padding: '6px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: 11, color: BLUE }}>Total Price</span>
              <span style={{ fontWeight: 900, fontSize: 14, color: BLUE }}>${fmtNum(data.total_price)}</span>
            </div>
          </div>

          {/* Signatures */}
          {(data.driver_signature || data.weigh_person_signature || data.driver_name || data.weigh_person_name) && (
            <div style={{ border: `1px solid ${BORDER}`, borderRadius: 6, padding: '8px 12px', background: '#FAFBFD' }}>
              <SectionLabel>Signatures</SectionLabel>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {[['Driver', data.driver_name, data.driver_signature], ['Weigh Person', data.weigh_person_name, data.weigh_person_signature]].map(([role, name, sig]) => (
                  <div key={role}>
                    <div style={{ fontSize: 8, fontWeight: 700, textTransform: 'uppercase', color: MUTED, marginBottom: 3 }}>{role}: <strong style={{ color: '#0D1A2E' }}>{name || '—'}</strong></div>
                    <div style={{ height: 36, borderBottom: `1px solid #0D1A2E`, overflow: 'hidden' }}>
                      {sig && <img src={sig} alt="sig" style={{ height: 34, objectFit: 'contain', objectPosition: 'left center' }} />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CUT LINE */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 28px', background: '#f8fafc', color: MUTED, fontSize: 8, letterSpacing: '1.5px', fontWeight: 700, textTransform: 'uppercase', flexShrink: 0 }}>
        <div style={{ flex: 1, borderTop: '1.5px dashed #cbd5e1' }} />
        CUT LINE — MATERIAL GRADING DOCKET BELOW
        <div style={{ flex: 1, borderTop: '1.5px dashed #cbd5e1' }} />
      </div>

      {/* ══════════════════════════════════════════
          BOTTOM HALF — MATERIAL GRADING DOCKET (BLUE)
      ══════════════════════════════════════════ */}
      <div style={{ background: '#1E4D99', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Grading Header */}
        <div style={{ padding: '10px 28px', borderBottom: '1px solid rgba(255,255,255,0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#163D80' }}>
          <div>
            <img src={LOGO_URL} alt="Metal X" style={{ height: 40, objectFit: 'contain', marginBottom: 2, filter: 'brightness(0) invert(1)' }} />
            <div style={{ fontSize: 8, color: '#93C5FD', textTransform: 'uppercase', letterSpacing: '1px' }}>Material Grading Docket</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 8, color: '#93C5FD', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 2 }}>Docket No.</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#fff', letterSpacing: 1 }}>{fmt(data.docket_no)}</div>
            <div style={{ fontSize: 9, color: '#93C5FD', marginTop: 1 }}>{fmt(data.docket_date)}</div>
          </div>
        </div>

        <div style={{ padding: '10px 28px 12px', flex: 1 }}>
          {/* Customer + Collection Mode + Payment */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 10 }}>
            <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 6, padding: '8px 12px', border: '1px solid rgba(255,255,255,0.15)' }}>
              <SectionLabel light>Customer</SectionLabel>
              <div style={{ fontWeight: 700, fontSize: 12, color: '#fff' }}>{fmt(data.customer_name)}</div>
              <div style={{ color: '#93C5FD', fontSize: 10, marginTop: 2 }}>{fmt(data.site_address)}</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 6, padding: '8px 12px', border: '1px solid rgba(255,255,255,0.15)' }}>
              <SectionLabel light>Collection Mode</SectionLabel>
              <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                <Checkbox checked={!!data.pickup} label="Pickup" light />
                <Checkbox checked={!!data.swap} label="Swap" light />
                <Checkbox checked={data.deliver !== false} label="Deliver" light />
              </div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 6, padding: '8px 12px', border: '1px solid rgba(255,255,255,0.15)' }}>
              <SectionLabel light>Payment</SectionLabel>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
                <span style={{ fontSize: 10, color: '#93C5FD' }}>Cash</span>
                <span style={{ fontSize: 10, fontWeight: 600, color: '#fff' }}>{fmt(data.cash_payment)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
                <span style={{ fontSize: 10, color: '#93C5FD' }}>Amount</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#fff' }}>{data.amount ? `$${fmtNum(data.amount)}` : '—'}</span>
              </div>
            </div>
          </div>

          {/* Weights + Material Grade */}
          <div style={{ display: 'grid', gridTemplateColumns: '0.6fr 1.4fr', gap: 12, marginBottom: 10 }}>
            <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 6, padding: '8px 12px', border: '1px solid rgba(255,255,255,0.15)' }}>
              <SectionLabel light>Weights</SectionLabel>
              {[['Gross', data.gross_tonnes], ['Tare', data.tare_tonnes], ['Net', data.net_tonnes]].map(([l, v]) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderBottom: l !== 'Net' ? '1px solid rgba(255,255,255,0.12)' : 'none' }}>
                  <span style={{ fontSize: 10, color: '#93C5FD' }}>{l}</span>
                  <span style={{ fontSize: 10, fontWeight: l === 'Net' ? 900 : 600, color: '#fff' }}>{v ? fmtNum(v) + 't' : '—'}</span>
                </div>
              ))}
            </div>
            <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 6, padding: '8px 12px', border: '1px solid rgba(255,255,255,0.15)' }}>
              <SectionLabel light>Material Grade / Product Description</SectionLabel>
              {data.material_grades?.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 4 }}>
                  {data.material_grades.map((g, i) => (
                    <span key={i} style={{ padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700, background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)' }}>
                      {g.grade}{data.material_grades.length > 1 ? ` (${g.percentage || 0}%)` : ''}
                      {g.grade === 'Rubbish / Contamination' && g.rubbish_value ? ` ${g.rubbish_value}${g.rubbish_unit === 'kg' ? 'kg' : '%'}` : ''}
                    </span>
                  ))}
                </div>
              ) : (
                <div style={{ fontWeight: 700, fontSize: 11, color: '#fff', marginTop: 4 }}>{[data.material_grade, data.product_description].filter(Boolean).join(' ') || '—'}</div>
              )}
            </div>
          </div>

          {/* Notes + Driver Signature side by side */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 6, padding: '8px 12px', border: '1px solid rgba(255,255,255,0.15)' }}>
              <SectionLabel light>Contamination / Comments</SectionLabel>
              <div style={{ fontSize: 10, color: '#DBEAFE', minHeight: 30 }}>{[data.contamination_notes, data.comments].filter(Boolean).join(' ') || '—'}</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 6, padding: '8px 12px', border: '1px solid rgba(255,255,255,0.15)' }}>
              <SectionLabel light>Driver Signature</SectionLabel>
              <div style={{ height: 40, borderBottom: '1px solid rgba(255,255,255,0.4)', overflow: 'hidden' }}>
                {data.driver_signature && <img src={data.driver_signature} alt="sig" style={{ height: 38, objectFit: 'contain', objectPosition: 'left center' }} />}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)', padding: '6px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#163D80' }}>
          <span style={{ fontSize: 9, color: '#93C5FD', fontStyle: 'italic' }}>Shaping a Sustainable Future</span>
          <span style={{ fontSize: 9, color: '#93C5FD' }}>Metal X · ABN 90 687 484 975 · {fmt(data.ticket_no)}</span>
        </div>
      </div>

    </div>
    </div>
  );
}