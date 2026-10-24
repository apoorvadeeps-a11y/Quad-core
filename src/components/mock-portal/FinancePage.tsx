import React from 'react';
import {
  CreditCard,
  History,
  AlertCircle,
  FileText,
  Download,
  CheckCircle2,
  Calendar,
  ExternalLink,
  ShieldCheck,
  Search,
} from 'lucide-react';
import { FinanceTab, PaymentRecord } from '../../types';
import { PAYMENT_RECORDS } from '../../data/mockPortalData';

interface FinancePageProps {
  currentTab: FinanceTab;
  onTabChange: (tab: FinanceTab) => void;
  onDownloadReceipt: (record: PaymentRecord) => void;
}

export const FinancePage: React.FC<FinancePageProps> = ({
  currentTab,
  onTabChange,
  onDownloadReceipt,
}) => {
  const tabs: { id: FinanceTab; label: string; icon: React.ReactNode; testId?: string }[] = [
    { id: 'overview', label: 'Fee Payments', icon: <CreditCard className="w-4 h-4" />, testId: 'fee-payments' },
    { id: 'history', label: 'Payment History', icon: <History className="w-4 h-4" />, testId: 'payment-history-tab' },
    { id: 'pending', label: 'Pending Fees', icon: <AlertCircle className="w-4 h-4" /> },
    { id: 'scholarships', label: 'Scholarships & Grants', icon: <ShieldCheck className="w-4 h-4" /> },
  ];

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#2B2825]">
            Student Finance & Billing
          </h2>
          <p className="text-xs text-[#6E6860] mt-0.5">
            Manage tuition fees, cleared payment vouchers, and official tax receipts
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <span className="text-[11px] text-[#6E6860] block">Current Balance</span>
            <span className="text-base font-bold text-[#4A7C59] font-mono tabular-nums">
              ₹0.00 (All Clear)
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="flex items-center gap-2 border-b border-[#E5DEC9] overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              data-onestep-id={tab.testId}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'border-[#7656A7] text-[#7656A7] bg-[#7656A7]/5'
                  : 'border-transparent text-[#6E6860] hover:text-[#2B2825] hover:bg-[#EFE9DF]/50'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.id === 'history' && (
                <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-[#E5DEC9] text-[#2B2825] font-mono tabular-nums">
                  3
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {currentTab === 'overview' && (
        <div className="space-y-5">
          <div className="bg-[#FFFDF9] border border-[#E5DEC9] rounded-xl p-5 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-semibold text-[#4A7C59] bg-[#4A7C59]/10 px-2.5 py-0.5 rounded-full inline-block mb-1">
                  Active Term Status · Paid in Full
                </span>
                <h3 className="text-base font-bold text-[#2B2825]">
                  Semester 5 (Fall 2026) Tuition Fee
                </h3>
                <p className="text-xs text-[#6E6860] mt-1 max-w-xl">
                  Payment of ₹45,000 received and verified by the university accounts office on Jan 12, 2026.
                  Official digital voucher has been generated with university bursar stamp.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
                <button
                  onClick={() => onTabChange('history')}
                  data-onestep-id="payment-history-tab"
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#7656A7] text-white text-xs font-semibold hover:bg-[#654791] transition-colors cursor-pointer shadow-xs"
                >
                  <History className="w-4 h-4" />
                  <span>Open Payment History</span>
                </button>
              </div>
            </div>
          </div>

          {/* Breakdown cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#FFFDF9] border border-[#E5DEC9] rounded-xl p-4 shadow-xs">
              <span className="text-[11px] text-[#6E6860] font-medium block">Total Fees Invoiced (2025-2026)</span>
              <p className="text-xl font-bold text-[#2B2825] font-mono tabular-nums mt-1">₹79,000</p>
              <p className="text-[11px] text-[#6E6860] mt-1">Tuition, Labs, Library, Hostel</p>
            </div>
            <div className="bg-[#FFFDF9] border border-[#E5DEC9] rounded-xl p-4 shadow-xs">
              <span className="text-[11px] text-[#6E6860] font-medium block">Total Settled Amount</span>
              <p className="text-xl font-bold text-[#4A7C59] font-mono tabular-nums mt-1">₹79,000</p>
              <p className="text-[11px] text-[#4A7C59] font-medium mt-1">100% Cleared · 0 Overdue</p>
            </div>
            <div className="bg-[#FFFDF9] border border-[#E5DEC9] rounded-xl p-4 shadow-xs">
              <span className="text-[11px] text-[#6E6860] font-medium block">Merit Scholarship Applied</span>
              <p className="text-xl font-bold text-[#7656A7] font-mono tabular-nums mt-1">₹15,000</p>
              <p className="text-[11px] text-[#6E6860] mt-1">Dean’s Honor Roll Grant</p>
            </div>
          </div>
        </div>
      )}

      {currentTab === 'history' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FFFDF9] p-3 rounded-xl border border-[#E5DEC9]">
            <div className="flex items-center gap-2 text-xs text-[#6E6860]">
              <FileText className="w-4 h-4 text-[#7656A7]" />
              <span>Showing <strong>3 verified payment transactions</strong></span>
            </div>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#6E6860]" />
              <input
                type="text"
                readOnly
                value="Semester 5 Fee"
                className="pl-8 pr-3 py-1 text-xs rounded-lg border border-[#E5DEC9] bg-[#F7F3EC] text-[#2B2825] focus:outline-none w-48"
              />
            </div>
          </div>

          {/* Payment History Table */}
          <div className="bg-[#FFFDF9] border border-[#E5DEC9] rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F7F3EC] text-[#6E6860] border-b border-[#E5DEC9]">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Transaction / Description</th>
                    <th className="py-3 px-4 font-semibold">Category</th>
                    <th className="py-3 px-4 font-semibold text-right">Amount</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                    <th className="py-3 px-4 font-semibold">Date & Reference</th>
                    <th className="py-3 px-4 font-semibold text-right">Receipt Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5DEC9]">
                  {PAYMENT_RECORDS.map((rec) => {
                    return (
                      <tr
                        key={rec.id}
                        className={`hover:bg-[#F7F3EC]/50 transition-colors ${
                          rec.isTargetReceipt ? 'bg-[#7656A7]/3' : ''
                        }`}
                      >
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-[#2B2825]">{rec.title}</p>
                          <p className="text-[11px] text-[#6E6860] mt-0.5">{rec.paymentMode}</p>
                        </td>
                        <td className="py-3.5 px-4 text-[#6E6860]">
                          <span className="px-2 py-0.5 rounded-md bg-[#EFE9DF] text-[#2B2825] text-[11px] font-medium">
                            {rec.category}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-right text-[#2B2825] tabular-nums">
                          {rec.formattedAmount}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#4A7C59]">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#4A7C59]" />
                            <span>{rec.status}</span>
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-[#6E6860]">
                          <p className="font-mono tabular-nums text-[11px] text-[#2B2825]">{rec.txnReference}</p>
                          <p className="text-[11px] font-mono tabular-nums mt-0.5">{rec.paymentDate}</p>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => onDownloadReceipt(rec)}
                            data-onestep-id={rec.isTargetReceipt ? 'download-receipt-btn' : undefined}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all shadow-xs ${
                              rec.isTargetReceipt
                                ? 'bg-[#7656A7] hover:bg-[#654791] text-white active:scale-95'
                                : 'bg-[#EFE9DF] hover:bg-[#E5DEC9] text-[#2B2825]'
                            }`}
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download Receipt</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {currentTab === 'pending' && (
        <div className="bg-[#FFFDF9] border border-[#E5DEC9] rounded-xl p-8 text-center shadow-xs">
          <CheckCircle2 className="w-10 h-10 text-[#4A7C59] mx-auto mb-2" />
          <h3 className="text-base font-bold text-[#2B2825]">No Pending Dues</h3>
          <p className="text-xs text-[#6E6860] mt-1 max-w-sm mx-auto">
            You do not have any pending tuition or ancillary fee dues for Semester 5. Next invoice will generate in June 2027.
          </p>
        </div>
      )}

      {currentTab === 'scholarships' && (
        <div className="bg-[#FFFDF9] border border-[#E5DEC9] rounded-xl p-5 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-[#2B2825]">Applied Scholarships</h3>
          <div className="p-3 rounded-lg border border-[#E5DEC9] bg-[#F7F3EC]/50 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-[#2B2825]">Dean's Merit Scholarship (Cohort Top 5%)</p>
              <p className="text-[11px] text-[#6E6860] mt-0.5">Awarded ₹15,000 deduction on Semester 5 Tuition</p>
            </div>
            <span className="text-xs font-semibold text-[#4A7C59]">Active</span>
          </div>
        </div>
      )}
    </div>
  );
};
