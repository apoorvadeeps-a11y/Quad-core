import React from 'react';
import { Compass, ArrowRight, CornerDownLeft, AlertCircle } from 'lucide-react';
import { PortalRoute } from '../../types';

interface WrongTurnCardProps {
  currentRoute: PortalRoute;
  expectedRoute: PortalRoute;
  expectedInstruction: string;
  onRecoverRoute: () => void;
  onDismiss: () => void;
}

export const WrongTurnCard: React.FC<WrongTurnCardProps> = ({
  currentRoute,
  expectedRoute,
  expectedInstruction,
  onRecoverRoute,
  onDismiss,
}) => {
  return (
    <div className="mx-4 my-2 p-3.5 rounded-xl border border-[#C86D51]/40 bg-[#FFFDF9] shadow-sm space-y-3 animate-in fade-in slide-in-from-top duration-200">
      <div className="flex items-start gap-2.5">
        <div className="p-1.5 rounded-lg bg-[#C86D51]/15 text-[#C86D51] shrink-0 mt-0.5">
          <AlertCircle className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-[#2B2825]">
            Looks like we're on a different page.
          </h4>
          <p className="text-[11px] text-[#6E6860] mt-0.5 leading-relaxed">
            You're currently in <strong className="capitalize text-[#2B2825]">{currentRoute}</strong>, but our next step requires <strong className="capitalize text-[#7656A7]">{expectedRoute}</strong>.
          </p>
        </div>
      </div>

      <p className="text-[11px] font-semibold text-[#7656A7]">
        Let's get you back on track.
      </p>

      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={onRecoverRoute}
          className="flex-1 py-1.5 px-3 rounded-lg bg-[#7656A7] hover:bg-[#654791] text-white text-xs font-semibold cursor-pointer transition-colors shadow-2xs flex items-center justify-center gap-1.5"
        >
          <CornerDownLeft className="w-3 h-3" />
          <span>Find the right path</span>
        </button>

        <button
          onClick={onDismiss}
          className="py-1.5 px-3 rounded-lg bg-[#F7F3EC] hover:bg-[#EFE9DF] text-[#6E6860] hover:text-[#2B2825] text-xs font-medium cursor-pointer transition-colors border border-[#E5DEC9]"
        >
          Continue from here
        </button>
      </div>
    </div>
  );
};
