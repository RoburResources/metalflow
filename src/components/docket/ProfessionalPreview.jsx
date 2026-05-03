const LOGO_URL = "https://media.base44.com/images/public/69f7b7e128899b8db1200527/c72ebbf3f_MetalXLogo.png";
const fmt = (v, fallback = "—") => v || fallback;
const fmtNum = (v, decimals = 2) => v ? parseFloat(v).toFixed(decimals) : "—";

const NAVY = '#0B1929';
const BLUE = '#1E4D99';
const LIGHT_BLUE = '#5BA3F5';
const BORDER = '#e2e8f0';
const MUTED = '#64748b';
const LABEL_COLOR = '#1E4D99';

const Card = ({ children, style = {} }) => (
  <div style={{ border: `1px solid ${BORDER}`, borderRadius: 8, padding: '16px 20px', marginBottom: 16, background: '#fff', ...style }}>
    {children}
  </div>
);

const SectionLabel = ({ children }) => (
  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: LABEL_COLOR, marginBottom: 8 }}>
    {children}
  </div>
);

const Row = ({ label, value, bold = false }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '7px 0', borderBottom: `1px solid ${BORDER}` }}>
    <span style={{ fontSize: 11, color: MUTED }}>{label}</span>
    <span style={{ fontSize: 11, fontWeight: bold ? 700 : 500, color: '#0D1A2E' }}>{value}</span>
  </div>
);

const Checkbox = ({ checked, label }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
    <div style={{
      width: 16, height: 16, border: `1.5px solid ${checked ? BLUE : '#cbd5e1'}`,
      borderRadius: 3, background: checked ? BLUE : '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 10, color: '#fff', fontWeight: 900, flexShrink: 0
    }}>{checked ? '✓' : ''}</div>
    <span style={{ fontSize: 11, color: checked ? BLUE : MUTED, fontWeight: checked ? 700 : 400 }}>{label}</span>
  </div>
);

