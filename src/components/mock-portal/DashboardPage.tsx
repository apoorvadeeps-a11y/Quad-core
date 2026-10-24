import React from 'react';
import {
  CreditCard,
  GraduationCap,
  CalendarCheck2,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Award,
  Bell,
  Clock,
  Sparkles,
} from 'lucide-react';
import { STUDENT_PROFILE, RECENT_ACTIVITIES } from '../../data/mockPortalData';
import { PortalRoute, FinanceTab } from '../../types';

interface DashboardPageProps {
  onNavigate: (route: PortalRoute, subTab?: FinanceTab) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-[#FFFDF9] border border-[#E5DEC9] rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#7656A7] mb-1">
            <span>Student Dashboard</span>
            <span aria-hidden="true">·</span>
            <span>{STUDENT_PROFILE.academicYear}</span>
          </div>
          <h2 className="text-xl font-bold text-[#2B2825]">
            Welcome back, {STUDENT_PROFILE.name}
          </h2>
          <p className="text-xs text-[#6E6860] mt-0.5">
            {STUDENT_PROFILE.department} · {STUDENT_PROFILE.semester} · Roll #{STUDENT_PROFILE.rollNumber}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('finance', 'overview')}
            data-onestep-id="fee-payments"
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#7656A7] text-white text-xs font-medium hover:bg-[#654791] transition-colors cursor-pointer shadow-xs whitespace-nowrap"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Open Fee Payments</span>
          </button>
        </div>
      </div>

      {/* Academic Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#FFFDF9] border border-[#E5DEC9] rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-[#6E6860] text-xs font-medium mb-1">
            <span>Cumulative GPA</span>
            <Award className="w-4 h-4 text-[#7656A7]" />
          </div>
          <div className="text-2xl font-bold text-[#2B2825] font-mono tabular-nums">
            {STUDENT_PROFILE.cgpa.toFixed(2)}
            <span className="text-xs font-normal text-[#6E6860] ml-1">/ 10.0</span>
          </div>
          <p className="text-[11px] text-[#4A7C59] font-medium mt-1">
            Top 5% in CSE cohort
          </p>
        </div>

        <div className="bg-[#FFFDF9] border border-[#E5DEC9] rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-[#6E6860] text-xs font-medium mb-1">
            <span>Completed Credits</span>
            <TrendingUp className="w-4 h-4 text-[#7656A7]" />
          </div>
          <div className="text-2xl font-bold text-[#2B2825] font-mono tabular-nums">
            {STUDENT_PROFILE.creditsEarned}
            <span className="text-xs font-normal text-[#6E6860] ml-1">/ {STUDENT_PROFILE.totalCredits}</span>
          </div>
          <p className="text-[11px] text-[#6E6860] mt-1">
            58.7% degree requirement fulfilled
          </p>
        </div>

        <div className="bg-[#FFFDF9] border border-[#E5DEC9] rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-[#6E6860] text-xs font-medium mb-1">
            <span>Current Attendance</span>
            <CalendarCheck2 className="w-4 h-4 text-[#4A7C59]" />
          </div>
          <div className="text-2xl font-bold text-[#2B2825] font-mono tabular-nums">
            {STUDENT_PROFILE.attendancePercent}%
          </div>
          <p className="text-[11px] text-[#4A7C59] font-medium mt-1">
            Eligible for semester examinations
          </p>
        </div>
      </div>

      {/* Quick Actions & Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2 bg-[#FFFDF9] border border-[#E5DEC9] rounded-xl p-5 shadow-xs">
          <h3 className="text-sm font-bold text-[#2B2825] mb-3">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => onNavigate('finance', 'history')}
              className="flex items-start gap-3 p-3 rounded-lg border border-[#E5DEC9] bg-[#F7F3EC]/40 hover:bg-[#EFE9DF] transition-colors text-left cursor-pointer group"
            >
              <div className="p-2 rounded-md bg-[#7656A7]/10 text-[#7656A7] group-hover:scale-105 transition-transform">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-[#2B2825] group-hover:text-[#7656A7] transition-colors">
                  Payment History & Receipts
                </p>
                <p className="text-[11px] text-[#6E6860] mt-0.5">
                  View past invoices and download official receipts
                </p>
              </div>
            </button>

            <button
              onClick={() => onNavigate('academics')}
              className="flex items-start gap-3 p-3 rounded-lg border border-[#E5DEC9] bg-[#F7F3EC]/40 hover:bg-[#EFE9DF] transition-colors text-left cursor-pointer group"
            >
              <div className="p-2 rounded-md bg-[#C86D51]/10 text-[#C86D51] group-hover:scale-105 transition-transform">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-[#2B2825] group-hover:text-[#C86D51] transition-colors">
                  Semester Grade Reports
                </p>
                <p className="text-[11px] text-[#6E6860] mt-0.5">
                  Check term-wise GPA and download marksheets
                </p>
              </div>
            </button>

            <button
              onClick={() => onNavigate('attendance')}
              className="flex items-start gap-3 p-3 rounded-lg border border-[#E5DEC9] bg-[#F7F3EC]/40 hover:bg-[#EFE9DF] transition-colors text-left cursor-pointer group"
            >
              <div className="p-2 rounded-md bg-[#4A7C59]/10 text-[#4A7C59] group-hover:scale-105 transition-transform">
                <CalendarCheck2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-[#2B2825] group-hover:text-[#4A7C59] transition-colors">
                  Biometric Attendance Logs
                </p>
                <p className="text-[11px] text-[#6E6860] mt-0.5">
                  Course-wise lecture hours and shortage alerts
                </p>
              </div>
            </button>

            <button
              onClick={() => onNavigate('library')}
              className="flex items-start gap-3 p-3 rounded-lg border border-[#E5DEC9] bg-[#F7F3EC]/40 hover:bg-[#EFE9DF] transition-colors text-left cursor-pointer group"
            >
              <div className="p-2 rounded-md bg-[#0E8A9A]/10 text-[#0E8A9A] group-hover:scale-105 transition-transform">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-[#2B2825] group-hover:text-[#0E8A9A] transition-colors">
                  Library Catalog & Holds
                </p>
                <p className="text-[11px] text-[#6E6860] mt-0.5">
                  Browse physical reserves and renew journal access
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-[#FFFDF9] border border-[#E5DEC9] rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-[#2B2825]">
              Recent Activity
            </h3>
            <span className="text-[11px] text-[#7656A7] font-medium">
              Live Feed
            </span>
          </div>
          <div className="space-y-3">
            {RECENT_ACTIVITIES.map((act) => (
              <div key={act.id} className="flex items-start gap-2.5 pb-2.5 border-b border-[#E5DEC9]/60 last:border-0 last:pb-0">
                <div className="w-2 h-2 rounded-full bg-[#7656A7] mt-1.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-[#2B2825] leading-tight">
                    {act.title}
                  </p>
                  <p className="text-[11px] text-[#6E6860] mt-0.5 flex items-center gap-1 font-mono tabular-nums">
                    <Clock className="w-3 h-3 inline" />
                    <span>{act.time}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
