import React, { useState, useEffect, useRef } from "react";

interface DialogModalProps {
  visible: boolean;
  title: string;
  placeholder?: string;
  defaultValue?: string;
  confirmLabel?: string;
  onConfirm: (value: string) => void;
  onCancel: () => void;
}

export default function DialogModal({
  visible,
  title,
  placeholder,
  defaultValue = "",
  confirmLabel = "Confirm",
  onConfirm,
  onCancel,
}: DialogModalProps) {
  const [value, setValue] = useState(defaultValue);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (visible) {
      setValue(defaultValue);
      setTimeout(() => inputRef.current?.select(), 50);
    }
  }, [visible, defaultValue]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!visible) return;
      if (e.key === "Escape") onCancel();
      if (e.key === "Enter" && value.trim()) onConfirm(value.trim());
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [visible, value, onConfirm, onCancel]);

  if (!visible) return null;

  return (
    <div className="dialog-overlay" onClick={onCancel}>
      <div className="dialog-modal" onClick={(e) => e.stopPropagation()}>
        <h3 className="dialog-title">{title}</h3>
        <input
          ref={inputRef}
          className="dialog-input"
          type="text"
          value={value}
          placeholder={placeholder}
          onChange={(e) => setValue(e.target.value)}
        />
        <div className="dialog-buttons">
          <button className="dialog-btn cancel" onClick={onCancel}>
            Cancel
          </button>
          <button
            className="dialog-btn confirm"
            onClick={() => value.trim() && onConfirm(value.trim())}
            disabled={!value.trim()}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
