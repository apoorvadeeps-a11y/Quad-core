import React from 'react';
import {
  LayoutDashboard,
  GraduationCap,
  CreditCard,
  CalendarCheck2,
  BookOpen,
  Settings,
  GraduationCap as UniversityIcon,
} from 'lucide-react';
import { PortalRoute } from '../../types';
import { STUDENT_PROFILE } from '../../data/mockPortalData';

interface PortalSidebarProps {
  currentRoute: PortalRoute;
  onNavigate: (route: PortalRoute) => void;
}

export const PortalSidebar: React.FC<PortalSidebarProps> = ({
  currentRoute,
  onNavigate,
}) => {
  const navItems: { id: PortalRoute; label: string; icon: React.ReactNode; testId?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'academics', label: 'Academic Records', icon: <GraduationCap className="w-4 h-4" />, testId: 'academics-nav' },
    { id: 'finance', label: 'Finance', icon: <CreditCard className="w-4 h-4" />, testId: 'finance-nav' },
    { id: 'attendance', label: 'Attendance', icon: <CalendarCheck2 className="w-4 h-4" />, testId: 'attendance-nav' },
    { id: 'library', label: 'Library', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <aside className="w-56 md:w-60 bg-[var(--surface-card)] border-r border-[var(--surface-border)] flex flex-col justify-between shrink-0 select-none">
      <div>
        {/* University Crest / Title */}
        <div className="p-4 border-b border-[var(--surface-border)] flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[var(--accent-primary)] text-white flex items-center justify-center shadow-sm">
            <UniversityIcon className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-semibold text-[var(--text-primary)] tracking-tight leading-tight truncate">
              Apex State University
            </h1>
            <p className="text-[11px] text-[var(--text-secondary)] leading-none mt-0.5 truncate">
              Student Service Portal
            </p>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="p-3 space-y-1">
          <div className="px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)]">
            Navigation
          </div>
          {navItems.map((item) => {
            const isActive = currentRoute === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                data-onestep-id={item.testId}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all text-left cursor-pointer ${
                  isActive
                    ? 'bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] font-medium'
                    : 'text-[var(--text-primary)] hover:bg-[var(--surface-secondary)]'
                }`}
              >
                <span className={isActive ? 'text-[var(--accent-primary)]' : 'text-[var(--text-secondary)]'}>
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Student Profile Card Footer */}
      <div className="p-3 border-t border-[var(--surface-border)] m-2 rounded-xl bg-[var(--bg-main)]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[var(--surface-secondary)] border border-[var(--surface-border)] flex items-center justify-center text-[var(--accent-primary)] font-medium text-xs shrink-0">
            AS
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-[var(--text-primary)] truncate">
              {STUDENT_PROFILE.name}
            </p>
            <p className="text-xs text-[var(--text-secondary)] font-mono tabular-nums truncate">
              {STUDENT_PROFILE.rollNumber}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};
