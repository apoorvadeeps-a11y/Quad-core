import React from 'react';
import {
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Lock,
  Sparkles,
  Settings,
  Globe,
  Server,
  PanelRightOpen,
  PanelRightClose,
} from 'lucide-react';
import { PortalRoute, FinanceTab, AssistantMode } from '../types';

interface BrowserHeaderProps {
  currentRoute: PortalRoute;
  currentFinanceTab?: FinanceTab;
  activeSite: 'university' | 'gov';
  onSelectSite: (site: 'university' | 'gov') => void;
  onNavigateBack: () => void;
  onNavigateForward: () => void;
  onReload: () => void;
  canGoBack: boolean;
  canGoForward: boolean;
  layoutRatio: number; // e.g. 70 for 70:30
  onSelectPreset: (ratio: number) => void;
  mode: AssistantMode;
  ollamaStatus: 'connected' | 'offline' | 'checking';
  onOpenSettings: () => void;
  isSidePanelOpen: boolean;
  onToggleSidePanel: () => void;
}

export const BrowserHeader: React.FC<BrowserHeaderProps> = ({
  currentRoute,
  currentFinanceTab,
  activeSite,
  onSelectSite,
  onNavigateBack,
  onNavigateForward,
  onReload,
  canGoBack,
  canGoForward,
  layoutRatio,
  onSelectPreset,
  mode,
  ollamaStatus,
  onOpenSettings,
  isSidePanelOpen,
  onToggleSidePanel,
}) => {
  let domain = activeSite === 'university' ? 'portal.apexstate.edu' : 'services.govdirect.gov';
  let path = activeSite === 'university' ? `/student/${currentRoute}` : '/civil/certificates/apply';
  if (activeSite === 'university' && currentRoute === 'finance' && currentFinanceTab) {
    path += `/${currentFinanceTab}`;
  }

  return (
    <header className="h-13 bg-[#FFFDF9] border-b border-[#E5DEC9] px-4 flex items-center justify-between gap-4 select-none shrink-0 z-20">
      {/* Browser Navigation, Website Switcher & Security */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 text-[#6E6860]">
          <button
            onClick={onNavigateBack}
            disabled={!canGoBack}
            aria-label="Back"
            className="p-1.5 rounded-md hover:bg-[#EFE9DF] disabled:opacity-35 disabled:hover:bg-transparent transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button
            onClick={onNavigateForward}
            disabled={!canGoForward}
            aria-label="Forward"
            className="p-1.5 rounded-md hover:bg-[#EFE9DF] disabled:opacity-35 disabled:hover:bg-transparent transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={onReload}
            aria-label="Reload page"
            className="p-1.5 rounded-md hover:bg-[#EFE9DF] transition-colors cursor-pointer text-[#6E6860] hover:text-[#2B2825]"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Website Selector Dropdown (Cross-Website Demo) */}
        <div className="hidden sm:flex items-center gap-1 bg-[#F7F3EC] p-0.5 rounded-lg border border-[#E5DEC9] text-xs">
          <button
            onClick={() => onSelectSite('university')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeSite === 'university'
                ? 'bg-[#FFFDF9] text-[#7656A7] shadow-xs font-semibold'
                : 'text-[#6E6860] hover:text-[#2B2825]'
            }`}
          >
            <Globe className="w-3 h-3" />
            <span>Site 1: University Portal</span>
          </button>
          <button
            onClick={() => onSelectSite('gov')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeSite === 'gov'
                ? 'bg-[#FFFDF9] text-[#0E8A9A] shadow-xs font-semibold'
                : 'text-[#6E6860] hover:text-[#2B2825]'
            }`}
          >
            <Globe className="w-3 h-3" />
            <span>Site 2: GovDirect Services</span>
          </button>
        </div>

        {/* Address Bar */}
        <div className="hidden lg:flex items-center gap-2 bg-[#F7F3EC] border border-[#E5DEC9] rounded-lg px-3 py-1.5 w-64 xl:w-80 text-xs text-[#2B2825] shadow-xs">
          <Lock className="w-3.5 h-3.5 text-[#4A7C59] shrink-0" />
          <span className="text-[#6E6860] select-none font-medium">https://</span>
          <span className="font-medium text-[#2B2825] truncate">{domain}</span>
          <span className="text-[#7656A7] font-mono text-[11px] truncate">{path}</span>
        </div>
      </div>

      {/* Right: OneStep Toolbar Icon (User-Activated), Layout Presets, Ollama Status */}
      <div className="flex items-center gap-3">
        {/* Layout Presets (only shown when Side Panel is open) */}
        {isSidePanelOpen && (
          <div className="hidden md:flex items-center bg-[#F7F3EC] p-0.5 rounded-lg border border-[#E5DEC9] text-xs">
            <button
              onClick={() => onSelectPreset(80)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                Math.round(layoutRatio) === 80
                  ? 'bg-[#FFFDF9] text-[#7656A7] shadow-xs font-semibold'
                  : 'text-[#6E6860] hover:text-[#2B2825]'
              }`}
              title="80:20 — More website space"
            >
              80:20
            </button>
            <button
              onClick={() => onSelectPreset(70)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                Math.round(layoutRatio) === 70
                  ? 'bg-[#FFFDF9] text-[#7656A7] shadow-xs font-semibold'
                  : 'text-[#6E6860] hover:text-[#2B2825]'
              }`}
              title="70:30 — Default split"
            >
              70:30
            </button>
            <button
              onClick={() => onSelectPreset(60)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                Math.round(layoutRatio) === 60
                  ? 'bg-[#FFFDF9] text-[#7656A7] shadow-xs font-semibold'
                  : 'text-[#6E6860] hover:text-[#2B2825]'
              }`}
              title="60:40 — More assistant space"
            >
              60:40
            </button>
          </div>
        )}

        {/* Ollama Status & Settings Button */}
        <button
          onClick={onOpenSettings}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-[#E5DEC9] bg-[#F7F3EC] hover:bg-[#EFE9DF] text-xs font-medium transition-colors cursor-pointer text-[#2B2825]"
          title="Configure Ollama Host IP & Qwen 2.5 Model"
        >
          <span
            className={`w-2 h-2 rounded-full ${
              ollamaStatus === 'connected'
                ? 'bg-[#4A7C59] animate-pulse'
                : ollamaStatus === 'checking'
                ? 'bg-[#D97706] animate-ping'
                : 'bg-[#C86D51]'
            }`}
          />
          <Server className="w-3.5 h-3.5 text-[#6E6860]" />
          <span className="hidden xl:inline text-[11px] font-semibold">
            {ollamaStatus === 'connected'
              ? 'Ollama Ready'
              : ollamaStatus === 'checking'
              ? 'Checking...'
              : 'Ollama Offline'}
          </span>
          <Settings className="w-3.5 h-3.5 text-[#6E6860] ml-0.5" />
        </button>

        {/* Pinned Chrome Extension Icon Button (Simulates clicking extension in Chrome toolbar) */}
        <button
          onClick={onToggleSidePanel}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer shadow-xs ${
            isSidePanelOpen
              ? 'bg-[#7656A7] text-white border-[#7656A7]'
              : 'bg-[#FFFDF9] text-[#7656A7] border-[#7656A7]/40 hover:bg-[#7656A7]/10'
          }`}
          title={isSidePanelOpen ? 'Click to close OneStep Side Panel' : 'Click pinned OneStep icon to open Side Panel'}
        >
          {isSidePanelOpen ? (
            <PanelRightClose className="w-4 h-4" />
          ) : (
            <PanelRightOpen className="w-4 h-4" />
          )}
          <span className="hidden sm:inline">
            {isSidePanelOpen ? 'Close Side Panel' : 'OneStep Extension'}
          </span>
        </button>
      </div>
    </header>
  );
};
