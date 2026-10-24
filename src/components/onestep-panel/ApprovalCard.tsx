import React from 'react';
import { ShieldAlert, CheckCircle2, AlertTriangle, ArrowRight, X, FileText } from 'lucide-react';
import { ApprovalDetails } from '../../types';

interface ApprovalCardProps {
  details: ApprovalDetails;
  onApprove: () => void;
  onReject: () => void;
}

export const ApprovalCard: React.FC<ApprovalCardProps> = ({
  details,
  onApprove,
  onReject,
}) => {
  return (
    <div className="p-4 space-y-4 flex-1 flex flex-col justify-between overflow-y-auto">
      <div className="space-y-4">
        {/* Review Header Banner */}
        <div className="bg-[#FFFDF9] border border-[#C86D51]/30 rounded-xl p-4 shadow-xs">
          <div className="flex items-center gap-2 text-[#C86D51] font-bold text-xs uppercase tracking-wider mb-1">
            <ShieldAlert className="w-4 h-4" />
            <span>Review Before Continuing</span>
          </div>
          <h3 className="text-sm font-bold text-[#2B2825]">
            {details.title}
          </h3>
          <p className="text-xs text-[#6E6860] mt-1 leading-relaxed">
            {details.summary}
          </p>

          <div className="mt-3 p-2.5 rounded-lg bg-[#F7F3EC] border border-[#E5DEC9] flex items-center gap-2 text-xs">
            <FileText className="w-4 h-4 text-[#7656A7] shrink-0" />
            <div className="min-w-0">
              <span className="text-[10px] text-[#6E6860] block">Target Action:</span>
              <span className="font-mono font-semibold text-[#2B2825] truncate block">
                {details.targetFile}
              </span>
            </div>
          </div>
        </div>

        {/* Actions Completed */}
        <div className="bg-[#FFFDF9] border border-[#E5DEC9] rounded-xl p-3.5 shadow-xs space-y-2">
          <span className="text-[10px] font-bold text-[#4A7C59] uppercase tracking-wider block">
            Actions Completed
          </span>
          <div className="space-y-1.5">
            {details.completedActions.map((act, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-[#2B2825]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#4A7C59] shrink-0 mt-0.5" />
                <span>{act}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions Pending */}
        <div className="bg-[#FFFDF9] border border-[#E5DEC9] rounded-xl p-3.5 shadow-xs space-y-2">
          <span className="text-[10px] font-bold text-[#7656A7] uppercase tracking-wider block">
            Actions Pending Approval
          </span>
          <div className="space-y-1.5">
            {details.pendingActions.map((act, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-[#2B2825]">
                <span className="w-3.5 h-3.5 rounded-full bg-[#7656A7]/20 text-[#7656A7] flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  ●
                </span>
                <span>{act}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Potential Impact */}
        <div className="bg-[#F7F3EC] border border-[#E5DEC9] rounded-xl p-3 text-xs space-y-1.5">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#6E6860]">
            <AlertTriangle className="w-3.5 h-3.5 text-[#D97706]" />
            <span>Safety & Potential Impact</span>
          </div>
          {details.impactNotes.map((note, i) => (
            <p key={i} className="text-[11px] text-[#6E6860] leading-relaxed">
              {note}
            </p>
          ))}
        </div>
      </div>

      {/* Decision Buttons */}
      <div className="pt-2 border-t border-[#E5DEC9] space-y-2">
        <button
          onClick={onApprove}
          className="w-full py-2.5 px-4 rounded-xl bg-[#7656A7] hover:bg-[#654791] text-white text-xs font-semibold shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
        >
          <span>Approve & Continue</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={onReject}
          className="w-full py-2 px-4 rounded-xl bg-transparent hover:bg-[#EFE9DF] text-[#6E6860] hover:text-[#2B2825] text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
          <span>Reject / Go Back</span>
        </button>
      </div>
    </div>
  );
};
