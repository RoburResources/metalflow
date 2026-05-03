import { useState, useRef, useEffect } from "react";
import { MapPin, Building2, Search } from "lucide-react";

const WA_LOCATIONS = [
  { suburb: "Perth CBD", postcode: "6000", region: "Metro" },
  { suburb: "Fremantle", postcode: "6160", region: "Metro" },
  { suburb: "Malaga", postcode: "6090", region: "Metro" },
  { suburb: "Welshpool", postcode: "6106", region: "Metro" },
  { suburb: "Kewdale", postcode: "6105", region: "Metro" },
  { suburb: "Jandakot", postcode: "6164", region: "Metro" },
  { suburb: "Osborne Park", postcode: "6017", region: "Metro" },
  { suburb: "Bassendean", postcode: "6054", region: "Metro" },
  { suburb: "Canning Vale", postcode: "6155", region: "Metro" },
  { suburb: "Bibra Lake", postcode: "6163", region: "Metro" },
  { suburb: "Henderson", postcode: "6166", region: "Metro" },
  { suburb: "Rockingham", postcode: "6168", region: "Metro" },
  { suburb: "Mandurah", postcode: "6210", region: "Peel" },
  { suburb: "Bunbury", postcode: "6230", region: "South West" },
  { suburb: "Busselton", postcode: "6280", region: "South West" },
  { suburb: "Albany", postcode: "6330", region: "Great Southern" },
  { suburb: "Geraldton", postcode: "6530", region: "Mid West" },
  { suburb: "Kalgoorlie", postcode: "6430", region: "Goldfields" },
  { suburb: "Port Hedland", postcode: "6721", region: "Pilbara" },
  { suburb: "Karratha", postcode: "6714", region: "Pilbara" },
  { suburb: "Newman", postcode: "6753", region: "Pilbara" },
  { suburb: "Broome", postcode: "6725", region: "Kimberley" },
  { suburb: "Northam", postcode: "6401", region: "Wheatbelt" },
  { suburb: "Midland", postcode: "6056", region: "Metro" },
  { suburb: "Armadale", postcode: "6112", region: "Metro" },
  { suburb: "Wangara", postcode: "6065", region: "Metro" },
  { suburb: "Bayswater", postcode: "6053", region: "Metro" },
  { suburb: "O'Connor", postcode: "6163", region: "Metro" },
  { suburb: "West 2 West", postcode: "6000", region: "Metro" },
  { suburb: "Metal X Depot", postcode: "6000", region: "Metro" },
];

export default function LocationSearch({ label, value, company, onChangeLocation, onChangeCompany }) {
  const [query, setQuery] = useState(value || "");
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const filtered = query.length > 0
    ? WA_LOCATIONS.filter(l =>
        l.suburb.toLowerCase().includes(query.toLowerCase()) ||
        l.postcode.includes(query) ||
        l.region.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 8)
    : WA_LOCATIONS.slice(0, 8);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const select = (loc) => {
    const val = `${loc.suburb} WA ${loc.postcode}`;
    setQuery(val);
    onChangeLocation(val);
    setOpen(false);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Location input */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-bold tracking-[1.5px] uppercase" style={{ color: 'var(--mx-muted)' }}>{label} — Location (WA)</label>
        <div className="relative" ref={ref}>
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            <MapPin className="w-3.5 h-3.5" style={{ color: 'var(--mx-muted-2)' }} />
          </div>
          <input
            className="w-full pl-8 pr-3 h-10 bg-white border border-[#EAEEF5] rounded-lg text-sm font-medium focus:ring-2 focus:ring-[#1E4D99] focus:border-[#1E4D99] outline-none"
            placeholder={`Search WA suburb or postcode…`}
            value={query}
            onChange={e => { setQuery(e.target.value); onChangeLocation(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
          />
          {open && (
            <div className="absolute z-50 top-full mt-1 left-0 right-0 bg-white border border-[#EAEEF5] rounded-[12px] shadow-[0_10px_40px_rgba(11,25,41,0.12)] overflow-hidden">
              {filtered.map((loc, i) => (
                <button
                  key={i}
                  onMouseDown={() => select(loc)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#F4F7FC] text-left transition-colors border-b border-[#EAEEF5] last:border-b-0"
                >
                  <MapPin className="w-3.5 h-3.5 shrink-0" style={{ color: '#1E4D99' }} />
                  <div>
                    <div className="text-sm font-600" style={{ fontWeight: 600, color: 'var(--mx-text)' }}>{loc.suburb} WA {loc.postcode}</div>
                    <div className="text-[10px]" style={{ color: 'var(--mx-muted)' }}>{loc.region}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Company name */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-bold tracking-[1.5px] uppercase" style={{ color: 'var(--mx-muted)' }}>{label} — Company Name</label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            <Building2 className="w-3.5 h-3.5" style={{ color: 'var(--mx-muted-2)' }} />
          </div>
          <input
            className="w-full pl-8 pr-3 h-10 bg-white border border-[#EAEEF5] rounded-lg text-sm font-medium focus:ring-2 focus:ring-[#1E4D99] focus:border-[#1E4D99] outline-none"
            placeholder="Company name…"
            value={company || ""}
            onChange={e => onChangeCompany(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}