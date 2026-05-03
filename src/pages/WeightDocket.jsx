import { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Printer, X, ToggleLeft, ToggleRight, ChevronLeft, LayoutDashboard } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import DocketForm from "@/components/docket/DocketForm";
import ProfessionalPreview from "@/components/docket/ProfessionalPreview";
import UserFriendlyPreview from "@/components/docket/UserFriendlyPreview";

const EMPTY = {
  ticket_no: '', order_date: '', bill_to_name: 'Metal X', bill_to_address: 'PO Box Z5150, St Georges Terrace 6000',
  line_description: 'Internal Weight Record', qty: 1, uom: 'Each', unit_price: 0, ext_price: 0, total_price: 0,
  payment_status: 'Paid on Account', from_location: '', from_company: '', to_location: '', to_company: '',
  goods_weighed: '', marks_brands: '', rego: '', gross_tonnes: '', gross_datetime: '', tare_tonnes: '',
  tare_datetime: '', net_tonnes: '', net_datetime: '', driver_name: '', driver_signature: null,
  weigh_person_name: '', weigh_person_signature: null, docket_no: '', docket_date: '', pickup: false, swap: false,
  deliver: true, customer_name: 'Metal X', site_address: '', cash_payment: '', amount: '', material_grades: [],
  material_grade: '', product_description: '', contamination_notes: '', comments: '', photo_urls: [], status: 'Draft'
};

export default function WeightDocket() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [theme, setTheme] = useState('friendly');
  const [formData, setFormData] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [isNew, setIsNew] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const printRef = useRef(null);

  // Parse ?id= from URL
  const urlParams = new URLSearchParams(window.location.search);
  const urlId = urlParams.get('id');

  const { data: docket, isLoading: loadingDocket } = useQuery({
    queryKey: ['weight-docket', urlId],
    queryFn: () => base44.entities.WeightDocket.filter({ id: urlId }),
    enabled: !!urlId,
  });

  useEffect(() => {
    if (urlId && docket && docket.length > 0) {
      setFormData({ ...EMPTY, ...docket[0] });
      setEditId(docket[0].id);
      setIsNew(false);
    } else if (!urlId) {
      setFormData(EMPTY);
      setEditId(null);
      setIsNew(true);
    }
  }, [urlId, docket]);

  const save = useMutation({
    mutationFn: async (data) => {
      if (editId) return base44.entities.WeightDocket.update(editId, data);
      return base44.entities.WeightDocket.create(data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['weight-dockets'] });
      navigate('/');
    },
  });

  const handlePrint = () => {
    const content = printRef.current?.innerHTML;
    if (!content) return;
    const win = window.open('', '_blank');
    win.document.write(`<!DOCTYPE html><html><head><title>Metal X — ${formData.ticket_no}</title>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
      <style>*{box-sizing:border-box;margin:0;padding:0;} body{font-family:Inter,sans-serif;background:#EEF0F4;-webkit-print-color-adjust:exact;print-color-adjust:exact;} @media print{body{background:#fff;}}</style>
    </head><body>${content}</body></html>`);
    win.document.close();
    setTimeout(() => win.print(), 700);
  };

  if (loadingDocket) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--mx-paper)' }}>
        <div className="w-8 h-8 rounded-full border-2 border-[#EAEEF5] border-t-[#1E4D99] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--mx-paper)' }}>
      {/* Top Nav */}
      <nav className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-[#EAEEF5] shadow-[0_2px_18px_rgba(11,25,41,0.06)]">
        <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="mr-1 w-8 h-8 flex items-center justify-center rounded-[8px] hover:bg-[#F4F7FC] transition-colors">
              <ChevronLeft className="w-4 h-4" style={{ color: 'var(--mx-muted)' }} />
            </Link>
            <img src="https://media.base44.com/images/public/69f7b7e128899b8db1200527/c72ebbf3f_MetalXLogo.png" alt="Metal X" className="h-7 object-contain" />
            <span className="text-[10px] font-bold tracking-[2px] uppercase ml-2 pl-3 border-l border-[#EAEEF5]" style={{ color: 'var(--mx-muted-2)' }}>
              {editId ? 'Edit Docket' : 'New Docket'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTheme(t => t === 'professional' ? 'friendly' : 'professional')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-[8px] border border-[#EAEEF5] text-xs hover:bg-[#EFF4FF] transition-colors"
              style={{ color: 'var(--mx-muted)', fontWeight: 600 }}
            >
              {theme === 'professional' ? <ToggleRight className="w-4 h-4 text-[#1E4D99]" /> : <ToggleLeft className="w-4 h-4" />}
              {theme === 'professional' ? 'Professional' : 'User-Friendly'}
            </button>
            <Button onClick={handlePrint} variant="outline" className="border-[#EAEEF5] text-[#1E4D99] hover:bg-[#EFF4FF] h-9 px-4 text-sm rounded-[10px]">
              <Printer className="w-4 h-4 mr-1.5" /> Print
            </Button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-5 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-8 items-start">
          <div className="min-w-0">
            <DocketForm
              data={formData}
              onChange={setFormData}
              onPreview={() => setPreviewOpen(true)}
              onSave={() => save.mutate(formData)}
              saving={save.isPending}
              isNew={isNew}
            />
          </div>
          {/* Live side preview (desktop) */}
          <div className="hidden xl:block sticky top-20">
            <p className="text-[9px] font-bold tracking-[2px] uppercase mb-3" style={{ color: 'var(--mx-muted-2)' }}>Live Preview — {theme === 'professional' ? 'Professional' : 'User-Friendly'}</p>
            <div className="rounded-[14px] overflow-hidden border border-[#EAEEF5] shadow-[0_2px_18px_rgba(11,25,41,0.06)] bg-white p-3 max-h-[calc(100vh-120px)] overflow-y-auto">
              {theme === 'professional'
                ? <div style={{ transform: 'scale(0.42)', transformOrigin: 'top left', width: '238%', pointerEvents: 'none' }}><ProfessionalPreview data={formData} /></div>
                : <UserFriendlyPreview data={formData} />}
            </div>
          </div>
        </div>
      </main>

      {/* Full Preview Modal */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl w-full max-h-[92vh] overflow-y-auto rounded-[18px] border-[#EAEEF5]">
          <DialogHeader className="pb-3 border-b border-[#EAEEF5]">
            <DialogTitle className="flex items-center justify-between">
              <span className="text-base" style={{ fontWeight: 800, color: 'var(--mx-text)' }}>
                {theme === 'professional' ? 'Professional (Print-Ready)' : 'User-Friendly'} Preview
              </span>
              <button onClick={() => setPreviewOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-[8px] hover:bg-[#F4F7FC]">
                <X className="w-4 h-4" style={{ color: 'var(--mx-muted)' }} />
              </button>
            </DialogTitle>
          </DialogHeader>
          <div className="pt-4 flex justify-end mb-3">
            <Button onClick={handlePrint} style={{ background: 'var(--mx-hero-gradient)' }} className="text-white text-sm font-semibold rounded-[10px] h-9 px-4">
              <Printer className="w-4 h-4 mr-1.5" /> Print / Save PDF
            </Button>
          </div>
          <div ref={printRef} className="overflow-x-auto">
            {theme === 'professional'
              ? <ProfessionalPreview data={formData} />
              : <UserFriendlyPreview data={formData} />}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}