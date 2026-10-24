import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Clock, CheckCircle2, CircleDot, Circle } from 'lucide-react';
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
  const [showFullLog, setShowFullLog] = useState(false);

  return (
    <div className="space-y-3">
      {/* Visual Step Activity List */}
      <div className="bg-[#FFFDF9] border border-[#E5DEC9] rounded-xl p-3.5 shadow-xs space-y-2.5">
        <span className="text-[10px] font-bold text-[#6E6860] uppercase tracking-wider block">
          Activity Timeline
        </span>
        <div className="space-y-2">
          {steps.map((st, idx) => {
            const isCompleted = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            const isPending = idx > currentStepIndex;

            return (
              <div
                key={st.id}
                className={`flex items-start gap-2.5 text-xs transition-colors p-2 rounded-lg ${
                  isCurrent
                    ? 'bg-[#7656A7]/10 text-[#7656A7] font-semibold'
                    : isCompleted
                    ? 'text-[#2B2825]'
                    : 'text-[#6E6860]/70'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {isCompleted ? (
                    <span className="text-[#4A7C59] font-bold text-xs">✓</span>
                  ) : isCurrent ? (
                    <span className="w-2.5 h-2.5 rounded-full bg-[#7656A7] block animate-ping" />
                  ) : (
                    <span className="w-2.5 h-2.5 rounded-full border border-[#DCD3BE] block" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="truncate font-medium">{st.instruction}</p>
                    {isCompleted && (
                      <span className="text-[10px] text-[#4A7C59] font-mono tabular-nums">
                        Completed
                      </span>
                    )}
                    {isCurrent && (
                      <span className="text-[10px] text-[#7656A7] font-semibold animate-pulse">
                        In progress
                      </span>
                    )}
                  </div>
                  {isCurrent && (
                    <p className="text-[11px] text-[#6E6860] font-normal mt-0.5">
                      {st.subText}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Expandable Activity Log with Timestamps */}
      <div className="bg-[#FFFDF9] border border-[#E5DEC9] rounded-xl p-3 shadow-xs">
        <button
          onClick={() => setShowFullLog(!showFullLog)}
          className="w-full flex items-center justify-between text-xs font-semibold text-[#6E6860] hover:text-[#2B2825] cursor-pointer"
        >
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#7656A7]" />
            <span>Activity Log ({activityLogs.length})</span>
          </div>
          {showFullLog ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {showFullLog && (
          <div className="mt-2.5 pt-2 border-t border-[#E5DEC9] max-h-40 overflow-y-auto space-y-1.5 font-mono text-[11px] tabular-nums pr-1">
            {activityLogs.map((log) => (
              <div key={log.id} className="flex items-start gap-2 py-1 text-[#6E6860]">
                <span className="text-[#A09A90] shrink-0 font-medium">{log.timestamp}</span>
                <span className="text-[#2B2825] font-sans flex-1">{log.message}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
