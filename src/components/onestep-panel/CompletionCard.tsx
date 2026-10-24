import React from 'react';
import { CheckCircle2, ArrowRight, FileText } from 'lucide-react';
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
    <div className="flex-1 flex flex-col overflow-y-auto">
      <div className="px-5 pt-6 pb-4 space-y-5">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-[var(--accent-sage)]/15 text-[var(--accent-sage-strong)] flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-semibold text-[var(--text-primary)] tracking-tight">{details.title}</h2>
          <p className="text-sm text-[var(--text-secondary)]">{details.message}</p>
        </div>

        <div className="rounded-xl border border-[var(--surface-border)] bg-[var(--surface-card)] overflow-hidden">
          <div className="px-3 py-2 border-b border-[var(--surface-border)] bg-[var(--bg-main)]">
            <span className="text-xs font-medium text-[var(--text-primary)]">Summary</span>
          </div>
          <div className="p-3 space-y-1.5">
            {details.highlights.map((h, idx) => (
              <div key={idx} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                <span className="text-[var(--accent-sage)] mt-1">•</span>
                <span>{h}</span>
              </div>
            ))}
          </div>
        </div>

        {details.receiptFileName && onViewReceipt && (
          <button
            onClick={onViewReceipt}
            className="w-full flex items-center justify-between p-3 rounded-xl border border-[var(--surface-border)] bg-[var(--surface-card)] hover:bg-[var(--surface-secondary)] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <FileText className="w-5 h-5 text-[var(--accent-primary)]" />
              <div className="text-left">
                <p className="text-sm font-medium text-[var(--text-primary)]">View preview</p>
                <p className="text-xs text-[var(--text-secondary)] font-mono">{details.receiptFileName}</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-[var(--text-secondary)]" />
          </button>
        )}
      </div>

      <div className="mt-auto px-5 pb-5">
        <button
          onClick={onStartAnotherTask}
          className="w-full py-2.5 px-4 rounded-xl bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-white text-sm font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Start another task</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
