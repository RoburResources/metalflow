import { useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Camera, X, Upload, Image } from "lucide-react";

export default function PhotoUpload({ photos = [], onChange }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleFiles = async (files) => {
    setUploading(true);
    const uploaded = [];
    for (const file of Array.from(files)) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      uploaded.push(file_url);
    }
    onChange([...photos, ...uploaded]);
    setUploading(false);
  };

  const remove = (idx) => onChange(photos.filter((_, i) => i !== idx));

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold tracking-[1.5px] uppercase" style={{ color: 'var(--mx-muted)' }}>Photos</span>
        <span className="text-[10px]" style={{ color: 'var(--mx-muted-2)' }}>{photos.length} attached</span>
      </div>

      {/* Gallery grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {photos.map((url, i) => (
            <div key={i} className="relative group rounded-[8px] overflow-hidden border border-[#EAEEF5] aspect-square bg-[#F4F7FC]">
              <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
              <button
                onClick={() => remove(i)}
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3 text-white" />
              </button>
              <div className="absolute bottom-1 left-1 text-[9px] bg-black/50 text-white px-1.5 py-0.5 rounded-full font-semibold">
                {i + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload zone */}
      <button
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="w-full flex flex-col items-center gap-2 py-5 rounded-[10px] border-2 border-dashed border-[#EAEEF5] hover:border-[#1E4D99] hover:bg-[#EFF4FF] transition-all"
      >
        {uploading ? (
          <div className="w-6 h-6 rounded-full border-2 border-[#EAEEF5] border-t-[#1E4D99] animate-spin" />
        ) : (
          <div className="w-8 h-8 rounded-[8px] bg-[#EFF4FF] flex items-center justify-center">
            <Camera className="w-4 h-4 text-[#1E4D99]" />
          </div>
        )}
        <span className="text-xs font-semibold" style={{ color: uploading ? 'var(--mx-muted-2)' : '#1E4D99' }}>
          {uploading ? 'Uploading…' : 'Add Photos'}
        </span>
        <span className="text-[10px]" style={{ color: 'var(--mx-muted-2)' }}>Material, weighbridge screen, or vehicle</span>
      </button>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={e => handleFiles(e.target.files)}
      />
    </div>
  );
}