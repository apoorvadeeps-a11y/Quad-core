import React, { useState } from 'react';
import { Award, Download, CheckCircle2, ChevronDown, ChevronUp, FileSpreadsheet } from 'lucide-react';
import { COURSES_SEM5, STUDENT_PROFILE } from '../../data/mockPortalData';

interface AcademicPageProps {
  onDownloadMarksheet?: () => void;
}

export const AcademicPage: React.FC<AcademicPageProps> = ({ onDownloadMarksheet }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#2B2825]">
            Academic Records & Marksheets
          </h2>
          <p className="text-xs text-[#6E6860] mt-0.5">
            Semester-wise performance transcripts, course grades, and degree progress
          </p>
        </div>
      </div>

      {/* Semester 5 Results Card */}
      <div
        data-onestep-id="sem5-results-card"
        className="bg-[#FFFDF9] border border-[#E5DEC9] rounded-xl overflow-hidden shadow-xs"
      >
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-5 flex items-center justify-between cursor-pointer hover:bg-[#F7F3EC]/40 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-[#7656A7]/10 text-[#7656A7]">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-[#2B2825]">
                  Semester 5 (Fall 2026) Results
                </h3>
                <span className="text-[11px] font-semibold text-[#4A7C59] bg-[#4A7C59]/10 px-2 py-0.5 rounded-full">
                  Verified by Registrar
                </span>
              </div>
              <p className="text-xs text-[#6E6860] mt-0.5">
                Semester GPA: <strong className="text-[#2B2825] font-mono tabular-nums">9.20</strong> · CGPA: <strong className="text-[#2B2825] font-mono tabular-nums">{STUDENT_PROFILE.cgpa}</strong> · 19 Credits Earned
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onDownloadMarksheet) onDownloadMarksheet();
              }}
              data-onestep-id="download-marksheet-btn"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#7656A7] text-white text-xs font-semibold hover:bg-[#654791] transition-colors cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Marksheet</span>
            </button>
            <div className="p-1 text-[#6E6860]">
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </div>
        </div>

        {isExpanded && (
          <div className="border-t border-[#E5DEC9] p-4 bg-[#F7F3EC]/20">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="text-[#6E6860] border-b border-[#E5DEC9] pb-2">
                  <tr>
                    <th className="py-2 px-3 font-semibold">Course Code & Title</th>
                    <th className="py-2 px-3 font-semibold text-center">Credits</th>
                    <th className="py-2 px-3 font-semibold text-center">Grade</th>
                    <th className="py-2 px-3 font-semibold text-center">Grade Point</th>
                    <th className="py-2 px-3 font-semibold text-right">Attendance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5DEC9]">
                  {COURSES_SEM5.map((c) => (
                    <tr key={c.code} className="hover:bg-[#FFFDF9]">
                      <td className="py-2.5 px-3 font-medium text-[#2B2825]">
                        <span className="font-mono text-[#7656A7] font-semibold mr-1.5">{c.code}</span>
                        {c.title}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono tabular-nums">{c.credits}</td>
                      <td className="py-2.5 px-3 text-center font-bold text-[#2B2825]">{c.grade}</td>
                      <td className="py-2.5 px-3 text-center font-mono tabular-nums">{c.gradePoint}</td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-[#4A7C59]">{c.attendance}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Past Semesters summary */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-[#6E6860] uppercase tracking-wider">Previous Semesters</h4>
        {['Semester 4 (Spring 2026)', 'Semester 3 (Fall 2025)', 'Semester 2 (Spring 2025)'].map((sem, idx) => (
          <div key={sem} className="bg-[#FFFDF9] border border-[#E5DEC9] rounded-xl p-4 flex items-center justify-between text-xs">
            <div>
              <p className="font-bold text-[#2B2825]">{sem}</p>
              <p className="text-[#6E6860] mt-0.5">SGPA: {idx === 0 ? '8.90' : idx === 1 ? '8.80' : '8.75'} · All credits cleared</p>
            </div>
            <button className="px-3 py-1.5 rounded-lg border border-[#E5DEC9] bg-[#F7F3EC] text-[#2B2825] hover:bg-[#EFE9DF] font-medium cursor-pointer">
              View Ledger
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
