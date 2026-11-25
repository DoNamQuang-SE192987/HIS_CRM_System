"use client";

import { useEffect, type ReactNode } from "react";
import { cn } from "@/utils";
import { Icon } from "./Icon";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon: string;
  /** Colour classes for the icon tile, e.g. "bg-primary text-on-primary" */
  iconClassName?: string;
  /** Background classes for the header strip */
  headerClassName?: string;
  children: ReactNode;
}

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  iconClassName = "bg-primary text-on-primary",
  headerClassName = "bg-surface-container-low",
  children,
}: ModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="bg-surface-container-lowest rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col animate-fade-in"
        onClick={(event) => event.stopPropagation()}
      >
        <div className={cn("p-space-lg flex items-center justify-between", headerClassName)}>
          <div className="flex items-center gap-space-sm">
            <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", iconClassName)}>
              <Icon name={icon} className="text-[20px]" />
            </div>
            <div className="flex flex-col">
              <h3 className="font-headline-sm text-headline-sm text-on-surface">{title}</h3>
              {subtitle && (
                <span className="font-label-sm text-label-sm text-secondary">{subtitle}</span>
              )}
            </div>
          </div>
          <button
            className="text-secondary hover:text-on-surface p-1 rounded-lg"
            type="button"
            aria-label="Close"
            onClick={onClose}
          >
            <Icon name="close" className="text-[20px]" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
