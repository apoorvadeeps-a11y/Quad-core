import React from 'react';
import { Sparkles, Home, Settings } from 'lucide-react';
import { StartScreen } from './StartScreen';
import { GuideView } from './GuideView';
import { AgentView } from './AgentView';
import { ApprovalCard } from './ApprovalCard';
import { CompletionCard } from './CompletionCard';
import { WrongTurnCard } from './WrongTurnCard';
import { FormAutofillCard } from './FormAutofillCard';
import {
  AssistantMode,
  AgentStatus,
  WorkflowDefinition,
  ActivityLogItem,
  PortalRoute,
} from '../../types';
import { AutofillMapping } from '../../extension/types';

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
  pendingAutofillMappings: AutofillMapping[] | null;
  ollamaModelTag: string;
  ollamaBaseUrl: string;
  onOpenSettings: () => void;
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
  onApproveAutofill: (approved: AutofillMapping[]) => void;
  onCancelAutofill: () => void;
  onResetToStart: () => void;
  onRecoverRoute: () => void;
  onDismissWrongTurn: () => void;
  onViewReceipt: () => void;
  onClosePanel?: () => void;
}

export const OneStepPanel: React.FC<OneStepPanelProps> = ({
  mode,
  agentStatus,
  workflow,
  currentStepIndex,
  activityLogs,
  agentSpeed,
  wrongTurn,
  pendingAutofillMappings,
  ollamaModelTag,
  ollamaBaseUrl,
  onOpenSettings,
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
  onApproveAutofill,
  onCancelAutofill,
  onResetToStart,
  onRecoverRoute,
  onDismissWrongTurn,
  onViewReceipt,
  onClosePanel,
}) => {
  return (
    <div className="flex-1 flex flex-col h-full bg-[#FFFDF9] select-none min-w-[260px] overflow-hidden">
      {/* Header */}
      <div className="p-3.5 border-b border-[#E5DEC9] bg-[#F7F3EC]/70 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#7656A7] text-white flex items-center justify-center shadow-2xs font-bold text-xs">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-bold text-[#2B2825] tracking-tight">
                OneStep
              </h1>
              <span className="text-[10px] font-semibold text-[#7656A7] bg-[#7656A7]/10 px-1.5 py-0.2 rounded-sm font-mono">
                Ext v2.0
              </span>
            </div>
            <p className="text-[11px] text-[#6E6860]">AI Navigation Assistant (Qwen 2.5)</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={onOpenSettings}
            className="p-1.5 rounded-lg text-[#6E6860] hover:text-[#2B2825] hover:bg-[#EFE9DF] transition-colors cursor-pointer text-xs"
            title="Ollama & Autofill Settings"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
          {mode !== 'idle' && (
            <button
              onClick={onResetToStart}
              className="p-1.5 rounded-lg text-[#6E6860] hover:text-[#2B2825] hover:bg-[#EFE9DF] transition-colors cursor-pointer text-xs flex items-center gap-1"
              title="Return to start screen"
            >
              <Home className="w-3.5 h-3.5" />
              <span className="hidden xl:inline text-[11px]">Home</span>
            </button>
          )}
          {onClosePanel && (
            <button
              onClick={onClosePanel}
              className="p-1.5 rounded-lg text-[#6E6860] hover:text-[#C86D51] hover:bg-[#C86D51]/10 transition-colors cursor-pointer text-xs flex items-center"
              title="Close OneStep Side Panel"
            >
              <span className="text-base leading-none font-bold">×</span>
            </button>
          )}
        </div>
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
        {/* If Form Autofill review is active */}
        {pendingAutofillMappings && pendingAutofillMappings.length > 0 ? (
          <FormAutofillCard
            mappings={pendingAutofillMappings}
            onApproveAutofill={onApproveAutofill}
            onCancel={onCancelAutofill}
          />
        ) : mode === 'idle' ? (
          <StartScreen
            onStartWorkflow={onStartWorkflow}
            ollamaModelTag={ollamaModelTag}
            ollamaBaseUrl={ollamaBaseUrl}
            onOpenSettings={onOpenSettings}
          />
        ) : mode === 'guide' && workflow ? (
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
        ) : mode === 'agent' && workflow ? (
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
        ) : null}
      </div>
    </div>
  );
};
