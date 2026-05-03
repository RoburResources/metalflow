import { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Printer, X, LayoutList, ToggleLeft, ToggleRight, ChevronLeft } from "lucide-react";
import DocketForm from "@/components/docket/DocketForm";
import ProfessionalPreview from "@/components/docket/ProfessionalPreview";
import UserFriendlyPreview from "@/components/docket/UserFriendlyPreview";
import DocketListItem from "@/components/docket/DocketListItem";
import MXLogo from "@/components/docket/MXLogo";

const EMPTY = {
  ticket_no: '', order_date: '', bill_to_name: 'Metal X', bill_to_address: 'PO Box Z5150, St Georges Terrace 6000',
  line_description: 'Internal Weight Record', qty: 1, uom: 'Each', unit_price: 0, ext_price: 0, total_price: 0,
  payment_status: 'Paid on Account', from_location: '', to_location: '', goods_weighed: '', marks_brands: '',
  rego: '', gross_tonnes: '', gross_datetime: '', tare_tonnes: '', tare_datetime: '', net_tonnes: '', net_datetime: '',
  driver_name: '', weigh_person_name: '', docket_no: '', docket_date: '', pickup: false, swap: false, deliver: true,
  customer_name: 'Metal X', site_address: '', cash_payment: '', amount: '', material_grade: '', product_description: '',
  contamination_notes: '', comments: '', status: 'Draft'
};

