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
      className={`relative w-1.5 shrink-0 cursor-col-resize select-none transition-colors duration-150 flex items-center justify-center z-20 ${
        isDragging || isHovered ? 'bg-[var(--accent-primary)]/25' : 'bg-[var(--surface-border)] hover:bg-[var(--accent-primary)]/40'
      }`}
      title="Drag to resize panels (Double-click to reset to 70:30)"
    >
      <div
        className={`w-4 h-11 rounded-full border flex items-center justify-center transition-all ${
          isDragging || isHovered
            ? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)] shadow-sm scale-105'
            : 'bg-[var(--surface-card)] text-[var(--text-secondary)] border-[var(--surface-border)]'
        }`}
      >
        <GripVertical className="w-3 h-3" />
      </div>

      {isDragging && (
        <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-px bg-[var(--accent-primary)] pointer-events-none" />
      )}
    </div>
  );
};
