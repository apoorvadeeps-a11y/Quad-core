import React from 'react';
import { CheckCircle2, Circle } from 'lucide-react';
import { ActivityLogItem, WorkflowStep } from '../../types';

interface ActivityTimelineProps {
  steps: WorkflowStep[];
  currentStepIndex: number;
  activityLogs: ActivityLogItem[];
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({
  steps,
  currentStepIndex,
  activityLogs,
}) => {
  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-[var(--surface-border)] bg-[var(--surface-card)] overflow-hidden">
        <div className="px-3 py-2 border-b border-[var(--surface-border)] bg-[var(--bg-main)]">
          <span className="text-xs font-medium text-[var(--text-primary)]">Steps</span>
        </div>
        <div className="divide-y divide-[var(--surface-border)]">
          {steps.map((st, idx) => {
            const isCompleted = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            return (
              <div key={st.id} className={`flex items-start gap-2.5 px-3 py-2 ${isCurrent ? 'bg-[var(--accent-primary)]/5' : ''}`}>
                <span className={`mt-0.5 ${isCompleted ? 'text-[var(--accent-sage)]' : isCurrent ? 'text-[var(--accent-primary)]' : 'text-[var(--text-muted)]'}`}>
                  {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : isCurrent ? <Circle className="w-4 h-4 fill-[var(--accent-primary)]/20" /> : <Circle className="w-4 h-4" />}
                </span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${isCurrent ? 'font-medium text-[var(--text-primary)]' : isCompleted ? 'text-[var(--text-secondary)]' : 'text-[var(--text-secondary)]'}`}>
                    {st.instruction}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {activityLogs.length > 0 && (
        <div className="rounded-xl border border-[var(--surface-border)] bg-[var(--surface-card)] overflow-hidden">
          <div className="px-3 py-2 border-b border-[var(--surface-border)] bg-[var(--bg-main)]">
            <span className="text-xs font-medium text-[var(--text-primary)]">Log</span>
          </div>
          <div className="max-h-40 overflow-y-auto divide-y divide-[var(--surface-border)]">
            {activityLogs.map((log) => (
              <div key={log.id} className="flex items-start justify-between gap-2 px-3 py-1.5">
                <p className="text-xs text-[var(--text-primary)] flex-1">{log.message}</p>
                <span className="text-[11px] text-[var(--text-secondary)] font-mono tabular-nums">{log.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
