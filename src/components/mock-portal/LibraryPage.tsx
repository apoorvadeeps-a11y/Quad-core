import React from 'react';
import { BookOpen, CheckCircle2, Bookmark, Clock } from 'lucide-react';

export const LibraryPage: React.FC = () => {
  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#2B2825]">
            Central Library Services
          </h2>
          <p className="text-xs text-[#6E6860] mt-0.5">
            Book loans, digital catalog, IEEE/ACM journals, and reserved reading carrels
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#FFFDF9] border border-[#E5DEC9] rounded-xl p-5 shadow-xs">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-lg bg-[#0E8A9A]/10 text-[#0E8A9A]">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#2B2825]">Currently Issued Books</h3>
              <p className="text-xs text-[#6E6860]">2 of 4 allowed volumes</p>
            </div>
          </div>
          <div className="space-y-2.5">
            <div className="p-3 rounded-lg border border-[#E5DEC9] bg-[#F7F3EC]/50 text-xs">
              <p className="font-bold text-[#2B2825]">Introduction to Algorithms (CLRS, 4th Ed.)</p>
              <p className="text-[#6E6860] mt-0.5">Due date: 15 Nov 2026 · Renewal available</p>
            </div>
            <div className="p-3 rounded-lg border border-[#E5DEC9] bg-[#F7F3EC]/50 text-xs">
              <p className="font-bold text-[#2B2825]">Database System Concepts (Silberschatz)</p>
              <p className="text-[#6E6860] mt-0.5">Due date: 20 Nov 2026 · Renewal available</p>
            </div>
          </div>
        </div>

        <div className="bg-[#FFFDF9] border border-[#E5DEC9] rounded-xl p-5 shadow-xs">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-lg bg-[#4A7C59]/10 text-[#4A7C59]">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#2B2825]">Library Dues & Clearance</h3>
              <p className="text-xs text-[#4A7C59] font-medium">Clear · ₹0.00 outstanding</p>
            </div>
          </div>
          <p className="text-xs text-[#6E6860] leading-relaxed">
            Annual digital library and research database access fees of ₹2,000 were settled on 05 Aug 2025.
            No overdue fines recorded.
          </p>
        </div>
      </div>
    </div>
  );
};
