import MXLogo from "./MXLogo";

const fmt = (v, fallback = "—") => v || fallback;
const fmtNum = (v, decimals = 2) => v ? parseFloat(v).toFixed(decimals) : "—";

const LOGO_URL = "https://media.base44.com/images/public/69f7b7e128899b8db1200527/c72ebbf3f_MetalXLogo.png";

const MetaRow = ({ label, value }) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-[9px] font-bold tracking-[1.5px] uppercase" style={{ color: 'var(--mx-muted-2)' }}>{label}</span>
    <span className="text-sm font-700" style={{ color: 'var(--mx-text)', fontWeight: 700 }}>{fmt(value)}</span>
  </div>
);

const Card = ({ title, eyebrow, children, className = "" }) => (
  <div className={`rounded-[14px] bg-white border border-[#EAEEF5] overflow-hidden shadow-[0_2px_18px_rgba(11,25,41,0.06)] ${className}`}>
    {(title || eyebrow) && (
      <div className="px-5 py-3 border-b border-[#EAEEF5] bg-[#F4F7FC]">
        {eyebrow && <p className="text-[9px] font-bold tracking-[2px] uppercase" style={{ color: 'var(--mx-muted-2)' }}>{eyebrow}</p>}
        {title && <h3 className="text-sm font-800 mt-0.5" style={{ color: 'var(--mx-text)', fontWeight: 800 }}>{title}</h3>}
      </div>
    )}
    <div className="p-5">{children}</div>
  </div>
);

const WeightBubble = ({ label, value, highlight = false }) => (
  <div className={`flex flex-col items-center justify-center rounded-[12px] py-4 px-3 ${highlight ? 'bg-[#0B1929] text-white' : 'bg-[#F4F7FC]'}`}>
    <span className={`text-[9px] font-bold tracking-[1.5px] uppercase mb-1 ${highlight ? 'text-[#90C4F9]' : 'text-[#AAB0C4]'}`}>{label}</span>
    <span className={`text-2xl font-900 ${highlight ? 'text-white' : 'text-[#0D1A2E]'}`} style={{ fontWeight: 900 }}>
      {value ? parseFloat(value).toFixed(2) : '—'}
    </span>
    <span className={`text-[10px] mt-0.5 ${highlight ? 'text-[#5BA3F5]' : 'text-[#7A8898]'}`}>tonnes</span>
  </div>
);

const StatusPill = ({ status }) => {
  const map = {
    'Draft': 'bg-[#F4F7FC] text-[#7A8898] border-[#EAEEF5]',
    'Pending': 'bg-[#EFF4FF] text-[#1E4D99] border-[#DCE9FA]',
    'Verified': 'bg-[#EDFBF3] text-[#1B7A45] border-[#C3EDD5]',
    'Archived': 'bg-[#F4F4F6] text-[#AAB0C4] border-[#EAEEF5]',
  };
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-700 border ${map[status] || map['Draft']}`} style={{ fontWeight: 700 }}>
      {status || 'Draft'}
    </span>
  );
};

const CheckBadge = ({ label, checked }) => (
  <div className={`flex flex-col items-center gap-1.5 px-4 py-3 rounded-[10px] border ${checked ? 'bg-[#EFF4FF] border-[#DCE9FA]' : 'bg-[#F4F7FC] border-[#EAEEF5]'}`}>
    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-900 ${checked ? 'bg-[#1E4D99] text-white' : 'bg-[#EAEEF5] text-[#AAB0C4]'}`} style={{ fontWeight: 900 }}>
      {checked ? '✓' : ''}
    </div>
    <span className={`text-[9px] font-bold tracking-[1px] uppercase ${checked ? 'text-[#1E4D99]' : 'text-[#AAB0C4]'}`}>{label}</span>
  </div>
);

