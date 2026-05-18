import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, RotateCcw, Pencil, ShieldCheck, AlertTriangle, X } from "lucide-react";

function Row({ label, value, highlight }) {
  return (
    <div className={`flex justify-between items-center px-4 py-3 rounded-[10px] ${highlight ? 'bg-[#0B1929]' : 'bg-[#F4F7FC]'}`}>
      <span className={`text-[10px] font-bold uppercase tracking-widest ${highlight ? 'text-[#90C4F9]' : 'text-[#7A8898]'}`}>{label}</span>
      <span className={`text-sm font-black ${highlight ? 'text-white' : 'text-[#0D1A2E]'}`}>{value || '—'}</span>
    </div>
  );
}

export default function VerifySignModal({ open, onClose, docket, onConfirm }) {
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [hasStrokes, setHasStrokes] = useState(false);
  const [signed, setSigned] = useState(false);
  const [signatureData, setSignatureData] = useState(null);
  const lastPos = useRef(null);

  useEffect(() => {
    if (!open) return;
    setHasStrokes(false);
    setSigned(false);
    setSignatureData(null);
    setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }, 50);
  }, [open]);

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const touch = e.touches ? e.touches[0] : null;
    const clientX = touch ? touch.clientX : e.clientX;
    const clientY = touch ? touch.clientY : e.clientY;
    return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
  };

  const startDraw = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    const pos = getPos(e, canvas);
    lastPos.current = pos;
    const ctx = canvas.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    ctx.strokeStyle = "#0D1A2E";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    setDrawing(true);
    setHasStrokes(true);
    setSigned(false);
  };

  const draw = (e) => {
    if (!drawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const pos = getPos(e, canvas);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastPos.current = pos;
  };

  const endDraw = (e) => {
    if (e) e.preventDefault();
    setDrawing(false);
    lastPos.current = null;
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasStrokes(false);
    setSigned(false);
    setSignatureData(null);
  };

  const confirmSign = () => {
    const canvas = canvasRef.current;
    const data = canvas.toDataURL("image/png");
    setSignatureData(data);
    setSigned(true);
  };

  const handleVerify = () => {
    onConfirm(signatureData);
  };

  const grades = docket?.material_grades?.length
    ? docket.material_grades.map(g => g.grade).join(', ')
    : docket?.material_grade || '—';

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg w-full rounded-[18px] border-[#EAEEF5] p-0 overflow-hidden max-h-[95vh] overflow-y-auto">
        <DialogHeader className="px-6 pt-6 pb-0">
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#1E4D99] flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-base font-black" style={{ color: 'var(--mx-text)' }}>VERIFY DOCKET</p>
                <p className="text-[10px] font-semibold" style={{ color: 'var(--mx-muted-2)' }}>{docket?.ticket_no}</p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-[8px] hover:bg-[#F4F7FC]">
              <X className="w-4 h-4" style={{ color: 'var(--mx-muted)' }} />
            </button>
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-6 pt-5 space-y-5">
          {/* Weight Summary */}
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest mb-3" style={{ color: 'var(--mx-muted-2)' }}>Weight Readings — Review Before Signing</p>
            <div className="space-y-2">
              <Row label="Gross Weight" value={docket?.gross_tonnes ? parseFloat(docket.gross_tonnes).toFixed(2) + ' t' : null} />
              <Row label="Tare Weight" value={docket?.tare_tonnes ? parseFloat(docket.tare_tonnes).toFixed(2) + ' t' : null} />
              <Row label="Net Weight" value={docket?.net_tonnes ? parseFloat(docket.net_tonnes).toFixed(2) + ' t' : null} highlight />
            </div>
          </div>

          {/* Load Details */}
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest mb-3" style={{ color: 'var(--mx-muted-2)' }}>Load Details</p>
            <div className="space-y-2">
              <Row label="Vehicle Rego" value={docket?.rego} />
              <Row label="Driver" value={docket?.driver_name} />
              <Row label="Material Grade" value={grades} />
              <Row label="From" value={docket?.from_location} />
              <Row label="Customer" value={docket?.customer_name} />
            </div>
          </div>

          {/* Contamination flag */}
          {docket?.contamination_notes && (
            <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-[10px] p-3">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest mb-0.5">Contamination Noted</p>
                <p className="text-xs text-amber-800">{docket.contamination_notes}</p>
              </div>
            </div>
          )}

          {/* Signature Pad */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: 'var(--mx-muted-2)' }}>Driver Signature — Tap to Sign</p>
              {hasStrokes && !signed && (
                <div className="flex gap-1.5">
                  <button onClick={clear} className="flex items-center gap-1 px-2 py-1 rounded-[6px] text-[10px] font-semibold text-[#7A8898] hover:bg-[#F4F7FC] border border-[#EAEEF5]">
                    <RotateCcw className="w-3 h-3" /> Clear
                  </button>
                  <button onClick={confirmSign} className="flex items-center gap-1 px-2.5 py-1 rounded-[6px] text-[10px] font-semibold text-white border border-[#1E4D99]" style={{ background: '#1E4D99' }}>
                    <CheckCircle2 className="w-3 h-3" /> Confirm
                  </button>
                </div>
              )}
              {signed && (
                <div className="flex gap-1.5">
                  <span className="text-[9px] px-2 py-0.5 rounded-full font-bold bg-[#EDFBF3] text-[#1B7A45] border border-[#C3EDD5]">✓ Signed</span>
                  <button onClick={clear} className="flex items-center gap-1 px-2 py-1 rounded-[6px] text-[10px] font-semibold text-[#7A8898] hover:bg-[#F4F7FC] border border-[#EAEEF5]">
                    <Pencil className="w-3 h-3" /> Re-sign
                  </button>
                </div>
              )}
            </div>

            {signed && signatureData ? (
              <div className="rounded-[10px] border-2 border-[#1E4D99] overflow-hidden">
                <img src={signatureData} alt="Signature" className="w-full bg-white" style={{ height: 120, objectFit: 'contain' }} />
              </div>
            ) : (
              <div className="relative rounded-[10px] border-2 border-dashed border-[#EAEEF5] overflow-hidden" style={{ background: '#FAFBFD' }}>
                <div className="flex items-center justify-center gap-2 py-1.5 border-b border-[#EAEEF5] bg-[#F4F7FC]">
                  <Pencil className="w-3 h-3" style={{ color: 'var(--mx-muted-2)' }} />
                  <span className="text-[9px] font-semibold tracking-[1px] uppercase" style={{ color: 'var(--mx-muted-2)' }}>Sign below using finger or stylus</span>
                </div>
                <canvas
                  ref={canvasRef}
                  width={600}
                  height={130}
                  className="w-full cursor-crosshair touch-none block"
                  style={{ height: 130, background: '#fff' }}
                  onMouseDown={startDraw}
                  onMouseMove={draw}
                  onMouseUp={endDraw}
                  onMouseLeave={endDraw}
                  onTouchStart={startDraw}
                  onTouchMove={draw}
                  onTouchEnd={endDraw}
                />
                {!hasStrokes && (
                  <div className="absolute inset-0 top-8 flex items-center justify-center pointer-events-none">
                    <span className="text-sm" style={{ color: 'var(--mx-muted-2)' }}>——— sign here ———</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1 h-11 rounded-[12px] border-[#EAEEF5] text-sm font-bold">
              Cancel
            </Button>
            <Button
              onClick={handleVerify}
              disabled={!signed}
              style={{ background: signed ? 'var(--mx-hero-gradient)' : undefined }}
              className="flex-1 h-11 rounded-[12px] text-white text-sm font-black disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4 mr-2" />
              MARK VERIFIED
            </Button>
          </div>
          {!signed && (
            <p className="text-center text-[10px]" style={{ color: 'var(--mx-muted-2)' }}>Signature required before verifying</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}