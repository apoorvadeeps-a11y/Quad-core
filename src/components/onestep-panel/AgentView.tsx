import React from 'react';
import { Play, Pause, Square, Wand2, Target, Gauge } from 'lucide-react';
import { ActivityTimeline } from './ActivityTimeline';
import { WorkflowDefinition, ActivityLogItem, AgentStatus } from '../../types';

interface AgentViewProps {
  workflow: WorkflowDefinition;
  currentStepIndex: number;
  agentStatus: AgentStatus;
  activityLogs: ActivityLogItem[];
  agentSpeed: number; // in milliseconds
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
    <div className="p-4 space-y-4 flex-1 flex flex-col justify-between overflow-y-auto">
      <div className="space-y-4">
        {/* Status Header */}
        <div className="bg-[#FFFDF9] border border-[#E5DEC9] rounded-xl p-3.5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  isRunning ? 'bg-[#7656A7] animate-ping' : 'bg-[#D97706]'
                }`}
              />
              <span
                className={`text-xs font-bold ${
                  isRunning ? 'text-[#7656A7]' : 'text-[#D97706]'
                }`}
              >
                {isRunning ? 'Agent Running' : 'Agent Paused'}
              </span>
            </div>

            {/* Speed toggle */}
            <div className="flex items-center gap-1 bg-[#F7F3EC] p-0.5 rounded-lg border border-[#E5DEC9] text-[10px]">
              <button
                onClick={() => onChangeSpeed(1500)}
                className={`px-1.5 py-0.5 rounded font-medium cursor-pointer transition-colors ${
                  agentSpeed >= 1200 ? 'bg-[#FFFDF9] text-[#7656A7] shadow-2xs font-bold' : 'text-[#6E6860]'
                }`}
                title="Normal speed (1.5s per action)"
              >
                1x
              </button>
              <button
                onClick={() => onChangeSpeed(700)}
                className={`px-1.5 py-0.5 rounded font-medium cursor-pointer transition-colors ${
                  agentSpeed < 1200 ? 'bg-[#FFFDF9] text-[#7656A7] shadow-2xs font-bold' : 'text-[#6E6860]'
                }`}
                title="Fast speed (0.7s per action)"
              >
                2x Fast
              </button>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#6E6860] uppercase tracking-wider mb-0.5">
              <Target className="w-3.5 h-3.5 text-[#7656A7]" />
              <span>Goal</span>
            </div>
            <h2 className="text-xs font-bold text-[#2B2825] leading-snug">
              {workflow.title}
            </h2>
          </div>
        </div>

        {/* Activity Timeline */}
        <ActivityTimeline
          steps={workflow.steps}
          currentStepIndex={currentStepIndex}
          activityLogs={activityLogs}
        />
      </div>

      {/* Control Buttons Bottom Pinned */}
      <div className="pt-2 border-t border-[#E5DEC9] flex items-center gap-2">
        <button
          onClick={onTogglePause}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold cursor-pointer transition-all shadow-xs ${
            isRunning
              ? 'bg-[#EFE9DF] text-[#2B2825] hover:bg-[#E5DEC9]'
              : 'bg-[#7656A7] text-white hover:bg-[#654791]'
          }`}
        >
          {isRunning ? (
            <>
              <Pause className="w-3.5 h-3.5" />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5" />
              <span>Resume</span>
            </>
          )}
        </button>

        <button
          onClick={onStop}
          className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#F7F3EC] border border-[#E5DEC9] text-[#C86D51] hover:bg-[#F2E5E0] text-xs font-semibold cursor-pointer transition-colors"
          title="Stop and return to home"
        >
          <Square className="w-3.5 h-3.5" />
          <span>Stop</span>
        </button>
      </div>
    </div>
  );
};
