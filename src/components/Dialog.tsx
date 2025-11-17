import { X } from "lucide-react";
import React from "react";

interface props {
  title?: string;
  children: React.ReactNode;
  onClose: () => void;
}
export default function Dialog({ title, children, onClose }: props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-lg p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="p-2 rounded hover:bg-slate-100">
            <X />
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}
