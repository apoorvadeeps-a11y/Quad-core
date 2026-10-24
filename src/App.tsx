import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BrowserHeader } from './components/BrowserHeader';
import { ResizableDivider } from './components/ResizableDivider';
import { MockPortal } from './components/mock-portal/MockPortal';
import { OneStepPanel } from './components/onestep-panel/OneStepPanel';
import { ReceiptModal } from './components/ReceiptModal';
import { OllamaSettingsModal } from './components/onestep-panel/OllamaSettingsModal';
import { WORKFLOWS } from './data/workflows';
import { Sparkles, PanelRightOpen } from 'lucide-react';
import {
  PortalRoute,
  FinanceTab,
  AssistantMode,
  AgentStatus,
  WorkflowDefinition,
  ActivityLogItem,
  PaymentRecord,
} from './types';
import {
  OllamaConfig,
  UserAutofillProfile,
  PageSnapshot,
  AiPlanResponse,
  AutofillMapping,
  PlannedAction,
} from './extension/types';
import {
  getStoredOllamaConfig,
  saveStoredOllamaConfig,
  bridgeRequestAiPlan,
  bridgeExecuteAction,
  bridgeTestOllama,
  isChromeExtensionEnvironment,
} from './extension/bridge';
import {
  extractPageSnapshot,
  generateAutofillMappings,
} from './extension/dom-extractor';

const STORAGE_LAYOUT_KEY = 'onestep_layout_ratio';
const STORAGE_PROFILE_KEY = 'onestep_user_profile';

const DEFAULT_USER_PROFILE: UserAutofillProfile = {
  fullName: 'Ananya Sharma',
  email: 'ananya.sharma@apexstate.edu',
  phone: '+91 98765 43210',
  studentId: '2024-CS-0428',
  dateOfBirth: '2004-06-15',
  address: 'Room 304, Block B, University Campus Hostel',
  city: 'Bangalore, 560001',
  postalCode: '560001',
};

