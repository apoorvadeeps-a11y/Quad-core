import React from 'react';
import { Sparkles, Home } from 'lucide-react';
import { StartScreen } from './StartScreen';
import { GuideView } from './GuideView';
import { AgentView } from './AgentView';
import { ApprovalCard } from './ApprovalCard';
import { CompletionCard } from './CompletionCard';
import { WrongTurnCard } from './WrongTurnCard';
import {
  AssistantMode,
  AgentStatus,
  WorkflowDefinition,
  ActivityLogItem,
  PortalRoute,
} from '../../types';

interface OneStepPanelProps {
  mode: AssistantMode;
  agentStatus: AgentStatus;
  workflow: WorkflowDefinition | null;
  currentStepIndex: number;
  activityLogs: ActivityLogItem[];
  agentSpeed: number;
  wrongTurn: {
    currentRoute: PortalRoute;
    expectedRoute: PortalRoute;
    expectedInstruction: string;
  } | null;
  onStartWorkflow: (goalText: string, mode: 'guide' | 'agent') => void;
  onShowMe: () => void;
  onImStuck: () => void;
  onPerformStepForMe: () => void;
  onSwitchToAgent: () => void;
  onTogglePauseAgent: () => void;
  onStopAgent: () => void;
  onChangeSpeed: (ms: number) => void;
  onApproveAction: () => void;
  onRejectAction: () => void;
  onResetToStart: () => void;
  onRecoverRoute: () => void;
  onDismissWrongTurn: () => void;
  onViewReceipt: () => void;
}

export const OneStepPanel: React.FC<OneStepPanelProps> = ({
  mode,
  agentStatus,
  workflow,
  currentStepIndex,
  activityLogs,
  agentSpeed,
  wrongTurn,
  onStartWorkflow,
  onShowMe,
  onImStuck,
  onPerformStepForMe,
  onSwitchToAgent,
  onTogglePauseAgent,
  onStopAgent,
  onChangeSpeed,
  onApproveAction,
  onRejectAction,
  onResetToStart,
  onRecoverRoute,
  onDismissWrongTurn,
  onViewReceipt,
}) => {
  return (
    <div className="flex-1 flex flex-col h-full bg-[var(--surface-card)] select-none min-w-[280px] overflow-hidden">
      <div className="px-4 py-3 border-b border-[var(--surface-border)] flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[var(--accent-primary)] text-white flex items-center justify-center shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-semibold text-[var(--text-primary)] tracking-tight">
                OneStep
              </h1>
              <span className="text-[10px] font-medium text-[var(--accent-primary)] bg-[var(--accent-primary)]/8 px-1.5 py-0.5 rounded-full">
                Assistant
              </span>
            </div>
            <p className="text-[11px] text-[var(--text-secondary)]">
              {mode === 'idle' ? 'Ready to help' : mode === 'guide' ? 'Guide Me' : 'Do It For Me'}
            </p>
          </div>
        </div>

        {mode !== 'idle' && (
          <button
            onClick={onResetToStart}
            className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-secondary)] transition-colors cursor-pointer"
            title="Return to start"
            aria-label="Return to start"
          >
            <Home className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Wrong Turn Alert (if triggered during Guide mode) */}
      {wrongTurn && mode === 'guide' && (
        <WrongTurnCard
          currentRoute={wrongTurn.currentRoute}
          expectedRoute={wrongTurn.expectedRoute}
          expectedInstruction={wrongTurn.expectedInstruction}
          onRecoverRoute={onRecoverRoute}
          onDismiss={onDismissWrongTurn}
        />
      )}

      {/* Main View Switcher */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {mode === 'idle' && (
          <StartScreen onStartWorkflow={onStartWorkflow} />
        )}

        {mode === 'guide' && workflow && (
          agentStatus === 'completed' ? (
            <CompletionCard
              details={workflow.completionDetails}
              onStartAnotherTask={onResetToStart}
              onViewReceipt={onViewReceipt}
            />
          ) : (
            <GuideView
              workflow={workflow}
              currentStepIndex={currentStepIndex}
              onShowMe={onShowMe}
              onImStuck={onImStuck}
              onPerformStepForMe={onPerformStepForMe}
              onSwitchToAgent={onSwitchToAgent}
            />
          )
        )}

        {mode === 'agent' && workflow && (
          agentStatus === 'approval_required' ? (
            <ApprovalCard
              details={workflow.approvalDetails}
              onApprove={onApproveAction}
              onReject={onRejectAction}
            />
          ) : agentStatus === 'completed' ? (
            <CompletionCard
              details={workflow.completionDetails}
              onStartAnotherTask={onResetToStart}
              onViewReceipt={onViewReceipt}
            />
          ) : (
            <AgentView
              workflow={workflow}
              currentStepIndex={currentStepIndex}
              agentStatus={agentStatus}
              activityLogs={activityLogs}
              agentSpeed={agentSpeed}
              onTogglePause={onTogglePauseAgent}
              onStop={onStopAgent}
              onChangeSpeed={onChangeSpeed}
            />
          )
        )}
      </div>
    </div>
  );
};
