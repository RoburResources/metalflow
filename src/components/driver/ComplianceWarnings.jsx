import { AlertCircle, AlertTriangle, Info, CheckCircle2 } from "lucide-react";

export default function ComplianceWarnings({ flags, canProceed, requiresManualReview }) {
  if (!flags || flags.length === 0) {
    return (
      <div className="rounded-[14px] bg-[#EDFBF3] border border-[#C3EDD5] p-4 flex gap-3 items-start">
        <CheckCircle2 className="w-5 h-5 text-[#1B7A45] shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-bold text-[#1B7A45] uppercase">Compliance Check Passed</p>
          <p className="text-xs text-[#1B7A45]/70 mt-0.5">All weights and material grades are within approved parameters.</p>
        </div>
      </div>
    );
  }

  const errorFlags = flags.filter(f => f.severity === 'error');
  const warningFlags = flags.filter(f => f.severity === 'warning');
  const infoFlags = flags.filter(f => f.severity === 'info');

  return (
    <div className="space-y-3">
      {errorFlags.length > 0 && (
        <div className="rounded-[14px] bg-red-50 border border-red-200 p-4">
          <div className="flex gap-3 items-start">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs font-bold text-red-700 uppercase mb-2">Issues Found</p>
              <ul className="space-y-1">
                {errorFlags.map((flag, idx) => (
                  <li key={idx} className="text-xs text-red-600">• {flag.message}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {warningFlags.length > 0 && (
        <div className="rounded-[14px] bg-amber-50 border border-amber-200 p-4">
          <div className="flex gap-3 items-start">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs font-bold text-amber-700 uppercase mb-2">Review Required</p>
              <ul className="space-y-1">
                {warningFlags.map((flag, idx) => (
                  <li key={idx} className="text-xs text-amber-700">• {flag.message}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {infoFlags.length > 0 && (
        <div className="rounded-[14px] bg-blue-50 border border-blue-200 p-4">
          <div className="flex gap-3 items-start">
            <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <ul className="space-y-1">
                {infoFlags.map((flag, idx) => (
                  <li key={idx} className="text-xs text-blue-600">ℹ {flag.message}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {requiresManualReview && (
        <div className="rounded-[14px] bg-orange-50 border border-orange-200 p-4">
          <p className="text-xs font-bold text-orange-700 uppercase">⚠ Manual Review Flagged</p>
          <p className="text-xs text-orange-700 mt-1">This docket will require manual verification before final approval.</p>
        </div>
      )}
    </div>
  );
}