export default function WeightDocket() {
  const qc = useQueryClient();
  const [view, setView] = useState('list'); // list | form | preview
  const [theme, setTheme] = useState('friendly'); // professional | friendly
  const [formData, setFormData] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const printRef = useRef(null);

  const { data: dockets = [], isLoading } = useQuery({
    queryKey: ['weight-dockets'],
    queryFn: () => base44.entities.WeightDocket.list('-created_date', 50),
  });

  const save = useMutation({
    mutationFn: async (data) => {
      if (editId) return base44.entities.WeightDocket.update(editId, data);
      return base44.entities.WeightDocket.create(data);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['weight-dockets'] }); setView('list'); setEditId(null); setFormData(EMPTY); },
  });

  const del = useMutation({
    mutationFn: (id) => base44.entities.WeightDocket.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['weight-dockets'] }),
  });

  const handleOpen = (d) => {
    setFormData({ ...EMPTY, ...d });
    setEditId(d.id);
    setView('form');
  };

  const handleNew = () => { setFormData(EMPTY); setEditId(null); setView('form'); };

  const handlePrint = () => {
    const content = printRef.current?.innerHTML;
    if (!content) return;
    const win = window.open('', '_blank');
    win.document.write(`<!DOCTYPE html><html><head><title>Metal X Weight Docket</title>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
      <style>*{box-sizing:border-box;margin:0;padding:0;} body{font-family:Inter,sans-serif;background:#EEF0F4;} @media print{body{background:#fff;}}</style>
    </head><body>${content}</body></html>`);
    win.document.close();
    setTimeout(() => { win.print(); }, 600);
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--mx-paper)' }}>
      {/* Top Nav */}
      <nav className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-[#EAEEF5] shadow-[0_2px_18px_rgba(11,25,41,0.06)]">
        <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {view !== 'list' && (
              <button onClick={() => setView('list')} className="mr-1 w-8 h-8 flex items-center justify-center rounded-[8px] hover:bg-[#F4F7FC] transition-colors">
                <ChevronLeft className="w-4 h-4" style={{ color: 'var(--mx-muted)' }} />
              </button>
            )}
            <MXLogo size="sm" />
            <span className="text-[10px] font-bold tracking-[2px] uppercase ml-2 pl-3 border-l border-[#EAEEF5]" style={{ color: 'var(--mx-muted-2)' }}>
              {view === 'list' ? 'Weight Dockets' : view === 'form' ? (editId ? 'Edit Docket' : 'New Docket') : 'Preview'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <button
              onClick={() => setTheme(t => t === 'professional' ? 'friendly' : 'professional')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-[8px] border border-[#EAEEF5] text-xs font-600 hover:bg-[#EFF4FF] transition-colors"
              style={{ color: 'var(--mx-muted)', fontWeight: 600 }}
            >
              {theme === 'professional' ? <ToggleRight className="w-4 h-4 text-[#1E4D99]" /> : <ToggleLeft className="w-4 h-4" />}
              {theme === 'professional' ? 'Professional' : 'User-Friendly'}
            </button>
            {view === 'list' && (
              <Button onClick={handleNew} style={{ background: 'var(--mx-hero-gradient)' }} className="text-white text-sm font-semibold rounded-[10px] h-9 px-4">
                <Plus className="w-4 h-4 mr-1.5" /> New Docket
              </Button>
            )}
            {view === 'form' && (
              <Button onClick={handlePrint} variant="outline" className="border-[#EAEEF5] text-[#1E4D99] hover:bg-[#EFF4FF] h-9 px-4 text-sm rounded-[10px]">
                <Printer className="w-4 h-4 mr-1.5" /> Print
              </Button>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-5 py-8">
        {/* LIST VIEW */}
        {view === 'list' && (
          <div>
            <div className="mb-6">
              <p className="text-[10px] font-bold tracking-[2px] uppercase" style={{ color: 'var(--mx-muted-2)' }}>Operations</p>
              <h2 className="text-2xl font-900 mt-0.5" style={{ fontWeight: 900, color: 'var(--mx-text)' }}>Weight Dockets</h2>
            </div>
            <div className="rounded-[18px] bg-white border border-[#EAEEF5] shadow-[0_2px_18px_rgba(11,25,41,0.06)] overflow-hidden">
              {isLoading ? (
                <div className="flex items-center justify-center h-48">
                  <div className="w-8 h-8 rounded-full border-2 border-[#EAEEF5] border-t-[#1E4D99] animate-spin" />
                </div>
              ) : dockets.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-52 gap-3">
                  <div className="w-12 h-12 rounded-[14px] bg-[#EFF4FF] flex items-center justify-center">
                    <LayoutList className="w-5 h-5 text-[#1E4D99]" />
                  </div>
                  <p className="text-sm" style={{ color: 'var(--mx-muted)' }}>No dockets yet. Create your first one.</p>
                  <Button onClick={handleNew} style={{ background: 'var(--mx-hero-gradient)' }} className="text-white text-sm font-semibold rounded-[10px] h-9 px-5">
                    <Plus className="w-4 h-4 mr-1.5" /> New Docket
                  </Button>
                </div>
              ) : dockets.map(d => (
                <DocketListItem key={d.id} docket={d} onOpen={handleOpen} onDelete={() => del.mutate(d.id)} />
              ))}
            </div>
          </div>
        )}

        {/* FORM + SIDE PREVIEW */}
        {view === 'form' && (
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_auto] gap-8 items-start">
            <div className="min-w-0">
              <DocketForm
                data={formData}
                onChange={setFormData}
                onPreview={() => setPreviewOpen(true)}
                onSave={() => save.mutate(formData)}
                saving={save.isPending}
              />
            </div>
            {/* Live side preview (desktop) */}
            <div className="hidden xl:block w-[340px] shrink-0 sticky top-20">
              <p className="text-[9px] font-bold tracking-[2px] uppercase mb-3" style={{ color: 'var(--mx-muted-2)' }}>Live Preview</p>
              <div className="rounded-[14px] overflow-hidden border border-[#EAEEF5] shadow-[0_2px_18px_rgba(11,25,41,0.06)] bg-white p-3 scale-[0.82] origin-top-left" style={{ width: '120%' }}>
                {theme === 'professional'
                  ? <div style={{ transform: 'scale(0.45)', transformOrigin: 'top left', width: '210mm', pointerEvents: 'none' }}><ProfessionalPreview data={formData} /></div>
                  : <UserFriendlyPreview data={formData} />}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Full Preview Modal */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl w-full max-h-[92vh] overflow-y-auto rounded-[18px] border-[#EAEEF5]">
          <DialogHeader className="pb-3 border-b border-[#EAEEF5]">
            <DialogTitle className="flex items-center justify-between">
              <span className="text-base font-800" style={{ fontWeight: 800, color: 'var(--mx-text)' }}>
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