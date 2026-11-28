import React, { useEffect, useRef } from "react";
import { clsx } from "clsx";
import { X } from "lucide-react";
import { createPortal } from "react-dom";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  className?: string;
  closeOnOverlayClick?: boolean;
}

// How many modals are open right now, so closing one never unlocks the page
// while another is still showing.
let openModals = 0;

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  className,
  closeOnOverlayClick = true,
}) => {
  // Keep the latest onClose without re-running the lock effect on every parent render
  // (parents pass inline arrow functions, which change identity each render).
  const onCloseRef = useRef(onClose);
  useEffect(() => { onCloseRef.current = onClose });

  // IMPORTANT: hooks must run on every render, so this comes BEFORE the early return.
  // With the old order (`if (!isOpen) return null` first), React skipped this hook when the
  // modal closed, the cleanup never ran, and body stayed `overflow: hidden` until a refresh.
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => { if (e.key === "Escape") onCloseRef.current(); };
    document.addEventListener("keydown", handleEscape);

    openModals += 1;
    document.body.style.overflow = "hidden";
    const focusTimer = setTimeout(() => document.querySelector<HTMLElement>("[role=dialog]")?.focus(), 30);

    return () => {
      clearTimeout(focusTimer);
      document.removeEventListener("keydown", handleEscape);
      openModals = Math.max(0, openModals - 1);
      if (openModals === 0) document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = { sm: "max-w-sm", md: "max-w-md", lg: "max-w-lg", xl: "max-w-xl", full: "max-w-4xl" };

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={closeOnOverlayClick ? onClose : undefined} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title || "Dialog"}
        tabIndex={-1}
        className={clsx("relative bg-mmrgb-surface border border-mmrgb-border rounded-2xl shadow-2xl w-full animate-scale-in max-h-[90vh] overflow-y-auto", sizes[size], className)}
      >
        {title && (
          <div className="flex items-center justify-between p-5 border-b border-mmrgb-border">
            <h2 className="text-xl font-bold text-mmrgb-text">{title}</h2>
            <button onClick={onClose} className="p-2 text-mmrgb-textMuted hover:text-mmrgb-text hover:bg-mmrgb-surfaceElevated rounded-xl transition-colors" aria-label="Close modal">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        <div className="p-5">{children}</div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
