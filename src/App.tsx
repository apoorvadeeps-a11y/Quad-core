import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BrowserHeader } from './components/BrowserHeader';
import { ResizableDivider } from './components/ResizableDivider';
import { MockPortal } from './components/mock-portal/MockPortal';
import { OneStepPanel } from './components/onestep-panel/OneStepPanel';
import { ReceiptModal } from './components/ReceiptModal';
import { WORKFLOWS } from './data/workflows';
import {
  PortalRoute,
  FinanceTab,
  AssistantMode,
  AgentStatus,
  WorkflowDefinition,
  ActivityLogItem,
  PaymentRecord,
} from './types';

const STORAGE_LAYOUT_KEY = 'onestep_layout_ratio';

export default function App() {
  // Layout Split state (Percentage width of webpage, default 70)
  const [layoutRatio, setLayoutRatio] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_LAYOUT_KEY);
      if (saved) {
        const parsed = parseFloat(saved);
        if (!isNaN(parsed) && parsed >= 20 && parsed <= 85) return parsed;
      }
    } catch {
      // fallback
    }
    return 70;
  });

  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Save layout preference to localStorage
  const updateLayoutRatio = (ratio: number) => {
    const clamped = Math.min(85, Math.max(25, ratio));
    setLayoutRatio(clamped);
    try {
      localStorage.setItem(STORAGE_LAYOUT_KEY, clamped.toString());
    } catch {
      // ignore
    }
  };

  // Mock Portal Navigation State & History
  const [currentRoute, setCurrentRoute] = useState<PortalRoute>('dashboard');
  const [currentFinanceTab, setCurrentFinanceTab] = useState<FinanceTab>('overview');
  const [routeHistory, setRouteHistory] = useState<{ route: PortalRoute; subTab?: FinanceTab }[]>([
    { route: 'dashboard' },
  ]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // OneStep Assistant State
  const [mode, setMode] = useState<AssistantMode>('idle');
  const [agentStatus, setAgentStatus] = useState<AgentStatus>('idle');
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>('download-fee-receipt');
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [activityLogs, setActivityLogs] = useState<ActivityLogItem[]>([]);
  const [agentSpeed, setAgentSpeed] = useState<number>(1400); // ms per step in agent mode
  const [pulseTrigger, setPulseTrigger] = useState<number>(0);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  // Wrong turn state for Guide mode
  const [wrongTurn, setWrongTurn] = useState<{
    currentRoute: PortalRoute;
    expectedRoute: PortalRoute;
    expectedInstruction: string;
  } | null>(null);

  const activeWorkflow: WorkflowDefinition = WORKFLOWS[selectedWorkflowId] || WORKFLOWS['download-fee-receipt'];
  const activeStep = activeWorkflow.steps[currentStepIndex] || activeWorkflow.steps[0];

  // Helper to log activities with current time
  const addLog = useCallback((message: string, status: ActivityLogItem['status'] = 'completed') => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setActivityLogs((prev) => [
      ...prev,
      {
        id: `log-${Date.now()}-${Math.random()}`,
        timestamp: timeStr,
        message,
        status,
      },
    ]);
  }, []);

  // Browser Navigation History handlers
  const navigateTo = useCallback((route: PortalRoute, subTab?: FinanceTab, skipHistory = false) => {
    setCurrentRoute(route);
    if (subTab) setCurrentFinanceTab(subTab);

    if (!skipHistory) {
      setRouteHistory((prev) => {
        const nextHist = prev.slice(0, historyIndex + 1);
        return [...nextHist, { route, subTab }];
      });
      setHistoryIndex((prev) => prev + 1);
    }
  }, [historyIndex]);

  const handleBrowserBack = () => {
    if (historyIndex > 0) {
      const prevEntry = routeHistory[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      setCurrentRoute(prevEntry.route);
      if (prevEntry.subTab) setCurrentFinanceTab(prevEntry.subTab);
    }
  };

  const handleBrowserForward = () => {
    if (historyIndex < routeHistory.length - 1) {
      const nextEntry = routeHistory[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      setCurrentRoute(nextEntry.route);
      if (nextEntry.subTab) setCurrentFinanceTab(nextEntry.subTab);
    }
  };

  const handleBrowserReload = () => {
    // Quick reload effect
    setPulseTrigger((prev) => prev + 1);
  };

  // Start workflow
  const handleStartWorkflow = (goalText: string, chosenMode: 'guide' | 'agent') => {
    // Match workflow by title keywords
    let wfId = 'download-fee-receipt';
    const gLower = goalText.toLowerCase();
    if (gLower.includes('result') || gLower.includes('grade') || gLower.includes('marksheet')) {
      wfId = 'academic-results';
    } else if (gLower.includes('attendance')) {
      wfId = 'check-attendance';
    } else if (gLower.includes('history') && !gLower.includes('receipt')) {
      wfId = 'view-payment-history';
    }

    setSelectedWorkflowId(wfId);
    setCurrentStepIndex(0);
    setWrongTurn(null);
    setActivityLogs([]);
    setMode(chosenMode);

    const wf = WORKFLOWS[wfId];
    addLog(`Goal initiated: "${wf.title}"`, 'completed');

    if (chosenMode === 'agent') {
      setAgentStatus('running');
      addLog('Agent initiated automated workflow', 'in_progress');
    } else {
      setAgentStatus('idle');
      addLog(`Guide mode active. Step 1: ${wf.steps[0].instruction}`, 'in_progress');
    }
  };

  // Switch from Guide to Agent mode smoothly
  const handleSwitchToAgent = () => {
    setMode('agent');
    setAgentStatus('running');
    addLog('Switched from Guide mode to automated Agent mode', 'in_progress');
  };

  // User navigation handler in mock portal (checks expected step vs wrong turn)
  const handlePortalNavigate = (route: PortalRoute, subTab?: FinanceTab) => {
    navigateTo(route, subTab);

    if (mode === 'guide' && agentStatus !== 'completed') {
      const expectedStep = activeWorkflow.steps[currentStepIndex];

      if (!expectedStep) return;

      // Check if this navigation satisfies current step
      const matchesRoute = route === expectedStep.targetRoute;
      const matchesSubTab = !expectedStep.targetSubTab || subTab === expectedStep.targetSubTab;

      if (matchesRoute && (matchesSubTab || expectedStep.actionType === 'navigate')) {
        // Step satisfied! Clear wrong turn and advance
        setWrongTurn(null);
        addLog(`✓ Completed: ${expectedStep.instruction}`);

        if (currentStepIndex + 1 < activeWorkflow.steps.length) {
          setCurrentStepIndex(currentStepIndex + 1);
          setPulseTrigger((p) => p + 1);
        } else {
          // Finished all steps!
          setAgentStatus('completed');
          addLog(`Task completed successfully!`);
        }
      } else {
        // User navigated to a page not matching the expected route
        if (route !== expectedStep.targetRoute) {
          setWrongTurn({
            currentRoute: route,
            expectedRoute: expectedStep.targetRoute,
            expectedInstruction: expectedStep.instruction,
          });
          addLog(`Notice: Navigated to ${route}. Target requires ${expectedStep.targetRoute}.`, 'warn');
        }
      }
    }
  };

  // Highlight target clicked directly (either on page or via overlay tooltip)
  const handleHighlightTargetClick = () => {
    if (mode === 'guide' && agentStatus !== 'completed') {
      const expectedStep = activeWorkflow.steps[currentStepIndex];
      if (!expectedStep) return;

      // Execute target step logic
      if (expectedStep.targetRoute !== currentRoute) {
        navigateTo(expectedStep.targetRoute, expectedStep.targetSubTab);
      } else if (expectedStep.targetSubTab && expectedStep.targetSubTab !== currentFinanceTab) {
        setCurrentFinanceTab(expectedStep.targetSubTab);
      }

      addLog(`✓ Clicked: ${expectedStep.instruction}`);

      if (expectedStep.isSensitive) {
        // Sensitive action: in guide mode, clicking receipt opens receipt modal and completes
        setIsReceiptModalOpen(true);
      }

      if (currentStepIndex + 1 < activeWorkflow.steps.length) {
        setCurrentStepIndex(currentStepIndex + 1);
        setPulseTrigger((p) => p + 1);
      } else {
        setAgentStatus('completed');
        addLog(`Task completed successfully!`);
      }
      setWrongTurn(null);
    }
  };

  // Perform step for me button (when user clicked "I'm stuck")
  const handlePerformStepForMe = () => {
    handleHighlightTargetClick();
  };

  // Wrong turn recovery: navigates back to expected route and pulses target
  const handleRecoverRoute = () => {
    const expectedStep = activeWorkflow.steps[currentStepIndex];
    if (expectedStep) {
      navigateTo(expectedStep.targetRoute, expectedStep.targetSubTab);
      setWrongTurn(null);
      setPulseTrigger((p) => p + 1);
      addLog(`Returned to expected pathway: ${expectedStep.targetRoute}`);
    }
  };

  const handleDismissWrongTurn = () => {
    setWrongTurn(null);
  };

  // Receipt Download handler (from table button)
  const handleDownloadReceipt = (record?: PaymentRecord) => {
    setIsReceiptModalOpen(true);
    addLog(`Generated receipt voucher: ${record?.receiptFileName || 'Receipt_Semester_2026.pdf'}`);
    if (currentStepIndex === activeWorkflow.steps.length - 1) {
      setAgentStatus('completed');
    }
  };

  // Agent Mode Automation Loop using setTimeout
  useEffect(() => {
    if (mode !== 'agent' || agentStatus !== 'running') {
      return;
    }

    const step = activeWorkflow.steps[currentStepIndex];
    if (!step) {
      setAgentStatus('completed');
      return;
    }

    // If this step is marked sensitive (or sensitiveStepIndex), pause for user approval!
    if (step.isSensitive || currentStepIndex === activeWorkflow.sensitiveStepIndex) {
      const timer = setTimeout(() => {
        setAgentStatus('approval_required');
        addLog(`Pausing for security review: ${step.instruction}`, 'review');
      }, agentSpeed);
      return () => clearTimeout(timer);
    }

    // Otherwise, simulate performing the action automatically
    const timer = setTimeout(() => {
      // Execute the action in the portal
      if (step.targetRoute !== currentRoute) {
        navigateTo(step.targetRoute, step.targetSubTab, true);
      } else if (step.targetSubTab && step.targetSubTab !== currentFinanceTab) {
        setCurrentFinanceTab(step.targetSubTab);
      }

      addLog(`Agent executed: ${step.instruction}`);

      if (currentStepIndex + 1 < activeWorkflow.steps.length) {
        setCurrentStepIndex((prev) => prev + 1);
      } else {
        setAgentStatus('completed');
        addLog(`Agent completed all steps for "${activeWorkflow.title}"!`);
      }
    }, agentSpeed);

    return () => clearTimeout(timer);
  }, [
    mode,
    agentStatus,
    currentStepIndex,
    activeWorkflow,
    agentSpeed,
    currentRoute,
    currentFinanceTab,
    navigateTo,
    addLog,
  ]);

  // Approval Handlers for Agent mode
  const handleApproveAction = () => {
    addLog('User approved proposed action: Download receipt', 'completed');
    const sensitiveStep = activeWorkflow.steps[currentStepIndex];
    if (sensitiveStep) {
      addLog(`✓ Downloaded ${activeWorkflow.approvalDetails.targetFile}`);
    }
    setAgentStatus('completed');
    setIsReceiptModalOpen(true);
  };

  const handleRejectAction = () => {
    addLog('User declined proposed action. Agent stopped.', 'warn');
    setAgentStatus('paused');
  };

  const handleTogglePauseAgent = () => {
    if (agentStatus === 'running') {
      setAgentStatus('paused');
      addLog('Agent paused by user', 'warn');
    } else if (agentStatus === 'paused') {
      setAgentStatus('running');
      addLog('Agent resumed', 'in_progress');
    }
  };

  const handleStopAgent = () => {
    setAgentStatus('stopped');
    setMode('idle');
    addLog('Agent stopped. Returned to start.', 'warn');
  };

  const handleResetToStart = () => {
    setMode('idle');
    setAgentStatus('idle');
    setCurrentStepIndex(0);
    setWrongTurn(null);
    setActivityLogs([]);
    navigateTo('dashboard', 'overview');
  };

  // Divider Mouse / Touch Dragging Logic
  const handleDividerDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMove = (clientX: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const newWidth = clientX - rect.left;
      const newRatio = (newWidth / rect.width) * 100;
      updateLayoutRatio(newRatio);
    };

    const handleMouseMove = (e: MouseEvent) => {
      handleMove(e.clientX);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handleMove(e.touches[0].clientX);
      }
    };

    const handleDragEnd = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleDragEnd);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleDragEnd);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleDragEnd);
    };
  }, [isDragging]);

  // Target element calculation for highlight overlay
  const isHighlightActive = (mode === 'guide' || mode === 'agent') && agentStatus !== 'completed' && agentStatus !== 'approval_required';
  const highlightTargetId = isHighlightActive && activeStep ? activeStep.targetId : null;
  const highlightTooltipText = activeStep ? activeStep.tooltipText : '';

  return (
    <div className="flex flex-col h-screen w-screen bg-[#F7F3EC] text-[#2B2825] overflow-hidden select-none">
      {/* Top Browser Navigation & Layout Presets Bar */}
      <BrowserHeader
        currentRoute={currentRoute}
        currentFinanceTab={currentFinanceTab}
        onNavigateBack={handleBrowserBack}
        onNavigateForward={handleBrowserForward}
        onReload={handleBrowserReload}
        canGoBack={historyIndex > 0}
        canGoForward={historyIndex < routeHistory.length - 1}
        layoutRatio={layoutRatio}
        onSelectPreset={updateLayoutRatio}
        mode={mode}
      />

      {/* Main Resizable Split Workspace */}
      <div
        ref={containerRef}
        className={`flex-1 flex w-full overflow-hidden relative ${
          isDragging ? 'cursor-col-resize select-none pointer-events-auto' : ''
        }`}
      >
        {/* Left Side: Mock University Webpage (approximately 70% width) */}
        <div
          style={{ width: `${layoutRatio}%` }}
          className="h-full flex flex-col min-w-[380px] overflow-hidden relative"
        >
          <MockPortal
            currentRoute={currentRoute}
            currentFinanceTab={currentFinanceTab}
            onNavigate={handlePortalNavigate}
            onDownloadReceipt={handleDownloadReceipt}
            highlightTargetId={highlightTargetId}
            highlightTooltipText={highlightTooltipText}
            isHighlightActive={isHighlightActive}
            pulseTrigger={pulseTrigger}
            onHighlightTargetClick={handleHighlightTargetClick}
          />
        </div>

        {/* Draggable Divider with Preset Shortcuts */}
        <ResizableDivider
          onDragStart={handleDividerDragStart}
          onReset={() => updateLayoutRatio(70)}
          isDragging={isDragging}
        />

        {/* Right Side: OneStep Assistant Panel (approximately 30% width) */}
        <div
          style={{ width: `${100 - layoutRatio}%` }}
          className="h-full flex flex-col min-w-[260px] overflow-hidden bg-[#FFFDF9] border-l border-[#E5DEC9]"
        >
          <OneStepPanel
            mode={mode}
            agentStatus={agentStatus}
            workflow={activeWorkflow}
            currentStepIndex={currentStepIndex}
            activityLogs={activityLogs}
            agentSpeed={agentSpeed}
            wrongTurn={wrongTurn}
            onStartWorkflow={handleStartWorkflow}
            onShowMe={() => setPulseTrigger((p) => p + 1)}
            onImStuck={() => setPulseTrigger((p) => p + 1)}
            onPerformStepForMe={handlePerformStepForMe}
            onSwitchToAgent={handleSwitchToAgent}
            onTogglePauseAgent={handleTogglePauseAgent}
            onStopAgent={handleStopAgent}
            onChangeSpeed={setAgentSpeed}
            onApproveAction={handleApproveAction}
            onRejectAction={handleRejectAction}
            onResetToStart={handleResetToStart}
            onRecoverRoute={handleRecoverRoute}
            onDismissWrongTurn={handleDismissWrongTurn}
            onViewReceipt={() => setIsReceiptModalOpen(true)}
          />
        </div>
      </div>

      {/* Downloaded Receipt PDF Preview Modal */}
      <ReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
      />
    </div>
  );
}