export default function UserFriendlyPreview({ data = {} }) {
  return (
    <div className="w-full max-w-2xl mx-auto space-y-4 font-[Inter,sans-serif]">
      {/* Hero Header */}
      <div className="rounded-[18px] overflow-hidden" style={{ background: 'var(--mx-hero-gradient)' }}>
        <div className="px-6 pt-5 pb-4">
          <div className="flex items-start justify-between">
            <img src={LOGO_URL} alt="Metal X" style={{ height: 32, objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
            <div className="text-right">
              <p className="text-[9px] font-bold tracking-[2px] uppercase text-[#90C4F9]">Weigh Bridge</p>
              <p className="text-lg font-900 text-white mt-0.5" style={{ fontWeight: 900 }}>{fmt(data.ticket_no, 'MX-XXXXXXXX')}</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-white/10">
            <p className="text-[9px] font-bold tracking-[2px] uppercase text-[#90C4F9]">Document Type</p>
            <h1 className="text-xl font-900 text-white tracking-wide mt-0.5" style={{ fontWeight: 900 }}>DIRECT MEASUREMENT TICKET</h1>
          </div>
        </div>
        {/* Meta Strip */}
        <div className="grid grid-cols-3 border-t border-white/10">
          {[['Order Date', data.order_date], ['Status', null], ['Driver', data.driver_name]].map(([l, v], i) => (
            <div key={l} className={`px-5 py-3 ${i < 2 ? 'border-r border-white/10' : ''}`}>
              <p className="text-[9px] font-bold tracking-[1.5px] uppercase text-[#90C4F9]">{l}</p>
              {l === 'Status' ? <StatusPill status={data.status} /> : <p className="text-sm font-700 text-white mt-0.5" style={{ fontWeight: 700 }}>{fmt(v)}</p>}
            </div>
          ))}
        </div>
      </div>

      {/* Billing */}
      <Card title="Billing Details" eyebrow="Accounts">
        <div className="grid grid-cols-2 gap-4">
          <MetaRow label="Bill To" value={data.bill_to_name} />
          <MetaRow label="Address" value={data.bill_to_address} />
          <MetaRow label="Description" value={data.line_description || 'Internal Weight Record'} />
          <MetaRow label="Payment Status" value={data.payment_status} />
        </div>
      </Card>

      {/* Weight Readings */}
      <Card title="Weight Readings" eyebrow="Weighbridge Data">
        <div className="grid grid-cols-3 gap-3 mb-4">
          <WeightBubble label="Gross" value={data.gross_tonnes} />
          <WeightBubble label="Tare" value={data.tare_tonnes} />
          <WeightBubble label="Net" value={data.net_tonnes} highlight />
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          {[['Gross Time', data.gross_datetime], ['Tare Time', data.tare_datetime], ['Net Time', data.net_datetime]].map(([l, v]) => (
            <div key={l}>
              <p className="text-[9px] font-bold tracking-[1px] uppercase" style={{ color: 'var(--mx-muted-2)' }}>{l}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--mx-muted)' }}>{fmt(v)}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Load Details */}
      <Card title="Load Details" eyebrow="Movement">
        <div className="grid grid-cols-2 gap-4">
          <MetaRow label="From Location" value={data.from_location} />
          <MetaRow label="To Location" value={data.to_location} />
          <MetaRow label="Goods Weighed" value={data.goods_weighed} />
          <MetaRow label="Vehicle Rego" value={data.rego} />
          {data.marks_brands && <MetaRow label="Marks & Brands" value={data.marks_brands} />}
        </div>
      </Card>

      {/* Signatures */}
      {(data.driver_signature || data.weigh_person_signature) && (
        <Card title="Signatures" eyebrow="Verified">
          <div className="grid grid-cols-2 gap-4">
            {[['Driver', data.driver_signature, data.driver_name], ['Weigh Person', data.weigh_person_signature, data.weigh_person_name]].map(([role, sig, name]) => (
              <div key={role} className="flex flex-col gap-2">
                <p className="text-[9px] font-bold tracking-[1.5px] uppercase" style={{ color: 'var(--mx-muted-2)' }}>{role}</p>
                {sig ? (
                  <div className="rounded-[8px] border border-[#EAEEF5] overflow-hidden bg-white">
                    <img src={sig} alt={`${role} signature`} className="w-full h-14 object-contain" />
                  </div>
                ) : <div className="h-14 rounded-[8px] border border-dashed border-[#EAEEF5] flex items-center justify-center"><span className="text-[10px]" style={{ color: 'var(--mx-muted-2)' }}>Not signed</span></div>}
                <p className="text-xs font-semibold" style={{ color: 'var(--mx-text)' }}>{name || '—'}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Photos */}
      {data.photo_urls && data.photo_urls.length > 0 && (
        <Card title="Photos" eyebrow={`Evidence · ${data.photo_urls.length} image${data.photo_urls.length > 1 ? 's' : ''}`}>
          <div className="grid grid-cols-3 gap-2">
            {data.photo_urls.map((url, i) => (
              <div key={i} className="rounded-[8px] overflow-hidden border border-[#EAEEF5] aspect-square bg-[#F4F7FC]">
                <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Grading Docket */}
      <div className="rounded-[18px] overflow-hidden border border-[#DCE9FA]" style={{ background: 'linear-gradient(180deg, #eaf3ff, #eef6ff)' }}>
        <div className="px-5 py-4 border-b border-[#DCE9FA] flex items-center justify-between">
          <div>
            <p className="text-[9px] font-bold tracking-[2px] uppercase" style={{ color: '#1E4D99' }}>Material Grading Docket</p>
            <h3 className="text-base font-900 mt-0.5" style={{ color: '#0D1A2E', fontWeight: 900 }}>Docket #{fmt(data.docket_no)}</h3>
          </div>
          <div className="text-right">
            <p className="text-[9px] font-bold tracking-[1.5px] uppercase" style={{ color: 'var(--mx-muted-2)' }}>Date</p>
            <p className="text-sm font-700" style={{ fontWeight: 700 }}>{fmt(data.docket_date)}</p>
          </div>
        </div>
        <div className="p-5 space-y-4">
          {/* Collection Mode */}
          <div>
            <p className="text-[9px] font-bold tracking-[1.5px] uppercase mb-2" style={{ color: 'var(--mx-muted-2)' }}>Collection Mode</p>
            <div className="flex gap-2">
              <CheckBadge label="Pickup" checked={!!data.pickup} />
              <CheckBadge label="Swap" checked={!!data.swap} />
              <CheckBadge label="Deliver" checked={data.deliver !== false} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <MetaRow label="Customer" value={data.customer_name} />
            <MetaRow label="Site Address" value={data.site_address} />
            <MetaRow label="Cash Payment" value={data.cash_payment} />
            <MetaRow label="Amount" value={data.amount ? `$${fmtNum(data.amount)}` : '—'} />
          </div>
          {(data.material_grades?.length > 0 || data.material_grade || data.product_description) && (
            <div className="rounded-[10px] bg-white border border-[#EAEEF5] p-4">
              <p className="text-[9px] font-bold tracking-[1.5px] uppercase mb-2" style={{ color: 'var(--mx-muted-2)' }}>Material Grade / Product Description</p>
              {data.material_grades?.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {data.material_grades.map((g, i) => (
                    <span key={i} className="px-2 py-1 rounded-full text-xs font-semibold bg-[#EFF4FF] text-[#1E4D99] border border-[#DCE9FA]">
                      {g.grade}{data.material_grades.length > 1 ? ` ${g.percentage || 0}%` : ''}
                      {g.grade === 'Rubbish / Contamination' && g.rubbish_value ? ` (${g.rubbish_value}${g.rubbish_unit === 'kg' ? 'kg' : '%'})` : ''}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm font-700" style={{ fontWeight: 700, color: 'var(--mx-text)' }}>{[data.material_grade, data.product_description].filter(Boolean).join(' ')}</p>
              )}
            </div>
          )}
          {(data.contamination_notes || data.comments) && (
            <div className="rounded-[10px] bg-white/60 border border-[#EAEEF5] p-4">
              <p className="text-[9px] font-bold tracking-[1.5px] uppercase mb-1" style={{ color: 'var(--mx-muted-2)' }}>Notes / Comments</p>
              <p className="text-sm" style={{ color: 'var(--mx-muted)' }}>{[data.contamination_notes, data.comments].filter(Boolean).join(' ')}</p>
            </div>
          )}
        </div>
        <div className="text-center py-3 border-t border-[#DCE9FA]">
          <p className="text-[10px] italic" style={{ color: 'var(--mx-muted)' }}>Shaping a Sustainable Future</p>
        </div>
      </div>
    </div>
  );
}