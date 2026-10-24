import React from 'react';
import { CalendarCheck2, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { COURSES_SEM5, STUDENT_PROFILE } from '../../data/mockPortalData';

export const AttendancePage: React.FC = () => {
  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#2B2825]">
            Attendance Dashboard & Biometric Logs
          </h2>
          <p className="text-xs text-[#6E6860] mt-0.5">
            Real-time biometric lecture attendance and minimum mandatory threshold compliance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-[#4A7C59]/10 text-[#4A7C59] text-xs font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Eligible for Final Exams</span>
          </span>
        </div>
      </div>

      {/* Aggregate Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#FFFDF9] border border-[#E5DEC9] rounded-xl p-4 shadow-xs">
          <span className="text-[11px] text-[#6E6860] font-medium block">Total Aggregate Attendance</span>
          <p className="text-2xl font-bold text-[#4A7C59] font-mono tabular-nums mt-1">
            {STUDENT_PROFILE.attendancePercent}%
          </p>
          <p className="text-[11px] text-[#6E6860] mt-1">University Rule: Min 75.0% required</p>
        </div>
        <div className="bg-[#FFFDF9] border border-[#E5DEC9] rounded-xl p-4 shadow-xs">
          <span className="text-[11px] text-[#6E6860] font-medium block">Classes Attended / Conducted</span>
          <p className="text-2xl font-bold text-[#2B2825] font-mono tabular-nums mt-1">
            282 <span className="text-xs text-[#6E6860] font-normal">/ 319 hours</span>
          </p>
          <p className="text-[11px] text-[#6E6860] mt-1">37 authorized medical/leave hours</p>
        </div>
        <div className="bg-[#FFFDF9] border border-[#E5DEC9] rounded-xl p-4 shadow-xs">
          <span className="text-[11px] text-[#6E6860] font-medium block">Courses with Shortage</span>
          <p className="text-2xl font-bold text-[#2B2825] font-mono tabular-nums mt-1">
            0
          </p>
          <p className="text-[11px] text-[#4A7C59] font-medium mt-1">Zero debarment risks detected</p>
        </div>
      </div>

      {/* Course Breakdown Table */}
      <div
        data-onestep-id="subject-attendance-view"
        className="bg-[#FFFDF9] border border-[#E5DEC9] rounded-xl overflow-hidden shadow-xs"
      >
        <div className="p-4 border-b border-[#E5DEC9] bg-[#F7F3EC]/50 flex items-center justify-between">
          <h3 className="text-xs font-bold text-[#2B2825] uppercase tracking-wider">
            Subject-Wise Attendance Report
          </h3>
          <span className="text-[11px] text-[#6E6860]">Updated today at 08:00 AM</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F7F3EC] text-[#6E6860] border-b border-[#E5DEC9]">
              <tr>
                <th className="py-2.5 px-4 font-semibold">Course Code & Name</th>
                <th className="py-2.5 px-4 font-semibold text-center">Attended</th>
                <th className="py-2.5 px-4 font-semibold text-center">Conducted</th>
                <th className="py-2.5 px-4 font-semibold text-center">Percentage</th>
                <th className="py-2.5 px-4 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5DEC9]">
              {COURSES_SEM5.map((c) => (
                <tr key={c.code} className="hover:bg-[#F7F3EC]/30">
                  <td className="py-3 px-4 font-medium text-[#2B2825]">
                    <span className="font-mono text-[#7656A7] font-semibold mr-1.5">{c.code}</span>
                    {c.title}
                  </td>
                  <td className="py-3 px-4 text-center font-mono tabular-nums text-[#2B2825]">
                    {Math.round((c.attendance / 100) * 54)}
                  </td>
                  <td className="py-3 px-4 text-center font-mono tabular-nums text-[#6E6860]">54</td>
                  <td className="py-3 px-4 text-center font-mono tabular-nums font-bold text-[#4A7C59]">
                    {c.attendance}%
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#4A7C59]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Compliant</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
