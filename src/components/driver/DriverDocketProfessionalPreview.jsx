import React from "react";

export default function DriverDocketProfessionalPreview({ docket }) {
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-AU', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div className="w-full bg-white" style={{ color: 'var(--mx-text)', fontFamily: 'Inter, sans-serif' }}>
      {/* Hero Header */}
      <div style={{ background: 'var(--mx-hero-gradient)' }} className="px-8 py-8 text-white">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-black">Metal X Renewables</h1>
            <p className="text-sm mt-1 opacity-90">Pty Ltd | ABN 90 687 484 975</p>
            <p className="text-xs mt-0.5 opacity-80">Shaping a Sustainable Future</p>
          </div>
          <div className="text-right">
            <p className="text-xs opacity-80">DOCKET REFERENCE</p>
            <p className="text-2xl font-black mt-1">{docket.ticket_no}</p>
            <p className="text-xs mt-2 opacity-80">Issued: {formatDate(docket.order_date)}</p>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="px-8 py-8 space-y-8">
        {/* Issued By & Customer */}
        <div className="grid grid-cols-2 gap-6">
          <div className="border border-[#EAEEF5] rounded-lg p-6">
            <p className="text-xs font-bold tracking-widest uppercase" style={{ color: 'var(--mx-muted-2)' }}>Issued By</p>
            <h3 className="text-lg font-black mt-3" style={{ color: 'var(--mx-text)' }}>Metal X Renewables Pty Ltd</h3>
            <p className="text-xs mt-2">ABN 90 687 484 975</p>
            <p className="text-xs mt-1">Perth, Western Australia</p>
          </div>
          <div className="border border-[#EAEEF5] rounded-lg p-6">
            <p className="text-xs font-bold tracking-widest uppercase" style={{ color: 'var(--mx-muted-2)' }}>Driver</p>
            <h3 className="text-lg font-black mt-3" style={{ color: 'var(--mx-text)' }}>{docket.driver_name || "N/A"}</h3>
            <p className="text-xs mt-2">{docket.rego || "N/A"}</p>
            <p className="text-xs mt-1">{docket.customer_email || ""}</p>
          </div>
        </div>

        {/* Job Details */}
        <div className="border border-[#EAEEF5] rounded-lg p-6 space-y-4">
          <div>
            <p className="text-xs font-bold tracking-widest uppercase" style={{ color: 'var(--mx-muted-2)' }}>About This Docket</p>
            <p className="text-sm mt-3" style={{ color: 'var(--mx-muted)' }}>
              Driver docket for transport and delivery of {docket.goods_weighed || "material"} from {docket.from_location || "pickup location"} to {docket.to_location || "delivery location"}. Weight readings and material grade as recorded.
            </p>
          </div>
        </div>

        {/* Vehicle & Route Schedule */}
        <div className="border border-[#EAEEF5] rounded-lg p-6">
          <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: 'var(--mx-muted-2)' }}>Route Schedule</p>
          <table className="w-full text-xs">
            <tbody className="divide-y divide-[#EAEEF5]">
              <tr className="hover:bg-[#F5F7FB]">
                <td className="py-3 font-bold w-24">FROM</td>
                <td className="py-3">{docket.from_location || "N/A"}</td>
                <td className="py-3 text-right text-[#7A8898]">{docket.from_company || ""}</td>
              </tr>
              <tr className="hover:bg-[#F5F7FB]">
                <td className="py-3 font-bold">TO</td>
                <td className="py-3">{docket.to_location || "N/A"}</td>
                <td className="py-3 text-right text-[#7A8898]">{docket.to_company || ""}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Material Details */}
        <div className="border border-[#EAEEF5] rounded-lg p-6">
          <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: 'var(--mx-muted-2)' }}>Material Details</p>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <p className="font-bold">GOODS / MATERIAL</p>
              <p className="mt-1" style={{ color: 'var(--mx-muted)' }}>{docket.goods_weighed || "N/A"}</p>
            </div>
            <div>
              <p className="font-bold">GRADE</p>
              <p className="mt-1" style={{ color: 'var(--mx-muted)' }}>{docket.material_grade || "N/A"}</p>
            </div>
          </div>
        </div>

        {/* Weight Measurements */}
        <div className="border border-[#EAEEF5] rounded-lg p-6">
          <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: 'var(--mx-muted-2)' }}>Weight Measurements</p>
          <div className="grid grid-cols-3 gap-4">
            <div className="border border-[#EAEEF5] rounded p-4 text-center">
              <p className="text-xs font-bold">GROSS</p>
              <p className="text-2xl font-black mt-2 text-[#1E4D99]">{docket.gross_tonnes || "—"}t</p>
              <p className="text-[10px] mt-1" style={{ color: 'var(--mx-muted-2)' }}>{docket.gross_datetime ? docket.gross_datetime.slice(0, 16) : ""}</p>
            </div>
            <div className="border border-[#EAEEF5] rounded p-4 text-center">
              <p className="text-xs font-bold">TARE</p>
              <p className="text-2xl font-black mt-2 text-[#1E4D99]">{docket.tare_tonnes || "—"}t</p>
              <p className="text-[10px] mt-1" style={{ color: 'var(--mx-muted-2)' }}>{docket.tare_datetime ? docket.tare_datetime.slice(0, 16) : ""}</p>
            </div>
            <div className="border-2 border-[#1E4D99] rounded p-4 text-center bg-[#EFF4FF]">
              <p className="text-xs font-bold text-[#1E4D99]">NET (CALCULATED)</p>
              <p className="text-2xl font-black mt-2 text-[#1E4D99]">{docket.net_tonnes || "—"}t</p>
              <p className="text-[10px] mt-1 text-[#1E4D99]">{docket.net_datetime ? docket.net_datetime.slice(0, 16) : ""}</p>
            </div>
          </div>
        </div>

        {/* Observations */}
        {(docket.contamination_notes || docket.comments) && (
          <div className="space-y-4">
            {docket.contamination_notes && (
              <div className="border border-amber-200 rounded-lg p-6 bg-amber-50">
                <p className="text-xs font-bold tracking-widest uppercase text-amber-800">Contamination Notes</p>
                <p className="text-sm mt-3 text-amber-900">{docket.contamination_notes}</p>
              </div>
            )}
            {docket.comments && (
              <div className="border border-[#DCE9FA] rounded-lg p-6 bg-[#EFF4FF]">
                <p className="text-xs font-bold tracking-widest uppercase text-[#1E4D99]">Metal X Comments</p>
                <p className="text-sm mt-3 text-[#1E4D99]">{docket.comments}</p>
              </div>
            )}
          </div>
        )}

        {/* Photos */}
        {docket.photo_urls && docket.photo_urls.length > 0 && (
          <div className="border border-[#EAEEF5] rounded-lg p-6">
            <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: 'var(--mx-muted-2)' }}>Documentation Photos</p>
            <div className="grid grid-cols-3 gap-3">
              {docket.photo_urls.map((url, i) => (
                <img key={i} src={url} alt={`Photo ${i + 1}`} className="w-full aspect-square object-cover rounded border border-[#EAEEF5]" />
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-[#EAEEF5] pt-6 text-center">
          <p className="text-[10px]" style={{ color: 'var(--mx-muted-2)' }}>
            Generated on {new Date().toLocaleString('en-AU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
          <p className="text-[9px] mt-2" style={{ color: 'var(--mx-muted-2)' }}>
            Metal X Renewables Pty Ltd | ABN 90 687 484 975 | Perth, Western Australia
          </p>
        </div>
      </div>
    </div>
  );
}