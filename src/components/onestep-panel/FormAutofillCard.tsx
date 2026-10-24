import React, { useState } from 'react';
import { FileEdit, CheckCircle2, ShieldCheck, ArrowRight, X, AlertCircle } from 'lucide-react';
import { AutofillMapping } from '../../extension/types';

interface FormAutofillCardProps {
  mappings: AutofillMapping[];
  onApproveAutofill: (approvedMappings: AutofillMapping[]) => void;
  onCancel: () => void;
}

export const FormAutofillCard: React.FC<FormAutofillCardProps> = ({
  mappings,
  onApproveAutofill,
  onCancel,
}) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(mappings.map((m) => m.element_id))
  );

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const handleApprove = () => {
    const approved = mappings.filter((m) => selectedIds.has(m.element_id));
    onApproveAutofill(approved);
  };

  return (
    <div className="p-4 space-y-4 flex-1 flex flex-col justify-between overflow-y-auto select-none">
      <div className="space-y-4">
        {/* Header */}
        <div className="bg-[#FFFDF9] border border-[#7656A7]/30 rounded-xl p-3.5 shadow-xs">
          <div className="flex items-center gap-2 text-[#7656A7] font-bold text-xs uppercase tracking-wider mb-1">
            <FileEdit className="w-4 h-4" />
            <span>Review Form Autofill</span>
          </div>
          <h3 className="text-sm font-bold text-[#2B2825]">
            OneStep detected {mappings.length} fillable field(s)
          </h3>
          <p className="text-xs text-[#6E6860] mt-0.5 leading-relaxed">
            Verify the proposed values before inserting. Uncheck any fields you wish to leave untouched. Forms will never be submitted automatically.
          </p>
        </div>

        {/* Fields Table / Checklist */}
        <div className="bg-[#FFFDF9] border border-[#E5DEC9] rounded-xl overflow-hidden shadow-xs">
          <div className="p-2.5 bg-[#F7F3EC] border-b border-[#E5DEC9] flex items-center justify-between text-[11px] font-bold text-[#6E6860]">
            <span>Proposed Field Mappings</span>
            <span className="font-mono">{selectedIds.size}/{mappings.length} selected</span>
          </div>
          <div className="divide-y divide-[#E5DEC9] max-h-52 overflow-y-auto">
            {mappings.map((m) => {
              const isChecked = selectedIds.has(m.element_id);
              return (
                <div
                  key={m.element_id}
                  onClick={() => toggleSelect(m.element_id)}
                  className={`p-2.5 flex items-start gap-2.5 text-xs cursor-pointer transition-colors ${
                    isChecked ? 'bg-[#7656A7]/5' : 'hover:bg-[#F7F3EC]/50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {}} // handled by parent onClick
                    className="mt-0.5 accent-[#7656A7]"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#2B2825] truncate">
                        {m.field_label}
                      </span>
                      <span className="text-[10px] font-mono text-[#7656A7] bg-[#7656A7]/10 px-1.5 py-0.2 rounded">
                        [{m.element_id}]
                      </span>
                    </div>
                    <p className="text-[11px] font-mono text-[#4A7C59] font-medium mt-0.5 truncate">
                      "{m.proposed_value}"
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Safety Note */}
        <div className="p-3 bg-[#F7F3EC] border border-[#E5DEC9] rounded-xl flex items-start gap-2 text-xs">
          <ShieldCheck className="w-4 h-4 text-[#4A7C59] shrink-0 mt-0.5" />
          <div className="text-[11px] text-[#6E6860] leading-relaxed">
            <strong className="text-[#2B2825]">Privacy Guard:</strong> Values will be populated into the live DOM fields. Passwords and payment cards are strictly excluded from autofill.
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="pt-2 border-t border-[#E5DEC9] space-y-2">
        <button
          onClick={handleApprove}
          disabled={selectedIds.size === 0}
          className="w-full py-2.5 px-4 rounded-xl bg-[#7656A7] hover:bg-[#654791] disabled:opacity-40 text-white text-xs font-semibold shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
        >
          <span>Fill {selectedIds.size} Field(s)</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={onCancel}
          className="w-full py-2 px-4 rounded-xl bg-transparent hover:bg-[#EFE9DF] text-[#6E6860] hover:text-[#2B2825] text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
          <span>Skip Autofill</span>
        </button>
      </div>
    </div>
  );
};
