import { useState, useRef } from "react";
import { X, Pen } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PhotoAnnotation({ photoUrl, onAnnotationSave, onClose }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#FF0000");
  const [lineWidth, setLineWidth] = useState(3);

  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setIsDrawing(true);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const handleMouseUp = () => setIsDrawing(false);

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const annotatedUrl = canvas.toDataURL("image/png");
      onAnnotationSave(annotatedUrl);
      onClose();
    }
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      };
      img.src = photoUrl;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full">
        <div className="flex justify-between items-center p-4 border-b">
          <div className="flex items-center gap-2">
            <Pen className="w-4 h-4 text-[#1E4D99]" />
            <h3 className="font-bold text-[#1E4D99]">ANNOTATE PHOTO</h3>
          </div>
          <button onClick={onClose} className="text-[#7A8898] hover:text-[#0D1A2E]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          <canvas
            ref={canvasRef}
            width={600}
            height={400}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="w-full border border-[#EAEEF5] rounded-lg cursor-crosshair mb-4 bg-gray-100"
            onLoad={() => {
              const img = new Image();
              img.onload = () => {
                const canvas = canvasRef.current;
                if (canvas) {
                  const ctx = canvas.getContext("2d");
                  ctx.drawImage(img, 0, 0);
                }
              };
              img.src = photoUrl;
            }}
          />

          <div className="grid grid-cols-3 gap-3 mb-4">
            <div>
              <label className="text-xs font-bold text-[#7A8898]">BRUSH COLOR</label>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-full h-10 rounded cursor-pointer"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#7A8898]">LINE WIDTH</label>
              <input
                type="range"
                min="1"
                max="10"
                value={lineWidth}
                onChange={(e) => setLineWidth(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
            <div className="flex items-end gap-2">
              <Button
                onClick={handleClear}
                variant="outline"
                className="flex-1 h-10 text-xs"
              >
                CLEAR
              </Button>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 h-10"
            >
              CANCEL
            </Button>
            <Button
              onClick={handleSave}
              style={{ background: "var(--mx-hero-gradient)" }}
              className="flex-1 h-10 text-white font-bold"
            >
              SAVE ANNOTATION
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}