export default function ProfessionalPreview({ data = {} }) {
  return (
    <div style={{
      width: '210mm', minHeight: '297mm', margin: '0 auto',
      background: '#f8fafc', fontFamily: 'Inter, Helvetica, Arial, sans-serif',
      fontSize: 11, lineHeight: 1.4, color: '#0D1A2E',
    }}>

      {/* ── HEADER ── */}
      <div style={{ background: '#fff', borderBottom: `1px solid ${BORDER}`, padding: '24px 32px 20px', marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <img src={LOGO_URL} alt="Metal X" style={{ height: 36, objectFit: 'contain', marginBottom: 6 }} />
            <div style={{ fontSize: 10, color: MUTED, marginTop: 2 }}>Renewables Pty Ltd</div>
            <div style={{ fontSize: 10, color: MUTED, marginTop: 1 }}>Shaping a Sustainable Future</div>
            <div style={{ marginTop: 12, display: 'inline-block', border: `1px solid ${BORDER}`, borderRadius: 4, padding: '3px 10px', fontSize: 9, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: MUTED }}>
              DIRECT MEASUREMENT TICKET
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 10, color: MUTED, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 4 }}>Ticket Reference</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: BLUE, letterSpacing: 1 }}>{fmt(data.ticket_no, 'MX-XXXXXXX')}</div>
            <div style={{ fontSize: 11, color: MUTED, marginTop: 4 }}>{fmt(data.order_date)}</div>
          </div>
        </div>
      </div>

      <div style={{ padding: '0 32px 32px' }}>

        {/* ── ISSUED BY / BILL TO ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <Card>
            <SectionLabel>Issued By</SectionLabel>
            <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 4 }}>Metal X Renewables Pty Ltd</div>
            <div style={{ color: MUTED, fontSize: 11 }}>ABN 90 687 484 975</div>
            <div style={{ color: MUTED, fontSize: 11 }}>PO Box Z5150, St Georges Terrace 6000</div>
            <div style={{ color: MUTED, fontSize: 11 }}>Perth, Western Australia</div>
          </Card>
          <Card>
            <SectionLabel>Bill To</SectionLabel>
            <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 4 }}>{fmt(data.bill_to_name)}</div>
            <div style={{ color: MUTED, fontSize: 11 }}>{fmt(data.bill_to_address)}</div>
            <div style={{ color: MUTED, fontSize: 11, marginTop: 6 }}>Payment: <strong style={{ color: '#0D1A2E' }}>{fmt(data.payment_status)}</strong></div>
          </Card>
        </div>

        {/* ── MOVEMENT ── */}
        <Card>
          <SectionLabel>Movement Details</SectionLabel>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
            {[
              ['From Location', data.from_location],
              ['To Location', data.to_location],
              ['Goods Weighed / Ref', data.goods_weighed],
              ['Vehicle Rego', data.rego],
              ['Driver', data.driver_name],
              ['Weigh Person', data.weigh_person_name],
            ].map(([l, v]) => (
              <div key={l} style={{ display: 'flex', flexDirection: 'column', padding: '8px 12px 8px 0', borderBottom: `1px solid ${BORDER}` }}>
                <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: MUTED, marginBottom: 2 }}>{l}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#0D1A2E' }}>{fmt(v)}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* ── WEIGHTS ── */}
        <Card>
          <SectionLabel>Weight Readings</SectionLabel>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${BORDER}` }}>
                {['', 'Tonnes', 'Date / Time'].map((h, i) => (
                  <th key={i} style={{ padding: '6px 10px', textAlign: i === 1 ? 'center' : 'left', fontSize: 10, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: MUTED }}>{h}</th>
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
                <tr key={label} style={{ borderBottom: `1px solid ${BORDER}`, background: label === 'Net' ? '#eff6ff' : 'transparent' }}>
                  <td style={{ padding: '8px 10px', fontWeight: label === 'Net' ? 900 : 500, color: label === 'Net' ? BLUE : '#0D1A2E' }}>{label}</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', fontWeight: 900, color: label === 'Net' ? BLUE : '#0D1A2E', fontSize: label === 'Net' ? 14 : 11 }}>{t ? fmtNum(t) : ''}</td>
                  <td style={{ padding: '8px 10px', color: MUTED }}>{dt || ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        {/* ── LINE ITEMS ── */}
        <Card>
          <SectionLabel>Billing Line Items</SectionLabel>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${BORDER}` }}>
                {['Description', 'Qty', 'UOM', 'Unit Price', 'Ext Price'].map((h, i) => (
                  <th key={h} style={{ padding: '6px 10px', textAlign: i >= 3 ? 'right' : i === 1 ? 'center' : 'left', fontSize: 10, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: MUTED }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                <td style={{ padding: '8px 10px' }}>{fmt(data.line_description, 'Internal Weight Record')}</td>
                <td style={{ padding: '8px 10px', textAlign: 'center' }}>{fmtNum(data.qty, 0)}</td>
                <td style={{ padding: '8px 10px' }}>{fmt(data.uom, 'Each')}</td>
                <td style={{ padding: '8px 10px', textAlign: 'right' }}>${fmtNum(data.unit_price)}</td>
                <td style={{ padding: '8px 10px', textAlign: 'right' }}>${fmtNum(data.ext_price)}</td>
              </tr>
            </tbody>
          </table>
          {/* Total bar */}
          <div style={{ marginTop: 10, background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 6, padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, fontSize: 12, color: BLUE }}>Total Price</span>
            <span style={{ fontWeight: 900, fontSize: 16, color: BLUE }}>${fmtNum(data.total_price)}</span>
          </div>
        </Card>

        {/* ── SIGNATURES ── */}
        {(data.driver_signature || data.weigh_person_signature || data.driver_name || data.weigh_person_name) && (
          <Card>
            <SectionLabel>Signatures</SectionLabel>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              {[['Driver', data.driver_name, data.driver_signature], ['Weigh Person', data.weigh_person_name, data.weigh_person_signature]].map(([role, name, sig]) => (
                <div key={role}>
                  <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: MUTED, marginBottom: 6 }}>{role}</div>
                  <div style={{ fontWeight: 700, marginBottom: 8, fontSize: 12 }}>{name || '—'}</div>
                  <div style={{ height: 50, borderBottom: `1px solid #0D1A2E`, overflow: 'hidden' }}>
                    {sig && <img src={sig} alt="sig" style={{ height: 48, objectFit: 'contain', objectPosition: 'left center' }} />}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* ── PHOTOS ── */}
        {data.photo_urls && data.photo_urls.length > 0 && (
          <Card>
            <SectionLabel>Evidence Photos</SectionLabel>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {data.photo_urls.slice(0, 8).map((url, i) => (
                <img key={i} src={url} alt={`Photo ${i+1}`} style={{ width: '100%', height: 64, objectFit: 'cover', borderRadius: 6, border: `1px solid ${BORDER}` }} />
              ))}
            </div>
          </Card>
        )}

        {/* ── CUT LINE ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0', color: MUTED, fontSize: 9, letterSpacing: '1.5px', fontWeight: 700, textTransform: 'uppercase' }}>
          <div style={{ flex: 1, borderTop: '1.5px dashed #cbd5e1' }} />
          CUT LINE — MATERIAL GRADING DOCKET BELOW
          <div style={{ flex: 1, borderTop: '1.5px dashed #cbd5e1' }} />
        </div>

        {/* ── GRADING DOCKET ── */}
        <div style={{ border: `1px solid ${BORDER}`, borderRadius: 10, overflow: 'hidden', background: '#fff' }}>
          {/* Grading Header */}
          <div style={{ background: '#fff', borderBottom: `1px solid ${BORDER}`, padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <img src={LOGO_URL} alt="Metal X" style={{ height: 28, objectFit: 'contain', marginBottom: 4 }} />
              <div style={{ fontSize: 9, color: MUTED, textTransform: 'uppercase', letterSpacing: '1px' }}>Material Grading Docket</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 9, color: MUTED, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 4 }}>Docket No.</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: '#0D1A2E', letterSpacing: 1 }}>{fmt(data.docket_no)}</div>
              <div style={{ fontSize: 10, color: MUTED, marginTop: 2 }}>{fmt(data.docket_date)}</div>
            </div>
          </div>

          <div style={{ padding: '20px 24px' }}>
            {/* Customer + Collection Mode */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: LABEL_COLOR, marginBottom: 6 }}>Customer</div>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{fmt(data.customer_name)}</div>
                <div style={{ color: MUTED, fontSize: 11, marginTop: 2 }}>{fmt(data.site_address)}</div>
              </div>
              <div>
                <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: LABEL_COLOR, marginBottom: 10 }}>Collection Mode</div>
                <div style={{ display: 'flex', gap: 16 }}>
                  <Checkbox checked={!!data.pickup} label="Pickup" />
                  <Checkbox checked={!!data.swap} label="Swap" />
                  <Checkbox checked={data.deliver !== false} label="Deliver" />
                </div>
              </div>
            </div>

            {/* Weights + Payment */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div style={{ border: `1px solid ${BORDER}`, borderRadius: 6, padding: '12px 16px' }}>
                <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: LABEL_COLOR, marginBottom: 8 }}>Weights</div>
                {[['Gross', data.gross_tonnes], ['Tare', data.tare_tonnes], ['Net', data.net_tonnes]].map(([l, v]) => (
                  <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: l !== 'Net' ? `1px solid ${BORDER}` : 'none' }}>
                    <span style={{ fontSize: 11, color: MUTED }}>{l}</span>
                    <span style={{ fontSize: 11, fontWeight: l === 'Net' ? 900 : 600, color: l === 'Net' ? BLUE : '#0D1A2E' }}>{v ? fmtNum(v) + 't' : '—'}</span>
                  </div>
                ))}
              </div>
              <div style={{ border: `1px solid ${BORDER}`, borderRadius: 6, padding: '12px 16px' }}>
                <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: LABEL_COLOR, marginBottom: 8 }}>Payment</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: `1px solid ${BORDER}` }}>
                  <span style={{ fontSize: 11, color: MUTED }}>Cash Payment</span>
                  <span style={{ fontSize: 11, fontWeight: 600 }}>{fmt(data.cash_payment)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                  <span style={{ fontSize: 11, color: MUTED }}>Amount</span>
                  <span style={{ fontSize: 11, fontWeight: 700 }}>{data.amount ? `$${fmtNum(data.amount)}` : '—'}</span>
                </div>
              </div>
            </div>

            {/* Material Grade */}
            <div style={{ border: `1px solid ${BORDER}`, borderRadius: 6, padding: '12px 16px', marginBottom: 16 }}>
              <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: LABEL_COLOR, marginBottom: 8 }}>Material Grade / Product Description</div>
              {data.material_grades?.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {data.material_grades.map((g, i) => (
                    <span key={i} style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: '#eff6ff', color: BLUE, border: `1px solid #bfdbfe` }}>
                      {g.grade}{data.material_grades.length > 1 ? ` (${g.percentage || 0}%)` : ''}
                      {g.grade === 'Rubbish / Contamination' && g.rubbish_value ? ` ${g.rubbish_value}${g.rubbish_unit === 'kg' ? 'kg' : '%'}` : ''}
                    </span>
                  ))}
                </div>
              ) : (
                <div style={{ fontWeight: 700, fontSize: 12 }}>{[data.material_grade, data.product_description].filter(Boolean).join(' ') || '—'}</div>
              )}
            </div>

            {/* Notes */}
            {(data.contamination_notes || data.comments) && (
              <div style={{ border: `1px solid ${BORDER}`, borderRadius: 6, padding: '12px 16px', marginBottom: 16 }}>
                <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: LABEL_COLOR, marginBottom: 6 }}>Contamination / Deductions / Comments</div>
                <div style={{ fontSize: 11, color: MUTED }}>{[data.contamination_notes, data.comments].filter(Boolean).join(' ')}</div>
              </div>
            )}

            {/* Driver Signature */}
            <div style={{ border: `1px solid ${BORDER}`, borderRadius: 6, padding: '12px 16px' }}>
              <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: LABEL_COLOR, marginBottom: 6 }}>Driver Signature</div>
              <div style={{ height: 50, borderBottom: `1px solid #0D1A2E` }}>
                {data.driver_signature && <img src={data.driver_signature} alt="sig" style={{ height: 48, objectFit: 'contain', objectPosition: 'left center' }} />}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{ borderTop: `1px solid ${BORDER}`, padding: '10px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
            <span style={{ fontSize: 10, color: MUTED, fontStyle: 'italic' }}>Shaping a Sustainable Future</span>
            <span style={{ fontSize: 10, color: MUTED }}>Metal X · ABN 90 687 484 975 · {fmt(data.ticket_no)}</span>
          </div>
        </div>

      </div>
    </div>
  );
}