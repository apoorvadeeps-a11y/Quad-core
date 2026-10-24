import React from 'react';
import { Play, Pause, Square, Bot, FastForward } from 'lucide-react';
import { ActivityTimeline } from './ActivityTimeline';
import { WorkflowDefinition, ActivityLogItem, AgentStatus } from '../../types';

interface AgentViewProps {
  workflow: WorkflowDefinition;
  currentStepIndex: number;
  agentStatus: AgentStatus;
  activityLogs: ActivityLogItem[];
  agentSpeed: number;
  onTogglePause: () => void;
  onStop: () => void;
  onChangeSpeed: (ms: number) => void;
}

export const AgentView: React.FC<AgentViewProps> = ({
  workflow,
  currentStepIndex,
  agentStatus,
  activityLogs,
  agentSpeed,
  onTogglePause,
  onStop,
  onChangeSpeed,
}) => {
  const isRunning = agentStatus === 'running';

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="px-5 pt-5 pb-4 border-b border-[var(--surface-border)] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">Do It For Me</h2>
              <p className="text-xs text-[var(--text-secondary)] truncate max-w-[200px]">{workflow.title}</p>
            </div>
          </div>
          <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs ${
            isRunning ? 'bg-[var(--accent-sage)]/10 text-[var(--accent-sage-strong)]' : 'bg-[var(--surface-secondary)] text-[var(--text-secondary)]'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isRunning ? 'bg-[var(--accent-sage)]' : 'bg-[var(--text-secondary)]'}`} />
            <span className="capitalize">{agentStatus.replace('_', ' ')}</span>
          </div>
        </div>

        <div className="rounded-xl border border-[var(--surface-border)] bg-[var(--bg-main)] px-3 py-2">
          <p className="text-xs text-[var(--text-secondary)]">Current action</p>
          <p className="text-sm text-[var(--text-primary)]">
            {workflow.steps[currentStepIndex]?.instruction || 'Preparing...'}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-[var(--text-secondary)]">Speed</span>
          <div className="flex items-center gap-1 bg-[var(--bg-main)] p-0.5 rounded-lg border border-[var(--surface-border)]">
            <button
              onClick={() => onChangeSpeed(1400)}
              className={`px-2 py-0.5 rounded-md text-xs transition-colors cursor-pointer ${
                agentSpeed >= 1000 ? 'bg-[var(--surface-card)] text-[var(--accent-primary)]' : 'text-[var(--text-secondary)]'
              }`}
            >
              1x
            </button>
            <button
              onClick={() => onChangeSpeed(700)}
              className={`px-2 py-0.5 rounded-md text-xs transition-colors cursor-pointer flex items-center gap-1 ${
                agentSpeed < 1000 ? 'bg-[var(--surface-card)] text-[var(--accent-primary)]' : 'text-[var(--text-secondary)]'
              }`}
            >
              <FastForward className="w-3 h-3" />
              2x
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        <ActivityTimeline steps={workflow.steps} currentStepIndex={currentStepIndex} activityLogs={activityLogs} />
      </div>

      <div className="px-5 pb-5 pt-2 border-t border-[var(--surface-border)] flex items-center gap-2">
        <button
          onClick={onTogglePause}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-white text-sm font-medium transition-colors cursor-pointer"
        >
          {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          <span>{isRunning ? 'Pause' : 'Resume'}</span>
        </button>
        <button
          onClick={onStop}
          className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-[var(--surface-border)] bg-[var(--surface-card)] hover:bg-[var(--surface-secondary)] text-sm text-[var(--text-primary)] transition-colors cursor-pointer"
        >
          <Square className="w-3.5 h-3.5" />
          <span>Stop</span>
        </button>
      </div>
    </div>
  );
};
