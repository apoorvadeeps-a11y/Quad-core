import React, { useRef } from 'react';
import { PortalSidebar } from './PortalSidebar';
import { DashboardPage } from './DashboardPage';
import { FinancePage } from './FinancePage';
import { AcademicPage } from './AcademicPage';
import { AttendancePage } from './AttendancePage';
import { LibraryPage } from './LibraryPage';
import { GovServicesPage } from './GovServicesPage';
import { HighlightOverlay } from '../HighlightOverlay';
import { PortalRoute, FinanceTab, PaymentRecord } from '../../types';

interface MockPortalProps {
  activeSite: 'university' | 'gov';
  currentRoute: PortalRoute;
  currentFinanceTab: FinanceTab;
  onNavigate: (route: PortalRoute, subTab?: FinanceTab) => void;
  onDownloadReceipt: (record?: PaymentRecord) => void;
  onGovFormSubmit?: (data: Record<string, any>) => void;
  highlightTargetId: string | null;
  highlightTooltipText: string;
  isHighlightActive: boolean;
  pulseTrigger: number;
  onHighlightTargetClick: () => void;
  containerRef?: React.RefObject<HTMLDivElement | null>;
}

export const MockPortal: React.FC<MockPortalProps> = ({
  activeSite,
  currentRoute,
  currentFinanceTab,
  onNavigate,
  onDownloadReceipt,
  onGovFormSubmit,
  highlightTargetId,
  highlightTooltipText,
  isHighlightActive,
  pulseTrigger,
  onHighlightTargetClick,
  containerRef,
}) => {
  const localContainerRef = useRef<HTMLDivElement>(null);
  const portalContainerRef = containerRef || localContainerRef;

  return (
    <div className="relative flex-1 flex h-full overflow-hidden bg-[#F7F3EC] select-text">
      {/* If University Site: Show University Sidebar */}
      {activeSite === 'university' && (
        <PortalSidebar
          currentRoute={currentRoute}
          onNavigate={(route) => onNavigate(route)}
        />
      )}

      {/* Main Page Area */}
      <div
        ref={portalContainerRef}
        className="relative flex-1 overflow-y-auto overflow-x-hidden min-w-0"
      >
        {/* Adaptive Highlighting Overlay positioned inside the scrollable container */}
        <HighlightOverlay
          targetId={highlightTargetId}
          tooltipText={highlightTooltipText}
          isActive={isHighlightActive}
          pulseTrigger={pulseTrigger}
          portalContainerRef={portalContainerRef}
          onTargetClick={onHighlightTargetClick}
        />

        {activeSite === 'gov' ? (
          <GovServicesPage onFormSubmitted={onGovFormSubmit} />
        ) : (
          <>
            {currentRoute === 'dashboard' && (
              <DashboardPage onNavigate={onNavigate} />
            )}
            {currentRoute === 'finance' && (
              <FinancePage
                currentTab={currentFinanceTab}
                onTabChange={(tab) => onNavigate('finance', tab)}
                onDownloadReceipt={onDownloadReceipt}
              />
            )}
            {currentRoute === 'academics' && (
              <AcademicPage onDownloadMarksheet={() => onDownloadReceipt()} />
            )}
            {currentRoute === 'attendance' && (
              <AttendancePage />
            )}
            {currentRoute === 'library' && (
              <LibraryPage />
            )}
            {currentRoute === 'settings' && (
              <div className="p-6 space-y-4 max-w-2xl mx-auto">
                <h2 className="text-xl font-bold text-[#2B2825]">Account Settings</h2>
                <div className="p-4 bg-[#FFFDF9] border border-[#E5DEC9] rounded-xl text-xs space-y-2">
                  <p className="font-semibold text-[#2B2825]">Notification Preferences</p>
                  <p className="text-[#6E6860]">Bursar payment SMS alerts enabled (+91 98765-XXXXX)</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