export default function App() {
  // Detect if running inside Chrome Extension's native side panel
  const isExtensionRuntime = isChromeExtensionEnvironment();

  // In Chrome extension side panel, the panel is always active.
  // In web preview mode, the side panel starts closed so visiting the site does not open OneStep automatically!
  const [isSidePanelOpen, setIsSidePanelOpen] = useState<boolean>(() => {
    return isExtensionRuntime;
  });

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
  const portalContainerRef = useRef<HTMLDivElement>(null);

  // Active website in workspace (Cross-website demo)
  const [activeSite, setActiveSite] = useState<'university' | 'gov'>('university');

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
  const [activeGoal, setActiveGoal] = useState<string>('Download my university fee receipt');
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>('download-fee-receipt');
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [activityLogs, setActivityLogs] = useState<ActivityLogItem[]>([]);
  const [agentSpeed, setAgentSpeed] = useState<number>(1400); // ms per step in agent mode
  const [pulseTrigger, setPulseTrigger] = useState<number>(0);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  // Cross-site element targeting & AI plan
  const [currentHighlightedElementId, setCurrentHighlightedElementId] = useState<string | null>(null);
  const [currentHighlightTooltip, setCurrentHighlightTooltip] = useState<string>('');
  const [lastAiPlan, setLastAiPlan] = useState<AiPlanResponse | null>(null);
  const [pendingAutofillMappings, setPendingAutofillMappings] = useState<AutofillMapping[] | null>(null);

  // Ollama status & Settings modal
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [ollamaConfig, setOllamaConfig] = useState<OllamaConfig>({
    baseUrl: 'http://localhost:11434',
    modelTag: 'qwen2.5:7b',
    timeoutMs: 30000,
    temperature: 0.1,
  });
  const [ollamaConnectionState, setOllamaConnectionState] = useState<'connected' | 'offline' | 'checking'>('checking');
  const [autofillProfile, setAutofillProfile] = useState<UserAutofillProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PROFILE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return DEFAULT_USER_PROFILE;
  });

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

  // Initialize and check Ollama connection (without initiating any AI requests)
  useEffect(() => {
    getStoredOllamaConfig().then((cfg) => {
      setOllamaConfig(cfg);
      bridgeTestOllama(cfg.baseUrl).then((res) => {
        setOllamaConnectionState(res.ok ? 'connected' : 'offline');
      });
    });
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
    setPulseTrigger((prev) => prev + 1);
  };

  // Inspect and propose autofill mappings
  const inspectAndProposeAutofill = useCallback(() => {
    const snapshot = extractPageSnapshot(portalContainerRef.current || document);
    const mappings = generateAutofillMappings(snapshot.elements, autofillProfile);
    if (mappings.length > 0) {
      setPendingAutofillMappings(mappings);
      addLog(`Detected ${mappings.length} form field(s) suitable for autofill. Review card presented.`, 'review');
      return true;
    }
    return false;
  }, [autofillProfile, addLog]);

  // Start workflow (Explicit user initiation)
  const handleStartWorkflow = async (goalText: string, chosenMode: 'guide' | 'agent') => {
    setActiveGoal(goalText);
    setCurrentStepIndex(0);
    setWrongTurn(null);
    setActivityLogs([]);
    setPendingAutofillMappings(null);
    setMode(chosenMode);

    // If goal includes autofill or form, check for form fields
    const gLower = goalText.toLowerCase();
    if (gLower.includes('autofill') || gLower.includes('fill') || gLower.includes('form') || activeSite === 'gov') {
      const foundForm = inspectAndProposeAutofill();
      if (foundForm && chosenMode === 'guide') {
        return;
      }
    }

    let wfId = 'download-fee-receipt';
    if (gLower.includes('result') || gLower.includes('grade') || gLower.includes('marksheet')) {
      wfId = 'academic-results';
    } else if (gLower.includes('attendance')) {
      wfId = 'check-attendance';
    } else if (gLower.includes('history') && !gLower.includes('receipt')) {
      wfId = 'view-payment-history';
    }

    setSelectedWorkflowId(wfId);

    const wf = WORKFLOWS[wfId];
    addLog(`Goal initiated: "${goalText}"`, 'completed');
    addLog(`Reading live DOM & querying Qwen 2.5 (${ollamaConfig.modelTag})...`, 'in_progress');

    // Query real Qwen 2.5 plan via bridge
    try {
      const taskHistory = [`Goal: ${goalText}`];
      const { plan } = await bridgeRequestAiPlan(goalText, portalContainerRef.current, taskHistory);
      setLastAiPlan(plan);
      addLog(`Qwen 2.5 Plan: "${plan.message}"`, 'completed');

      if (plan.actions && plan.actions.length > 0) {
        const firstAction = plan.actions[0];
        if (firstAction.element_id) {
          setCurrentHighlightedElementId(firstAction.element_id);
          setCurrentHighlightTooltip(firstAction.reason || plan.message);
        }
      }
    } catch (err: any) {
      addLog(`Notice: Local Ollama unreachable (${err.message || 'offline'}). Using verified offline pathway.`, 'warn');
      const fallbackTarget = wf.steps[0].targetId;
      setCurrentHighlightedElementId(fallbackTarget);
      setCurrentHighlightTooltip(`Click ${wf.steps[0].instruction}`);
    }

    if (chosenMode === 'agent') {
      setAgentStatus('running');
      addLog('Agent initiated automated workflow', 'in_progress');
    } else {
      setAgentStatus('idle');
      addLog(`Guide mode active. Step 1: ${wf.steps[0].instruction}`, 'in_progress');
    }
  };

  const handleSwitchToAgent = () => {
    setMode('agent');
    setAgentStatus('running');
    addLog('Switched from Guide mode to automated Agent mode', 'in_progress');
  };

  const handlePortalNavigate = (route: PortalRoute, subTab?: FinanceTab) => {
    navigateTo(route, subTab);

    if (mode === 'guide' && agentStatus !== 'completed') {
      const expectedStep = activeWorkflow.steps[currentStepIndex];
      if (!expectedStep) return;

      const matchesRoute = route === expectedStep.targetRoute;
      const matchesSubTab = !expectedStep.targetSubTab || subTab === expectedStep.targetSubTab;

      if (matchesRoute && (matchesSubTab || expectedStep.actionType === 'navigate')) {
        setWrongTurn(null);
        addLog(`✓ Completed: ${expectedStep.instruction}`);

        if (currentStepIndex + 1 < activeWorkflow.steps.length) {
          const nextIndex = currentStepIndex + 1;
          setCurrentStepIndex(nextIndex);
          const nextStep = activeWorkflow.steps[nextIndex];
          setCurrentHighlightedElementId(nextStep.targetId);
          setCurrentHighlightTooltip(`Click ${nextStep.instruction}`);
          setPulseTrigger((p) => p + 1);
        } else {
          setAgentStatus('completed');
          setCurrentHighlightedElementId(null);
          addLog(`Task completed successfully!`);
        }
      } else {
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

  const handleHighlightTargetClick = () => {
    if (mode === 'guide' && agentStatus !== 'completed') {
      const expectedStep = activeWorkflow.steps[currentStepIndex];
      if (!expectedStep) return;

      if (expectedStep.targetRoute !== currentRoute) {
        navigateTo(expectedStep.targetRoute, expectedStep.targetSubTab);
      } else if (expectedStep.targetSubTab && expectedStep.targetSubTab !== currentFinanceTab) {
        setCurrentFinanceTab(expectedStep.targetSubTab);
      }

      addLog(`✓ Clicked: ${expectedStep.instruction}`);

      if (expectedStep.isSensitive) {
        setIsReceiptModalOpen(true);
      }

      if (currentStepIndex + 1 < activeWorkflow.steps.length) {
        const nextIdx = currentStepIndex + 1;
        setCurrentStepIndex(nextIdx);
        const nextStep = activeWorkflow.steps[nextIdx];
        setCurrentHighlightedElementId(nextStep.targetId);
        setCurrentHighlightTooltip(`Click ${nextStep.instruction}`);
        setPulseTrigger((p) => p + 1);
      } else {
        setAgentStatus('completed');
        setCurrentHighlightedElementId(null);
        addLog(`Task completed successfully!`);
      }
      setWrongTurn(null);
    }
  };

  const handlePerformStepForMe = () => {
    handleHighlightTargetClick();
  };

  const handleRecoverRoute = () => {
    const expectedStep = activeWorkflow.steps[currentStepIndex];
    if (expectedStep) {
      navigateTo(expectedStep.targetRoute, expectedStep.targetSubTab);
      setWrongTurn(null);
      setCurrentHighlightedElementId(expectedStep.targetId);
      setCurrentHighlightTooltip(`Click ${expectedStep.instruction}`);
      setPulseTrigger((p) => p + 1);
      addLog(`Returned to expected pathway: ${expectedStep.targetRoute}`);
    }
  };

  const handleDismissWrongTurn = () => {
    setWrongTurn(null);
  };

  const handleDownloadReceipt = (record?: PaymentRecord) => {
    setIsReceiptModalOpen(true);
    addLog(`Generated receipt voucher: ${record?.receiptFileName || 'Receipt_Semester_2026.pdf'}`);
    if (currentStepIndex === activeWorkflow.steps.length - 1) {
      setAgentStatus('completed');
      setCurrentHighlightedElementId(null);
    }
  };

  const handleGovFormSubmit = (data: Record<string, any>) => {
    addLog(`Form application registered: Ref #${data.refNumber || 'SUCCESS'}`, 'completed');
    setAgentStatus('completed');
    setCurrentHighlightedElementId(null);
  };

  const handleApproveAutofill = async (approvedMappings: AutofillMapping[]) => {
    setPendingAutofillMappings(null);
    addLog(`Executing autofill across ${approvedMappings.length} DOM field(s)...`, 'in_progress');

    let filledCount = 0;
    for (const mapping of approvedMappings) {
      const res = await bridgeExecuteAction({
        type: mapping.field_type === 'select' ? 'select_option' : 'fill',
        element_id: mapping.element_id,
        value: mapping.proposed_value,
        reason: `Autofill ${mapping.field_label}`,
      });
      if (res.success) {
        filledCount++;
      }
    }

    addLog(`✓ Successfully autofilled ${filledCount} field(s) with verified profile values!`, 'completed');
    addLog(`Notice: Form was not submitted. Please review values and click submit manually.`, 'warn');
  };

  const handleCancelAutofill = () => {
    setPendingAutofillMappings(null);
    addLog('User skipped form autofill.', 'warn');
  };

  // Agent Mode Automation Loop using setTimeout
  useEffect(() => {
    if (mode !== 'agent' || agentStatus !== 'running') {
      return;
    }

    const step = activeWorkflow.steps[currentStepIndex];
    if (!step) {
      setAgentStatus('completed');
      setCurrentHighlightedElementId(null);
      return;
    }

    setCurrentHighlightedElementId(step.targetId);
    setCurrentHighlightTooltip(`Agent executing: ${step.instruction}`);

    if (step.isSensitive || currentStepIndex === activeWorkflow.sensitiveStepIndex) {
      const timer = setTimeout(() => {
        setAgentStatus('approval_required');
        addLog(`Pausing for security review: ${step.instruction}`, 'review');
      }, agentSpeed);
      return () => clearTimeout(timer);
    }

    const timer = setTimeout(() => {
      if (step.targetRoute !== currentRoute) {
        navigateTo(step.targetRoute, step.targetSubTab, true);
      } else if (step.targetSubTab && step.targetSubTab !== currentFinanceTab) {
        setCurrentFinanceTab(step.targetSubTab);
      }

      addLog(`Agent executed: ${step.instruction}`);

      if (currentStepIndex + 1 < activeWorkflow.steps.length) {
        const nextIdx = currentStepIndex + 1;
        setCurrentStepIndex(nextIdx);
        const nextStep = activeWorkflow.steps[nextIdx];
        setCurrentHighlightedElementId(nextStep.targetId);
      } else {
        setAgentStatus('completed');
        setCurrentHighlightedElementId(null);
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

  const handleApproveAction = () => {
    addLog('User approved proposed action: Download receipt', 'completed');
    const sensitiveStep = activeWorkflow.steps[currentStepIndex];
    if (sensitiveStep) {
      addLog(`✓ Downloaded ${activeWorkflow.approvalDetails.targetFile}`);
    }
    setAgentStatus('completed');
    setCurrentHighlightedElementId(null);
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
    setCurrentHighlightedElementId(null);
    addLog('Agent stopped. Returned to start.', 'warn');
  };

  const handleResetToStart = () => {
    setMode('idle');
    setAgentStatus('idle');
    setCurrentStepIndex(0);
    setCurrentHighlightedElementId(null);
    setWrongTurn(null);
    setPendingAutofillMappings(null);
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

  const isHighlightActive =
    (mode === 'guide' || mode === 'agent') &&
    agentStatus !== 'completed' &&
    agentStatus !== 'approval_required' &&
    Boolean(currentHighlightedElementId);

  const highlightTargetId = isHighlightActive ? currentHighlightedElementId : null;
  const highlightTooltipText = currentHighlightTooltip || (activeStep ? activeStep.tooltipText : '');

  const handleSelectSite = (site: 'university' | 'gov') => {
    setActiveSite(site);
    setCurrentStepIndex(0);
    setCurrentHighlightedElementId(null);
    setPendingAutofillMappings(null);
    addLog(`Switched active website to ${site === 'university' ? 'University Portal' : 'GovDirect Public Services'}. DOM snapshot re-indexed.`, 'in_progress');
  };

  // IF RUNNING AS AN UNPACKED CHROME EXTENSION SIDE PANEL:
  // Render ONLY the OneStep Assistant panel filling 100% of the side panel width!
  if (isExtensionRuntime) {
    return (
      <div className="h-screen w-screen bg-[#FFFDF9] flex flex-col overflow-hidden text-[#2B2825]">
        <OneStepPanel
          mode={mode}
          agentStatus={agentStatus}
          workflow={activeWorkflow}
          currentStepIndex={currentStepIndex}
          activityLogs={activityLogs}
          agentSpeed={agentSpeed}
          wrongTurn={wrongTurn}
          pendingAutofillMappings={pendingAutofillMappings}
          ollamaModelTag={ollamaConfig.modelTag}
          ollamaBaseUrl={ollamaConfig.baseUrl}
          onOpenSettings={() => setIsSettingsOpen(true)}
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
          onApproveAutofill={handleApproveAutofill}
          onCancelAutofill={handleCancelAutofill}
          onResetToStart={handleResetToStart}
          onRecoverRoute={handleRecoverRoute}
          onDismissWrongTurn={handleDismissWrongTurn}
          onViewReceipt={() => setIsReceiptModalOpen(true)}
        />

        <ReceiptModal
          isOpen={isReceiptModalOpen}
          onClose={() => setIsReceiptModalOpen(false)}
        />

        <OllamaSettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          autofillProfile={autofillProfile}
          onSaveAutofillProfile={(prof) => {
            setAutofillProfile(prof);
            try {
              localStorage.setItem(STORAGE_PROFILE_KEY, JSON.stringify(prof));
            } catch {}
          }}
          onConfigSaved={(cfg) => {
            setOllamaConfig(cfg);
            bridgeTestOllama(cfg.baseUrl).then((res) => {
              setOllamaConnectionState(res.ok ? 'connected' : 'offline');
            });
          }}
        />
      </div>
    );
  }

  // WEB APPLICATION / PREVIEW MODE:
  // User visits the website: the website is shown clearly. OneStep is user-activated via toolbar icon or floating badge!
  return (
    <div className="flex flex-col h-screen w-screen bg-[#F7F3EC] text-[#2B2825] overflow-hidden select-none">
      {/* Top Browser Navigation & Extension Toolbar Bar */}
      <BrowserHeader
        currentRoute={currentRoute}
        currentFinanceTab={currentFinanceTab}
        activeSite={activeSite}
        onSelectSite={handleSelectSite}
        onNavigateBack={handleBrowserBack}
        onNavigateForward={handleBrowserForward}
        onReload={handleBrowserReload}
        canGoBack={historyIndex > 0}
        canGoForward={historyIndex < routeHistory.length - 1}
        layoutRatio={layoutRatio}
        onSelectPreset={updateLayoutRatio}
        mode={mode}
        ollamaStatus={ollamaConnectionState}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isSidePanelOpen={isSidePanelOpen}
        onToggleSidePanel={() => setIsSidePanelOpen(!isSidePanelOpen)}
      />

      {/* Main Workspace */}
      <div
        ref={containerRef}
        className={`flex-1 flex w-full overflow-hidden relative ${
          isDragging ? 'cursor-col-resize select-none pointer-events-auto' : ''
        }`}
      >
        {/* Webpage Area (Takes 100% when side panel is closed, or layoutRatio when open) */}
        <div
          style={{ width: isSidePanelOpen ? `${layoutRatio}%` : '100%' }}
          className="h-full flex flex-col min-w-[380px] overflow-hidden relative transition-all duration-200"
        >
          <MockPortal
            activeSite={activeSite}
            currentRoute={currentRoute}
            currentFinanceTab={currentFinanceTab}
            onNavigate={handlePortalNavigate}
            onDownloadReceipt={handleDownloadReceipt}
            onGovFormSubmit={handleGovFormSubmit}
            highlightTargetId={highlightTargetId}
            highlightTooltipText={highlightTooltipText}
            isHighlightActive={isHighlightActive}
            pulseTrigger={pulseTrigger}
            onHighlightTargetClick={handleHighlightTargetClick}
            containerRef={portalContainerRef}
          />

          {/* Floating trigger badge if side panel is closed (simulating Chrome toolbar reminder) */}
          {!isSidePanelOpen && (
            <div className="absolute bottom-5 right-5 z-20">
              <button
                onClick={() => setIsSidePanelOpen(true)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#7656A7] hover:bg-[#654791] text-white text-xs font-semibold shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
                title="Click to open OneStep Extension Side Panel"
              >
                <Sparkles className="w-4 h-4 text-white" />
                <span>Open OneStep Side Panel</span>
              </button>
            </div>
          )}
        </div>

        {/* Resizable Divider (rendered only when side panel is open) */}
        {isSidePanelOpen && (
          <ResizableDivider
            onDragStart={handleDividerDragStart}
            onReset={() => updateLayoutRatio(70)}
            isDragging={isDragging}
          />
        )}

        {/* OneStep Assistant Side Panel (rendered only when open) */}
        {isSidePanelOpen && (
          <div
            style={{ width: `${100 - layoutRatio}%` }}
            className="h-full flex flex-col min-w-[280px] overflow-hidden bg-[#FFFDF9] border-l border-[#E5DEC9] animate-in fade-in slide-in-from-right duration-200"
          >
            <OneStepPanel
              mode={mode}
              agentStatus={agentStatus}
              workflow={activeWorkflow}
              currentStepIndex={currentStepIndex}
              activityLogs={activityLogs}
              agentSpeed={agentSpeed}
              wrongTurn={wrongTurn}
              pendingAutofillMappings={pendingAutofillMappings}
              ollamaModelTag={ollamaConfig.modelTag}
              ollamaBaseUrl={ollamaConfig.baseUrl}
              onOpenSettings={() => setIsSettingsOpen(true)}
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
              onApproveAutofill={handleApproveAutofill}
              onCancelAutofill={handleCancelAutofill}
              onResetToStart={handleResetToStart}
              onRecoverRoute={handleRecoverRoute}
              onDismissWrongTurn={handleDismissWrongTurn}
              onViewReceipt={() => setIsReceiptModalOpen(true)}
              onClosePanel={() => setIsSidePanelOpen(false)}
            />
          </div>
        )}
      </div>

      {/* Downloaded Receipt PDF Preview Modal */}
      <ReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
      />

      {/* Ollama & Autofill Profile Settings Modal */}
      <OllamaSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        autofillProfile={autofillProfile}
        onSaveAutofillProfile={(prof) => {
          setAutofillProfile(prof);
          try {
            localStorage.setItem(STORAGE_PROFILE_KEY, JSON.stringify(prof));
          } catch {}
        }}
        onConfigSaved={(cfg) => {
          setOllamaConfig(cfg);
          bridgeTestOllama(cfg.baseUrl).then((res) => {
            setOllamaConnectionState(res.ok ? 'connected' : 'offline');
          });
        }}
      />
    </div>
  );
}
