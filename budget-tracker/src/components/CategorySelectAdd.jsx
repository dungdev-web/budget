// components/CategorySelectAdd.jsx
import { CATEGORY_MAP } from "../utils/category";

export default function CategorySelectAdd({ value, onChange }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-600 text-white
                 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20"
    >
      {Object.entries(CATEGORY_MAP)
        .filter(([key]) => key !== "all") // ✅ CHỖ QUAN TRỌNG
        .map(([key, { name }]) => (
          <option key={key} value={key}>
            {name}
          </option>
        ))}
    </select>
  );
}
