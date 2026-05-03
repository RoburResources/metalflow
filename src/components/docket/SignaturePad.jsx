import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RotateCcw, Check } from "lucide-react";

export default function SignaturePad({ label, value, onChange }) {
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [hasStrokes, setHasStrokes] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // If there's a saved value, draw it
    if (value) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0);
      img.src = value;
      setHasStrokes(true);
    }
  }, []);

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const startDraw = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    ctx.strokeStyle = "#0D1A2E";
    ctx.lineWidth = 2;
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
  };

  const endDraw = (e) => {
    e.preventDefault();
    setDrawing(false);
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
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold tracking-[1.5px] uppercase" style={{ color: 'var(--mx-muted)' }}>{label}</span>
        <div className="flex gap-1">
          <button onClick={clear} className="flex items-center gap-1 px-2 py-1 rounded-[6px] text-[10px] font-semibold text-[#7A8898] hover:bg-[#F4F7FC] border border-[#EAEEF5]">
            <RotateCcw className="w-3 h-3" /> Clear
          </button>
          {hasStrokes && (
            <button onClick={confirm} className="flex items-center gap-1 px-2 py-1 rounded-[6px] text-[10px] font-semibold text-white border border-[#1E4D99]" style={{ background: '#1E4D99' }}>
              <Check className="w-3 h-3" /> Confirm
            </button>
          )}
        </div>
      </div>
      <div className={`relative rounded-[10px] border-2 overflow-hidden ${value ? 'border-[#1E4D99]' : 'border-[#EAEEF5] border-dashed'}`}>
        {value && !drawing ? (
          <div className="relative">
            <img src={value} alt="Signature" className="w-full h-20 object-contain bg-white" />
            <div className="absolute top-1 right-1">
              <span className="text-[9px] px-2 py-0.5 rounded-full font-bold bg-[#EDFBF3] text-[#1B7A45] border border-[#C3EDD5]">✓ Signed</span>
            </div>
          </div>
        ) : (
          <>
            <canvas
              ref={canvasRef}
              width={400}
              height={80}
              className="w-full h-20 cursor-crosshair touch-none"
              style={{ background: '#fff' }}
              onMouseDown={startDraw}
              onMouseMove={draw}
              onMouseUp={endDraw}
              onMouseLeave={endDraw}
              onTouchStart={startDraw}
              onTouchMove={draw}
              onTouchEnd={endDraw}
            />
            {!hasStrokes && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-[11px]" style={{ color: 'var(--mx-muted-2)' }}>Sign here with finger or stylus</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}