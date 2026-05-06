import { useRef, useState, useEffect } from "react";
import { RotateCcw, Check, Pencil } from "lucide-react";

export default function SignaturePad({ label, value, onChange }) {
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [hasStrokes, setHasStrokes] = useState(false);
  const [isEditing, setIsEditing] = useState(!value);
  const lastPos = useRef(null);

  useEffect(() => {
    if (!isEditing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (value) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0);
      img.src = value;
      setHasStrokes(true);
    }
  }, [isEditing]);

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
    onChange(null);
  };

  const confirm = () => {
    const canvas = canvasRef.current;
    onChange(canvas.toDataURL("image/png"));
    setIsEditing(false);
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Label row */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold tracking-[1.5px] uppercase" style={{ color: 'var(--mx-muted)' }}>{label}</span>
        <div className="flex gap-1.5">
          {!isEditing && value && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-[6px] text-[10px] font-semibold border border-[#EAEEF5] hover:bg-[#F4F7FC]"
              style={{ color: 'var(--mx-muted)' }}
            >
              <Pencil className="w-3 h-3" /> Re-sign
            </button>
          )}
          {isEditing && (
            <>
              <button
                onClick={clear}
                className="flex items-center gap-1 px-2.5 py-1 rounded-[6px] text-[10px] font-semibold text-[#7A8898] hover:bg-[#F4F7FC] border border-[#EAEEF5]"
              >
                <RotateCcw className="w-3 h-3" /> Clear
              </button>
              {hasStrokes && (
                <button
                  onClick={confirm}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-[6px] text-[10px] font-semibold text-white border border-[#1E4D99]"
                  style={{ background: '#1E4D99' }}
                >
                  <Check className="w-3 h-3" /> Confirm
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Canvas / Preview */}
      {!isEditing && value ? (
        <div className="relative rounded-[10px] border-2 border-[#1E4D99] overflow-hidden">
          <img src={value} alt="Signature" className="w-full object-contain bg-white" style={{ height: 120 }} />
          <div className="absolute top-2 right-2">
            <span className="text-[9px] px-2 py-0.5 rounded-full font-bold bg-[#EDFBF3] text-[#1B7A45] border border-[#C3EDD5]">✓ Signed</span>
          </div>
        </div>
      ) : (
        <div className="relative rounded-[10px] border-2 border-dashed border-[#EAEEF5] overflow-hidden" style={{ background: '#FAFBFD' }}>
          {/* Instruction banner */}
          <div className="flex items-center justify-center gap-2 py-1.5 border-b border-[#EAEEF5] bg-[#F4F7FC]">
            <Pencil className="w-3 h-3" style={{ color: 'var(--mx-muted-2)' }} />
            <span className="text-[9px] font-semibold tracking-[1px] uppercase" style={{ color: 'var(--mx-muted-2)' }}>
              Sign below using finger or stylus
            </span>
          </div>
          <canvas
            ref={canvasRef}
            width={600}
            height={120}
            className="w-full cursor-crosshair touch-none block"
            style={{ height: 120, background: '#fff' }}
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
  );
}