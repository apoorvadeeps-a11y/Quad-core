import React from 'react';
import { CheckCircle2, RotateCcw, FileText, ArrowRight, ExternalLink } from 'lucide-react';
import { CompletionDetails } from '../../types';

interface CompletionCardProps {
  details: CompletionDetails;
  onStartAnotherTask: () => void;
  onViewReceipt?: () => void;
}

export const CompletionCard: React.FC<CompletionCardProps> = ({
  details,
  onStartAnotherTask,
  onViewReceipt,
}) => {
  return (
    <div className="p-5 space-y-5 flex-1 flex flex-col justify-between overflow-y-auto">
      <div className="space-y-5">
        {/* Success Icon & Header */}
        <div className="text-center pt-3">
          <div className="w-12 h-12 rounded-full bg-[#4A7C59]/15 text-[#4A7C59] flex items-center justify-center mx-auto mb-3 shadow-xs">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-[#2B2825]">
            {details.title || 'Task Complete'}
          </h2>
          <p className="text-xs text-[#6E6860] mt-1 max-w-xs mx-auto">
            {details.message}
          </p>
        </div>

        {/* Highlights Checklist */}
        <div className="bg-[#FFFDF9] border border-[#E5DEC9] rounded-xl p-4 shadow-xs space-y-2.5">
          <span className="text-[10px] font-bold text-[#6E6860] uppercase tracking-wider block">
            Execution Summary
          </span>
          <div className="space-y-2">
            {details.highlights.map((highlight, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-[#2B2825]">
                <CheckCircle2 className="w-4 h-4 text-[#4A7C59] shrink-0 mt-0.5" />
                <span>{highlight}</span>
              </div>
            ))}
          </div>
        </div>

        {/* View Receipt Button if receipt downloaded */}
        {details.receiptFileName && onViewReceipt && (
          <div className="p-3.5 rounded-xl border border-[#7656A7]/30 bg-[#7656A7]/5 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <FileText className="w-4 h-4 text-[#7656A7] shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[#2B2825] truncate">
                  {details.receiptFileName}
                </p>
                <p className="text-[10px] text-[#6E6860]">
                  PDF Document · Verified Digital Copy
                </p>
              </div>
            </div>
            <button
              onClick={onViewReceipt}
              className="px-2.5 py-1.5 rounded-lg bg-[#7656A7] hover:bg-[#654791] text-white text-[11px] font-semibold cursor-pointer shrink-0 transition-colors shadow-xs"
            >
              View File
            </button>
          </div>
        )}
      </div>

      {/* Restart Button */}
      <div className="pt-3 border-t border-[#E5DEC9]">
        <button
          onClick={onStartAnotherTask}
          className="w-full py-2.5 px-4 rounded-xl bg-[#2B2825] hover:bg-[#1C1A18] text-white text-xs font-semibold shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Start another task</span>
        </button>
      </div>
    </div>
  );
};
