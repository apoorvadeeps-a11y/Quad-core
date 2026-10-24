import React from 'react';
import { AlertTriangle, Navigation, X } from 'lucide-react';
import { PortalRoute } from '../../types';

interface WrongTurnCardProps {
  currentRoute: PortalRoute;
  expectedRoute: PortalRoute;
  expectedInstruction: string;
  onRecoverRoute: () => void;
  onDismiss: () => void;
}

const routeLabels: Record<PortalRoute, string> = {
  dashboard: 'Dashboard',
  academics: 'Academic Records',
  finance: 'Finance',
  attendance: 'Attendance',
  library: 'Library',
  settings: 'Settings',
};

export const WrongTurnCard: React.FC<WrongTurnCardProps> = ({
  currentRoute,
  expectedRoute,
  expectedInstruction,
  onRecoverRoute,
  onDismiss,
}) => {
  return (
    <div className="mx-4 mt-3 rounded-xl border border-[var(--accent-peach)] bg-[var(--surface-card)] shadow-sm overflow-hidden">
      <div className="p-3.5 space-y-2.5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[var(--accent-peach)]/40 text-[var(--accent-warn)] flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-[var(--text-primary)]">Off the path</h3>
              <p className="text-xs text-[var(--text-secondary)]">Let's get back on track</p>
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="p-1 rounded-md text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)] transition-colors cursor-pointer"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="text-sm text-[var(--text-secondary)] space-y-1">
          <p>You're in <span className="text-[var(--text-primary)]">{routeLabels[currentRoute]}</span></p>
          <p>Next step: <span className="text-[var(--text-primary)]">{expectedInstruction}</span> — <span className="text-[var(--text-primary)]">{routeLabels[expectedRoute]}</span></p>
        </div>

        <button
          onClick={onRecoverRoute}
          className="w-full py-2 px-3 rounded-lg bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-white text-sm font-medium transition-colors cursor-pointer flex items-center justify-center gap-1.5"
        >
          <Navigation className="w-4 h-4" />
          <span>Find the right path</span>
        </button>
      </div>
    </div>
  );
};
