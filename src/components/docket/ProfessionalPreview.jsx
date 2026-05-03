const LOGO_URL = "https://media.base44.com/images/public/69f7b7e128899b8db1200527/c72ebbf3f_MetalXLogo.png";
const fmt = (v, fallback = "—") => v || fallback;
const fmtNum = (v, decimals = 2) => v ? parseFloat(v).toFixed(decimals) : "—";
const Checkbox = ({ checked }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    width: 16, height: 16, border: '1.2px solid #2a2a2a', background: '#fff',
    fontSize: 11, fontWeight: 900
  }}>{checked ? '✓' : ''}</span>
);

export default function ProfessionalPreview({ data = {} }) {
  return (
    <div style={{
      width: '210mm', minHeight: '297mm', margin: '0 auto',
      background: '#fff', fontFamily: 'Inter, Helvetica, Arial, sans-serif',
      fontSize: 11, lineHeight: 1.3, color: '#0D1A2E',
      boxShadow: '0 8px 32px rgba(0,0,0,0.14)', padding: '13mm 14mm'
    }}>
      <div style={{ padding: '0', minHeight: 'calc(297mm - 26mm)' }}>

        {/* Header */}
        <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 190px', gap: 18, alignItems: 'start', marginBottom: 16 }}>
          <div style={{ border: '1.2px solid #1a1a1a', padding: '8px 10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src={LOGO_URL} alt="Metal X" style={{ width: 80, height: 52, objectFit: 'contain' }} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 13 }}>Metal X Renewables Pty Ltd</div>
            <div style={{ color: '#7A8898', fontSize: 11 }}>ABN 90 687 484 975</div>
            <div style={{ color: '#7A8898', fontSize: 11 }}>PO Box Z5150</div>
            <div style={{ color: '#7A8898', fontSize: 11 }}>St Georges Terrace 6000</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 800, fontSize: 17 }}>Weigh Bridge</div>
            <div style={{ fontSize: 12, marginTop: 3 }}>Ticket: <strong>{fmt(data.ticket_no)}</strong></div>
          </div>
        </div>

        {/* Title */}
        <h1 style={{ fontSize: 22, fontWeight: 900, letterSpacing: 4, marginBottom: 18 }}>DIRECT MEASUREMENT TICKET</h1>

        {/* Bill To / Details */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 14 }}>
          <div>
            <div style={{ fontWeight: 900, fontSize: 10, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 3, color: '#AAB0C4' }}>Bill To:</div>
            <div style={{ fontWeight: 900, fontSize: 12 }}>{fmt(data.bill_to_name)}</div>
            <div style={{ fontSize: 11, color: '#7A8898' }}>{fmt(data.bill_to_address)}</div>
          </div>
          <div>
            <div style={{ fontWeight: 900, fontSize: 10, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 3, color: '#AAB0C4' }}>Details:</div>
            <div style={{ fontSize: 11 }}><span style={{ color: '#7A8898' }}>Order Date:</span> <span style={{ marginLeft: 16, fontWeight: 700 }}>{fmt(data.order_date)}</span></div>
          </div>
        </div>

        {/* Line Items + Total */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px', gap: 0, marginBottom: 12 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
            <thead>
              <tr>
                {['Description','Qty','UOM','Unit Price','Ext Price'].map((h, i) => (
                  <th key={h} style={{ border: '1px solid #bfc3c8', padding: '6px 8px', background: '#f1f2f4', fontWeight: 900, textAlign: i >= 3 ? 'right' : i === 1 ? 'center' : 'left' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ border: '1px solid #bfc3c8', padding: '6px 8px' }}>{fmt(data.line_description, 'Internal Weight Record')}</td>
                <td style={{ border: '1px solid #bfc3c8', padding: '6px 8px', textAlign: 'center' }}>{fmtNum(data.qty, 2)}</td>
                <td style={{ border: '1px solid #bfc3c8', padding: '6px 8px' }}>{fmt(data.uom, 'Each')}</td>
                <td style={{ border: '1px solid #bfc3c8', padding: '6px 8px', textAlign: 'right' }}>${fmtNum(data.unit_price)}</td>
                <td style={{ border: '1px solid #bfc3c8', padding: '6px 8px', textAlign: 'right' }}>${fmtNum(data.ext_price)}</td>
              </tr>
            </tbody>
          </table>
          <table style={{ borderCollapse: 'collapse', fontSize: 11, width: '100%' }}>
            <tbody>
              <tr><td style={{ border: '1px solid #bfc3c8', padding: '6px 8px', fontWeight: 900 }}>Total Price</td><td style={{ border: '1px solid #bfc3c8', padding: '6px 8px', textAlign: 'right', fontWeight: 900 }}>${fmtNum(data.total_price)}</td></tr>
              <tr><td style={{ border: '1px solid #bfc3c8', padding: '6px 8px', fontWeight: 900 }}>Payment Status</td><td style={{ border: '1px solid #bfc3c8', padding: '6px 8px', textAlign: 'right', fontWeight: 700 }}>{fmt(data.payment_status)}</td></tr>
            </tbody>
          </table>
        </div>

        {/* Note */}
        <p style={{ borderTop: '1px solid #bfc3c8', borderBottom: '1px solid #bfc3c8', padding: '6px 0', fontSize: 10, color: '#7A8898', fontStyle: 'italic', marginBottom: 8 }}>
          Internal Metal X measurement record. Generated for collection, delivery, grading, and payment reconciliation purposes.
        </p>

        {/* Movement + Weights */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 330px', gap: 22, marginBottom: 16, alignItems: 'start' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', rowGap: 7, columnGap: 10, paddingTop: 4 }}>
            {[['From Location', data.from_location], ['To Location', data.to_location], ['Goods Weighed', data.goods_weighed], ['Rego#', data.rego]].map(([l, v]) => (
              <>
                <div key={l + 'l'} style={{ color: '#7A8898', fontSize: 11 }}>{l}</div>
                <div key={l + 'v'} style={{ fontWeight: 900, fontSize: 11, letterSpacing: 0.5 }}>{fmt(v)}</div>
              </>
            ))}
          </div>
          <table style={{ borderCollapse: 'collapse', fontSize: 11, width: '100%' }}>
            <thead>
              <tr>
                <th style={{ border: '1px solid #bfc3c8', padding: '6px 8px', background: '#f1f2f4', fontWeight: 900, textAlign: 'left' }}></th>
                <th style={{ border: '1px solid #bfc3c8', padding: '6px 8px', background: '#f1f2f4', fontWeight: 900, textAlign: 'center' }}>Tonnes</th>
                <th style={{ border: '1px solid #bfc3c8', padding: '6px 8px', background: '#f1f2f4', fontWeight: 900 }}>Date/Time</th>
              </tr>
            </thead>
            <tbody>
              {[['Gross', data.gross_tonnes, data.gross_datetime], ['Tare', data.tare_tonnes, data.tare_datetime], ['Front Axle', '', ''], ['Rear Axle', '', ''], ['Net', data.net_tonnes, data.net_datetime]].map(([label, t, dt]) => (
                <tr key={label}>
                  <td style={{ border: '1px solid #bfc3c8', padding: '6px 8px' }}>{label}</td>
                  <td style={{ border: '1px solid #bfc3c8', padding: '6px 8px', textAlign: 'center', fontWeight: 900 }}>{t ? fmtNum(t) : ''}</td>
                  <td style={{ border: '1px solid #bfc3c8', padding: '6px 8px' }}>{dt || ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Signatures */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22, marginBottom: 10 }}>
          {[['Driver Name', data.driver_name, data.driver_signature], ['Weigh Person Name', data.weigh_person_name, data.weigh_person_signature]].map(([l, name, sig]) => (
            <div key={l}>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 10, alignItems: 'end', color: '#7A8898', fontSize: 11, marginBottom: 4 }}>
                <span>{l}:</span>
                <span style={{ borderBottom: '1px solid #1a1a1a', height: 18, fontWeight: 900, color: '#0D1A2E', paddingLeft: 2 }}>{name || ''}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 10, alignItems: 'end', color: '#7A8898', fontSize: 11 }}>
                <span>Signature:</span>
                <div style={{ borderBottom: '1px solid #1a1a1a', height: 40, overflow: 'hidden' }}>
                  {sig && <img src={sig} alt="sig" style={{ height: 38, objectFit: 'contain', objectPosition: 'left center' }} />}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Photos */}
        {data.photo_urls && data.photo_urls.length > 0 && (
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontWeight: 900, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: '#AAB0C4', marginBottom: 6 }}>Evidence Photos</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
              {data.photo_urls.slice(0, 8).map((url, i) => (
                <img key={i} src={url} alt={`Photo ${i+1}`} style={{ width: '100%', height: 56, objectFit: 'cover', borderRadius: 4, border: '1px solid #bfc3c8' }} />
              ))}
            </div>
          </div>
        )}

        {/* Cut Line */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '10px 0', color: '#7A8898', fontSize: 9, letterSpacing: '1.5px', fontWeight: 900, textTransform: 'uppercase' }}>
          <div style={{ flex: 1, borderTop: '1.2px dashed #1a1a1a' }} />
          CUT LINE — MATERIAL GRADING DOCKET BELOW
          <div style={{ flex: 1, borderTop: '1.2px dashed #1a1a1a' }} />
        </div>

        {/* Grading Docket */}
        <div style={{ background: 'linear-gradient(180deg, #eaf3ff, #eef6ff)', border: '1.4px solid #afc8e8', padding: '9px 11px 8px' }}>
          {/* Grading Header */}
          <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr 180px', gap: 12, alignItems: 'start', paddingBottom: 9, borderBottom: '2px solid #1a1a1a', marginBottom: 9 }}>
            <div style={{ border: '1.2px solid #1a1a1a', padding: '4px 6px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
              <img src={LOGO_URL} alt="Metal X" style={{ width: 55, height: 36, objectFit: 'contain' }} />
            </div>
            <div>
              <div style={{ fontWeight: 900, fontSize: 16, letterSpacing: 2 }}>METAL X <span style={{ fontWeight: 500, color: '#7A8898' }}>RECYCLING</span></div>
              <div style={{ fontSize: 10, color: '#7A8898' }}><strong>ABN: 90 687 484 975</strong></div>
              <div style={{ fontSize: 10, color: '#7A8898' }}>PO Box Z5150, St Georges Terrace 6000</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ display: 'inline-block', border: '1.4px solid #1a1a1a', background: '#fff', padding: '5px 12px', fontWeight: 900, fontSize: 11, marginBottom: 6 }}>MATERIAL GRADING DOCKET</div>
              <div style={{ fontSize: 26, fontWeight: 900, color: '#1E4D99', letterSpacing: 2 }}>{fmt(data.docket_no)}</div>
            </div>
          </div>

          {/* Grading Grid */}
          <div style={{ border: '2px solid #1a1a1a', background: 'rgba(255,255,255,0.72)', display: 'grid', gridTemplateColumns: '52% 48%' }}>
            {/* Row 1 */}
            <div style={{ borderRight: '2px solid #1a1a1a', borderBottom: '2px solid #1a1a1a', display: 'grid', gridTemplateColumns: '1.1fr 0.5fr 0.5fr 0.55fr' }}>
              {[['Date', fmt(data.docket_date)], ['Pickup', null], ['Swap', null], ['Deliver', null]].map(([l, v], i) => (
                <div key={l} style={{ borderRight: i < 3 ? '2px solid #1a1a1a' : 'none', padding: '6px 8px', minHeight: 46 }}>
                  <div style={{ fontWeight: 900, fontSize: 10, marginBottom: 3 }}>{l}</div>
                  {l === 'Date' ? <div style={{ fontWeight: 700 }}>{v}</div> : (
                    <Checkbox checked={l === 'Pickup' ? data.pickup : l === 'Swap' ? data.swap : data.deliver !== false} />
                  )}
                </div>
              ))}
            </div>
            <div style={{ borderBottom: '2px solid #1a1a1a', padding: '6px 8px' }}>
              <div style={{ fontWeight: 900, fontSize: 10, marginBottom: 3 }}>Customer</div>
              <div style={{ fontWeight: 700 }}>{fmt(data.customer_name)}</div>
            </div>

            {/* Row 2 */}
            <div style={{ borderRight: '2px solid #1a1a1a', borderBottom: '2px solid #1a1a1a', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
              <div style={{ borderBottom: '2px solid #1a1a1a', padding: '6px 8px', gridColumn: '1 / span 2', fontWeight: 900, fontSize: 10 }}>Weights</div>
              <div style={{ borderRight: '2px solid #1a1a1a', borderBottom: '2px solid #1a1a1a', padding: '6px 8px' }}>
                <div style={{ fontWeight: 900, fontSize: 10, marginBottom: 2 }}>Gross</div>
                <div style={{ fontWeight: 700 }}>{data.gross_tonnes ? fmtNum(data.gross_tonnes) : ''}</div>
              </div>
              <div style={{ borderBottom: '2px solid #1a1a1a', padding: '6px 8px' }}>
                <div style={{ fontWeight: 900, fontSize: 10, marginBottom: 2 }}>Tare</div>
                <div style={{ fontWeight: 700 }}>{data.tare_tonnes ? fmtNum(data.tare_tonnes) : ''}</div>
              </div>
              <div style={{ padding: '6px 8px', gridColumn: '1 / span 2' }}>
                <div style={{ fontWeight: 900, fontSize: 10, marginBottom: 2 }}>Net</div>
                <div style={{ fontWeight: 700 }}>{data.net_tonnes ? fmtNum(data.net_tonnes) : ''}</div>
              </div>
            </div>
            <div style={{ borderBottom: '2px solid #1a1a1a', padding: '6px 8px' }}>
              <div style={{ fontWeight: 900, fontSize: 10, marginBottom: 3 }}>Address / Site</div>
              <div style={{ fontWeight: 700 }}>{fmt(data.site_address)}</div>
            </div>

            {/* Row 3 */}
            <div style={{ borderRight: '2px solid #1a1a1a', borderBottom: '2px solid #1a1a1a', padding: '6px 8px' }}>
              <div style={{ fontWeight: 900, fontSize: 10, marginBottom: 3 }}>Cash Payment</div>
              <div style={{ fontWeight: 700 }}>{fmt(data.cash_payment)}</div>
            </div>
            <div style={{ borderBottom: '2px solid #1a1a1a', minHeight: 60, padding: '6px 8px' }}>
              <div style={{ fontWeight: 900, fontSize: 10, marginBottom: 3 }}>Driver Signature</div>
            </div>

            {/* Row 4 */}
            <div style={{ borderRight: '2px solid #1a1a1a', borderBottom: '2px solid #1a1a1a', padding: '6px 8px' }}>
              <div style={{ fontWeight: 900, fontSize: 10, marginBottom: 3 }}>Amount $</div>
              <div style={{ fontWeight: 700 }}>{data.amount ? `$${fmtNum(data.amount)}` : '—'}</div>
            </div>
            <div style={{ borderBottom: '2px solid #1a1a1a', padding: '6px 8px' }}>
              <div style={{ fontWeight: 900, fontSize: 10, marginBottom: 3 }}>Vehicle Rego</div>
              <div style={{ fontWeight: 700 }}>{fmt(data.rego)}</div>
            </div>

            {/* Row 5 */}
            <div style={{ borderRight: '2px solid #1a1a1a', borderBottom: '2px solid #1a1a1a', minHeight: 60, padding: '6px 8px' }}>
              <div style={{ fontWeight: 900, fontSize: 10, marginBottom: 3 }}>Signature</div>
            </div>
            <div style={{ borderBottom: '2px solid #1a1a1a', minHeight: 60, padding: '6px 8px' }}>
              <div style={{ fontWeight: 900, fontSize: 10, marginBottom: 3 }}>Material Grade / Product Description</div>
              {data.material_grades?.length > 0 ? (
                <div>{data.material_grades.map((g, i) => (
                  <span key={i} style={{ marginRight: 6, fontSize: 10, fontWeight: 700 }}>
                    {g.grade}{data.material_grades.length > 1 ? ` (${g.percentage||0}%)` : ''}
                    {g.grade === 'Rubbish / Contamination' && g.rubbish_value ? ` ${g.rubbish_value}${g.rubbish_unit==='kg'?'kg':'%'}` : ''}
                  </span>
                ))}</div>
              ) : (
                <div style={{ fontWeight: 700 }}>{[data.material_grade, data.product_description].filter(Boolean).join(' ')}</div>
              )}
            </div>

            {/* Row 6 — Comments */}
            <div style={{ gridColumn: '1 / span 2', padding: '6px 8px', minHeight: 42 }}>
              <div style={{ fontWeight: 900, fontSize: 10, marginBottom: 3 }}>Contamination / Deductions / Comments</div>
              <div style={{ fontWeight: 500 }}>{[data.contamination_notes, data.comments].filter(Boolean).join(' ')}</div>
            </div>
          </div>

          <div style={{ textAlign: 'center', fontStyle: 'italic', color: '#7A8898', fontSize: 10, marginTop: 8 }}>Shaping a Sustainable Future</div>
        </div>
      </div>
    </div>
  );
}