import React from 'react';
import { ShieldCheck, Check, X, FileText } from 'lucide-react';
import { ApprovalDetails } from '../../types';

interface ApprovalCardProps {
  details: ApprovalDetails;
  onApprove: () => void;
  onReject: () => void;
}

export const ApprovalCard: React.FC<ApprovalCardProps> = ({ details, onApprove, onReject }) => {
  return (
    <div className="flex-1 flex flex-col overflow-y-auto">
      <div className="px-5 pt-5 pb-4 space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-[var(--accent-peach)]/40 text-[var(--accent-warn)] flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-[var(--text-primary)]">{details.title}</h2>
            <p className="text-sm text-[var(--text-secondary)]">Review before continuing</p>
          </div>
        </div>

        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{details.summary}</p>

        <div className="rounded-xl border border-[var(--surface-border)] bg-[var(--bg-main)] p-3 flex items-center gap-2.5">
          <FileText className="w-5 h-5 text-[var(--accent-primary)]" />
          <div>
            <p className="text-xs text-[var(--text-secondary)]">Output</p>
            <p className="text-sm text-[var(--text-primary)] font-mono">{details.targetFile}</p>
          </div>
        </div>

        <div className="rounded-xl border border-[var(--surface-border)] bg-[var(--surface-card)] overflow-hidden">
          <div className="px-3 py-2 border-b border-[var(--surface-border)] bg-[var(--bg-main)]">
            <span className="text-xs font-medium text-[var(--text-primary)]">Review</span>
          </div>
          <div className="p-3 space-y-3">
            {details.completedActions.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs text-[var(--accent-sage-strong)]">Completed</p>
                <ul className="space-y-1">
                  {details.completedActions.map((action, idx) => (
                    <li key={idx} className="flex items-start gap-1.5 text-sm text-[var(--text-secondary)]">
                      <Check className="w-4 h-4 text-[var(--accent-sage)] shrink-0 mt-0.5" />
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {details.pendingActions.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs text-[var(--accent-warn)]">Pending</p>
                <ul className="space-y-1">
                  {details.pendingActions.map((action, idx) => (
                    <li key={idx} className="flex items-start gap-1.5 text-sm text-[var(--text-secondary)]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-warn)] mt-1.5 shrink-0" />
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-[var(--surface-border)] bg-[var(--bg-main)] p-3 space-y-1.5">
          <p className="text-xs font-medium text-[var(--text-primary)]">Notes</p>
          <ul className="space-y-1">
            {details.impactNotes.map((note, idx) => (
              <li key={idx} className="text-sm text-[var(--text-secondary)]">• {note}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-auto px-5 pb-5 space-y-2">
        <button
          onClick={onApprove}
          className="w-full py-2.5 px-4 rounded-xl bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-white text-sm font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <Check className="w-4 h-4" />
          <span>Approve and continue</span>
        </button>
        <button
          onClick={onReject}
          className="w-full py-2.5 px-4 rounded-xl border border-[var(--surface-border)] bg-[var(--surface-card)] hover:bg-[var(--surface-secondary)] text-sm text-[var(--text-primary)] transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <X className="w-4 h-4" />
          <span>Reject and stop</span>
        </button>
      </div>
    </div>
  );
};
