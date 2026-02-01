import {
  Utensils,
  Car,
  ShoppingBag,
  Gamepad2,
  HeartPulse,
  GraduationCap,
  Receipt,
  Package,
  LayoutGrid,
} from "lucide-react";

export const CATEGORY_MAP = {
  all: {
    key: "all",
    name: "Tất cả",
    icon: LayoutGrid,
    color: "text-slate-400",
  },
  food: {
    key: "food",
    name: "Ăn uống",
    icon: Utensils,
    color: "text-orange-400",
  },
  travel: {
    key: "travel",
    name: "Đi lại",
    icon: Car,
    color: "text-blue-400",
  },
  shopping: {
    key: "shopping",
    name: "Mua sắm",
    icon: ShoppingBag,
    color: "text-pink-400",
  },
  entertainment: {
    key: "entertainment",
    name: "Giải trí",
    icon: Gamepad2,
    color: "text-purple-400",
  },
  health: {
    key: "health",
    name: "Sức khỏe",
    icon: HeartPulse,
    color: "text-red-400",
  },
  education: {
    key: "education",
    name: "Giáo dục",
    icon: GraduationCap,
    color: "text-emerald-400",
  },
  bills: {
    key: "bills",
    name: "Hóa đơn",
    icon: Receipt,
    color: "text-yellow-400",
  },
  other: {
    key: "other",
    name: "Khác",
    icon: Package,
    color: "text-slate-400",
  },
};

export const getCategoryMeta = (category) => {
  return CATEGORY_MAP[category] || CATEGORY_MAP.other;
};
