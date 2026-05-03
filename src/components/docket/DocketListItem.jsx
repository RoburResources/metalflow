import { FileText, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

const statusColors = {
  Draft: 'bg-[#F4F7FC] text-[#7A8898] border-[#EAEEF5]',
  Pending: 'bg-[#EFF4FF] text-[#1E4D99] border-[#DCE9FA]',
  Verified: 'bg-[#EDFBF3] text-[#1B7A45] border-[#C3EDD5]',
  Archived: 'bg-[#F4F4F6] text-[#AAB0C4] border-[#EAEEF5]',
};

export default function DocketListItem({ docket, onOpen, onDelete }) {
  const statusClass = statusColors[docket.status] || statusColors.Draft;
  return (
    <div className="flex items-center gap-4 px-5 py-4 hover:bg-[#F4F7FC] transition-colors border-b border-[#EAEEF5] last:border-b-0">
      <div className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0" style={{ background: '#EFF4FF' }}>
        <FileText className="w-4 h-4" style={{ color: '#1E4D99' }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-700 truncate" style={{ color: 'var(--mx-text)', fontWeight: 700 }}>{docket.ticket_no || 'Untitled'}</span>
          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${statusClass}`}>{docket.status || 'Draft'}</span>
        </div>
        <div className="flex items-center gap-3 mt-0.5">
          {docket.bill_to_name && <span className="text-xs" style={{ color: 'var(--mx-muted)' }}>{docket.bill_to_name}</span>}
          {docket.order_date && <span className="text-xs" style={{ color: 'var(--mx-muted-2)' }}>{docket.order_date}</span>}
          {docket.net_tonnes && <span className="text-xs font-600" style={{ color: '#1E4D99', fontWeight: 600 }}>Net: {parseFloat(docket.net_tonnes).toFixed(2)}t</span>}
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <Button size="icon" variant="ghost" onClick={() => onOpen(docket)} className="w-8 h-8 hover:bg-[#EFF4FF] text-[#1E4D99]">
          <Eye className="w-4 h-4" />
        </Button>
        <Button size="icon" variant="ghost" onClick={() => onDelete(docket)} className="w-8 h-8 hover:bg-red-50 text-[#7A8898] hover:text-red-500">
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}