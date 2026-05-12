import { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, CheckCircle2, Camera, Upload, AlertCircle } from 'lucide-react';
import { preprocessDocumentImage } from '@/lib/document-scanner';

export default function OCRScanPanel({ onExtracted }) {
  const [status, setStatus] = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef();

  const handleFile = async (file) => {
    if (!file) return;
    setStatus('uploading');
    setErrorMsg('');
    try {
      const processedBlob = await preprocessDocumentImage(file);
      const processedFile = new File([processedBlob], file.name, { type: 'image/jpeg' });
      const { file_url } = await base44.integrations.Core.UploadFile({ file: processedFile });
      setStatus('extracting');
      const response = await base44.functions.invoke('extractDocketData', { file_url });
      const extracted = response.data;
      if (extracted.error) {
        setErrorMsg(extracted.error || 'Unable to read ticket. Please ensure the document is clear and well-lit.');
        setStatus('error');
        return;
      }
      onExtracted(extracted);
      setStatus('done');
      setTimeout(() => setStatus('idle'), 4000);
    } catch (err) {
      console.error('OCR error:', err);
      setErrorMsg(err.message || 'Could not process document. Ensure good lighting and clear document.');
      setStatus('error');
    }
  };

  if (status === 'idle') return (
    <>
      <input ref={fileInputRef} type="file" accept="image/*,application/pdf" capture="environment" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }} />
      <button onClick={() => fileInputRef.current?.click()}
        className="w-full flex items-center justify-center gap-4 py-6 rounded-[16px] border-2 border-dashed border-[#DCE9FA] bg-[#EFF4FF] hover:bg-[#E5EEFB] hover:border-[#1E4D99] transition-all group"
        aria-label="Scan weighbridge ticket">
        <div className="w-12 h-12 rounded-full bg-[#1E4D99] flex items-center justify-center group-hover:scale-105 transition-transform shadow-lg">
          <Camera className="w-6 h-6 text-white" />
        </div>
        <div className="text-left">
          <p className="text-sm font-bold text-[#1E4D99]">SCAN WEIGHBRIDGE TICKET</p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--mx-muted)' }}>Take a photo or upload to auto-fill weights</p>
        </div>
        <Upload className="w-4 h-4 ml-auto mr-2" style={{ color: 'var(--mx-muted-2)' }} />
      </button>
    </>
  );

  if (status === 'uploading' || status === 'extracting') return (
    <div className="w-full flex items-center justify-center gap-4 py-6 rounded-[16px] border border-[#DCE9FA] bg-[#EFF4FF]">
      <Loader2 className="w-6 h-6 text-[#1E4D99] animate-spin" aria-hidden="true" />
      <div>
        <p className="text-sm font-bold text-[#1E4D99]">{status === 'uploading' ? 'UPLOADING…' : 'PROCESSING DOCUMENT…'}</p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--mx-muted)' }}>This only takes a moment</p>
      </div>
    </div>
  );

  if (status === 'done') return (
    <div className="w-full flex items-center justify-center gap-4 py-6 rounded-[16px] border border-[#C3EDD5] bg-[#EDFBF3]">
      <CheckCircle2 className="w-6 h-6 text-[#1B7A45]" aria-hidden="true" />
      <div>
        <p className="text-sm font-bold text-[#1B7A45]">TICKET SCANNED SUCCESSFULLY!</p>
        <p className="text-xs mt-0.5 text-[#1B7A45]/70">Weight fields auto-filled — review below</p>
      </div>
    </div>
  );

  return (
    <div className="w-full rounded-[16px] border border-red-200 bg-red-50 p-4" role="alert">
      <div className="flex items-center gap-2 mb-1">
        <AlertCircle className="w-4 h-4 text-red-500" aria-hidden="true" />
        <p className="text-sm font-bold text-red-600">COULD NOT READ TICKET</p>
      </div>
      <p className="text-xs text-red-500 mb-2">{errorMsg}</p>
      <button onClick={() => setStatus('idle')} className="text-xs font-semibold text-red-600 underline hover:no-underline">
        Try again
      </button>
    </div>
  );
}