import React, { useEffect, useState, useRef, useCallback } from 'react';
import { getOptimalHighlightColor } from '../utils/contrast';
import { HighlightColorConfig } from '../types';

interface HighlightOverlayProps {
  targetId: string | null;
  tooltipText: string;
  isActive: boolean;
  pulseTrigger?: number;
  portalContainerRef: React.RefObject<HTMLDivElement | null>;
  onTargetClick?: () => void;
}

interface ElementRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export const HighlightOverlay: React.FC<HighlightOverlayProps> = ({
  targetId,
  tooltipText,
  isActive,
  pulseTrigger = 0,
  portalContainerRef,
  onTargetClick,
}) => {
  const [rect, setRect] = useState<ElementRect | null>(null);
  const [highlightColor, setHighlightColor] = useState<HighlightColorConfig>(getOptimalHighlightColor(null));
  const [isPulsing, setIsPulsing] = useState(false);
  const elementRef = useRef<HTMLElement | null>(null);

  const updatePosition = useCallback(() => {
    if (!targetId || !portalContainerRef.current) {
      setRect(null);
      return;
    }

    const targetEl = portalContainerRef.current.querySelector<HTMLElement>(`[data-onestep-id="${targetId}"]`);
    if (!targetEl) {
      setRect(null);
      return;
    }

    elementRef.current = targetEl;

    // Contrast check using non-AI color inspection
    const optimalColor = getOptimalHighlightColor(targetEl);
    setHighlightColor(optimalColor);

    const containerRect = portalContainerRef.current.getBoundingClientRect();
    const targetBounding = targetEl.getBoundingClientRect();

    setRect({
      top: targetBounding.top - containerRect.top + portalContainerRef.current.scrollTop,
      left: targetBounding.left - containerRect.left + portalContainerRef.current.scrollLeft,
      width: targetBounding.width,
      height: targetBounding.height,
    });
  }, [targetId, portalContainerRef]);

  // Recalculate on targetId change, window resize, or scroll inside portal
  useEffect(() => {
    if (!isActive) {
      setRect(null);
      return;
    }

    // Small delay to let any layout transitions settle
    const timer = setTimeout(updatePosition, 60);

    const container = portalContainerRef.current;
    if (container) {
      container.addEventListener('scroll', updatePosition, { passive: true });
    }
    window.addEventListener('resize', updatePosition);

    const observer = new MutationObserver(updatePosition);
    if (container) {
      observer.observe(container, { childList: true, subtree: true, attributes: true });
    }

    return () => {
      clearTimeout(timer);
      if (container) {
        container.removeEventListener('scroll', updatePosition);
      }
      window.removeEventListener('resize', updatePosition);
      observer.disconnect();
    };
  }, [targetId, isActive, updatePosition, portalContainerRef]);

  // Handle pulse trigger from "Show me" button
  useEffect(() => {
    if (pulseTrigger > 0 && rect && elementRef.current) {
      setIsPulsing(true);
      elementRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      const timer = setTimeout(() => setIsPulsing(false), 2400);
      return () => clearTimeout(timer);
    }
  }, [pulseTrigger, rect]);

  if (!isActive || !rect || !targetId) {
    return null;
  }

  // Determine tooltip placement (above if enough space, otherwise below)
  const isNearTop = rect.top < 65;

  return (
    <div
      className="absolute pointer-events-none z-30 transition-all duration-300 ease-out"
      style={{
        top: `${rect.top - 4}px`,
        left: `${rect.left - 4}px`,
        width: `${rect.width + 8}px`,
        height: `${rect.height + 8}px`,
      }}
    >
      <div
        className={`w-full h-full rounded-lg transition-all duration-300 ${
          isPulsing ? 'animate-pulse' : ''
        }`}
        style={{
          border: `2px solid ${highlightColor.hex}`,
          boxShadow: `0 0 0 1px rgba(255, 255, 255, 0.5), 0 0 16px 2px ${highlightColor.glow}`,
        }}
      />

      {/* Floating tooltip badge */}
      <div
        className="absolute left-1/2 -translate-x-1/2 flex items-center pointer-events-auto shadow-md transition-all duration-200"
        style={{
          ...(isNearTop
            ? { top: `${rect.height + 12}px` }
            : { bottom: `${rect.height + 12}px` }),
        }}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onTargetClick) onTargetClick();
            if (elementRef.current) {
              elementRef.current.click();
            }
          }}
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium cursor-pointer transition-transform hover:scale-[1.01] active:scale-[0.99] shadow-sm whitespace-nowrap border border-white/30"
          style={{
            backgroundColor: highlightColor.badgeBg,
            color: highlightColor.badgeText,
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-white/90" />
          <span>{tooltipText}</span>
        </button>
      </div>
    </div>
  );
};
