import React from 'react';
import { X, Download, Printer, CheckCircle2, ShieldCheck, GraduationCap } from 'lucide-react';
import { STUDENT_PROFILE } from '../data/mockPortalData';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-[#FFFDF9] border border-[#E5DEC9] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Toolbar */}
        <div className="p-4 border-b border-[#E5DEC9] bg-[#F7F3EC] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#7656A7] bg-[#7656A7]/10 px-2 py-0.5 rounded-full">
              Downloaded Voucher
            </span>
            <span className="text-xs text-[#6E6860]">Receipt_Semester_2026.pdf</span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1 rounded-lg hover:bg-[#EFE9DF] text-[#6E6860] hover:text-[#2B2825] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* PDF Simulated Sheet */}
        <div className="p-6 overflow-y-auto space-y-6 text-[#2B2825]">
          {/* Header */}
          <div className="border-b border-[#E5DEC9] pb-4 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#7656A7] text-white flex items-center justify-center font-bold">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#2B2825] leading-tight">
                  Apex State University
                </h3>
                <p className="text-[11px] text-[#6E6860]">Office of University Finance & Bursar</p>
                <p className="text-[10px] text-[#6E6860]">Accredited A++ by National Assessment Council</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-[#6E6860] block font-mono">RECEIPT #</span>
              <span className="text-xs font-bold font-mono text-[#2B2825]">TXN-2026-8812</span>
            </div>
          </div>

          {/* Student Info Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs bg-[#F7F3EC]/50 p-3.5 rounded-xl border border-[#E5DEC9]">
            <div>
              <span className="text-[10px] text-[#6E6860] block">Student Name</span>
              <span className="font-bold text-[#2B2825]">{STUDENT_PROFILE.name}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#6E6860] block">Roll Number</span>
              <span className="font-mono font-bold text-[#2B2825]">{STUDENT_PROFILE.rollNumber}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#6E6860] block">Program & Term</span>
              <span>{STUDENT_PROFILE.department} · Sem 5</span>
            </div>
            <div>
              <span className="text-[10px] text-[#6E6860] block">Payment Date</span>
              <span className="font-mono">12 Jan 2026, 14:22 IST</span>
            </div>
          </div>

          {/* Line items */}
          <div>
            <table className="w-full text-xs text-left">
              <thead className="border-b border-[#E5DEC9] text-[#6E6860] font-semibold">
                <tr>
                  <th className="py-2">Description</th>
                  <th className="py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5DEC9]/70 text-[#2B2825]">
                <tr>
                  <td className="py-2">Semester 5 Tuition & Instructional Fee</td>
                  <td className="py-2 text-right font-mono tabular-nums">₹38,000.00</td>
                </tr>
                <tr>
                  <td className="py-2">Advanced Computing Laboratory & Cloud Labs</td>
                  <td className="py-2 text-right font-mono tabular-nums">₹5,000.00</td>
                </tr>
                <tr>
                  <td className="py-2">Student Activity & Examination Fee</td>
                  <td className="py-2 text-right font-mono tabular-nums">₹2,000.00</td>
                </tr>
                <tr className="font-bold text-sm bg-[#F7F3EC]/60">
                  <td className="py-2.5 px-2">Total Amount Paid</td>
                  <td className="py-2.5 px-2 text-right font-mono tabular-nums text-[#4A7C59]">₹45,000.00</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Stamp */}
          <div className="flex items-center justify-between pt-2 border-t border-[#E5DEC9] text-[11px] text-[#6E6860]">
            <div className="flex items-center gap-1.5 text-[#4A7C59] font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>Digitally verified by Bursar Accounts</span>
            </div>
            <div className="text-right">
              <span className="font-mono text-[10px]">AUTH_TOKEN: 8812-ASU-VALID</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E5DEC9] bg-[#F7F3EC] flex items-center justify-between">
          <span className="text-xs text-[#6E6860]">Stored in browser memory</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#2B2825] text-white text-xs font-semibold hover:bg-[#1C1A18] transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
