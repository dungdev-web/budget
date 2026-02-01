import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { CATEGORY_MAP, getCategoryMeta } from "../utils/category";

export default function CategorySelect({
  value,
  onChange,
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const { name, icon: Icon } = getCategoryMeta(value);

  return (
    <div className={`relative ${className}`}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2 rounded-xl
                   bg-slate-900/50 border border-slate-600 text-white text-sm
                   hover:border-purple-400 transition-all"
      >
        <Icon size={16} />
        <span>{name}</span>
        <ChevronDown size={14} className="ml-1 opacity-70" />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 z-20 mt-2 min-w-[180px]
                        rounded-xl bg-slate-900 border border-slate-700 shadow-xl">
          {Object.entries(CATEGORY_MAP).map(([key, meta]) => {
            const Icon = meta.icon;
            return (
              <button
                key={key}
                type="button"
                onClick={() => {
                  onChange(key);
                  setOpen(false);
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-white
                           hover:bg-slate-800 text-left"
              >
                <Icon size={16} />
                <span>{meta.name}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
