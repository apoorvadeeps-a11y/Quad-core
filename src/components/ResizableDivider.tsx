import React, { useState } from 'react';
import { GripVertical } from 'lucide-react';

interface ResizableDividerProps {
  onDragStart: (e: React.MouseEvent | React.TouchEvent) => void;
  onReset: () => void;
  isDragging: boolean;
}

export const ResizableDivider: React.FC<ResizableDividerProps> = ({
  onDragStart,
  onReset,
  isDragging,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      tabIndex={0}
      onMouseDown={onDragStart}
      onTouchStart={onDragStart}
      onDoubleClick={onReset}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative w-2 shrink-0 cursor-col-resize select-none transition-colors duration-150 flex items-center justify-center z-20 ${
        isDragging || isHovered ? 'bg-[#7656A7]/20' : 'bg-[#E5DEC9] hover:bg-[#7656A7]/30'
      }`}
      title="Drag to resize panels (Double-click to reset to 70:30)"
    >
      {/* Central handle pill */}
      <div
        className={`w-4 h-12 rounded-full border flex items-center justify-center transition-all ${
          isDragging || isHovered
            ? 'bg-[#7656A7] text-white border-[#7656A7] shadow-sm scale-105'
            : 'bg-[#FFFDF9] text-[#6E6860] border-[#E5DEC9]'
        }`}
      >
        <GripVertical className="w-3 h-3" />
      </div>

      {/* Guide line indicator when dragging */}
      {isDragging && (
        <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-0.5 bg-[#7656A7] pointer-events-none" />
      )}
    </div>
  );
};
