import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type InfoTooltipProps = {
  text: string;
};

export function InfoTooltip({ text }: InfoTooltipProps) {
  const triggerRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLSpanElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [tooltipStyles, setTooltipStyles] = useState<{
    left: number;
    top: number;
    maxWidth: number;
  } | null>(null);

  const updateShift = useCallback(() => {
    const trigger = triggerRef.current;
    const tooltip = tooltipRef.current;
    if (!trigger || !tooltip) return;

    const sidebar = trigger.closest("[data-sidebar]") as HTMLElement | null;
    const container = sidebar || document.body;

    const triggerRect = trigger.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    const containerRect = sidebar ? sidebar.getBoundingClientRect() : { left: 0, right: window.innerWidth };
    const padding = 8;
    const viewportLeft = padding;
    const viewportRight = window.innerWidth - padding;
    const containerLeft = Math.max(containerRect.left + padding, viewportLeft);
    const containerRight = Math.min(containerRect.right - padding, viewportRight);
    const desiredLeft = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
    const minLeft = containerLeft;
    const maxLeft = containerRight - tooltipRect.width;
    const clampedLeft = Math.min(Math.max(desiredLeft, minLeft), maxLeft);
    const nextMaxWidth = Math.max(0, Math.round(containerRight - containerLeft));
    setTooltipStyles({
      left: Math.round(clampedLeft),
      top: Math.round(triggerRect.bottom + padding),
      maxWidth: Number.isFinite(nextMaxWidth) ? nextMaxWidth : 0
    });
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handle = () => updateShift();
    handle();
    window.addEventListener("resize", handle);
    window.addEventListener("scroll", handle, true);
    return () => {
      window.removeEventListener("resize", handle);
      window.removeEventListener("scroll", handle, true);
    };
  }, [isOpen, updateShift]);

  return (
    <span className="relative inline-flex items-center">
      <span
        ref={triggerRef}
        className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-slate-300 text-[10px] font-semibold lowercase text-slate-500"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setIsOpen(false)}
      >
        i
      </span>
      {isOpen &&
        createPortal(
          <span
            ref={tooltipRef}
            className="pointer-events-none fixed z-[999] w-56 whitespace-normal rounded-md bg-slate-900 px-3 py-2 text-xs font-normal text-white shadow-lg"
            style={{
              left: tooltipStyles?.left ?? 0,
              top: tooltipStyles?.top ?? 0,
              maxWidth: tooltipStyles ? `${tooltipStyles.maxWidth}px` : undefined,
              opacity: tooltipStyles ? 1 : 0
            }}
          >
            {text}
          </span>,
          document.body
        )}
    </span>
  );
}
