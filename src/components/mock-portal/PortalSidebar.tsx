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
    <aside className="w-56 md:w-60 bg-[#FFFDF9] border-r border-[#E5DEC9] flex flex-col justify-between shrink-0 select-none">
      <div>
        {/* University Crest / Title */}
        <div className="p-4 border-b border-[#E5DEC9] flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#7656A7] text-white flex items-center justify-center font-bold shadow-xs">
            <UniversityIcon className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-[#2B2825] tracking-tight leading-tight truncate">
              Apex State University
            </h1>
            <p className="text-[11px] text-[#6E6860] leading-none mt-0.5 truncate">
              Student Service Portal
            </p>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="p-3 space-y-1">
          <div className="px-3 py-1.5 text-[10px] font-semibold text-[#6E6860] uppercase tracking-wider">
            Portal Menu
          </div>
          {navItems.map((item) => {
            const isActive = currentRoute === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                data-onestep-id={item.testId}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all text-left cursor-pointer ${
                  isActive
                    ? 'bg-[#7656A7]/10 text-[#7656A7] font-semibold shadow-2xs'
                    : 'text-[#2B2825] hover:bg-[#EFE9DF]/80 hover:text-[#7656A7]'
                }`}
              >
                <span className={isActive ? 'text-[#7656A7]' : 'text-[#6E6860]'}>
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Student Profile Card Footer */}
      <div className="p-3 border-t border-[#E5DEC9] bg-[#F7F3EC]/50 m-2 rounded-xl">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#E5DEC9] border border-[#DCD3BE] flex items-center justify-center text-[#7656A7] font-bold text-xs shrink-0">
            AS
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-[#2B2825] truncate">
              {STUDENT_PROFILE.name}
            </p>
            <p className="text-[11px] text-[#6E6860] font-mono tabular-nums truncate">
              {STUDENT_PROFILE.rollNumber}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};
