import {
  Briefcase,
  Car,
  FileText,
  Gamepad2,
  HeartPulse,
  type LucideIcon,
  Package,
  ShoppingBag,
  Utensils,
} from "lucide-react";

export interface CategoryConfig {
  id: string;
  label: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
}

export const CATEGORIES: CategoryConfig[] = [
  {
    id: "Food",
    label: "Food",
    icon: Utensils,
    color: "#f97316",
    bgColor: "rgba(249,115,22,0.18)",
  },
  {
    id: "Transport",
    label: "Transport",
    icon: Car,
    color: "#60a5fa",
    bgColor: "rgba(96,165,250,0.18)",
  },
  {
    id: "Shopping",
    label: "Shopping",
    icon: ShoppingBag,
    color: "#c084fc",
    bgColor: "rgba(192,132,252,0.18)",
  },
  {
    id: "Health",
    label: "Health",
    icon: HeartPulse,
    color: "#f87171",
    bgColor: "rgba(248,113,113,0.18)",
  },
  {
    id: "Entertainment",
    label: "Entertainment",
    icon: Gamepad2,
    color: "#f472b6",
    bgColor: "rgba(244,114,182,0.18)",
  },
  {
    id: "Salary",
    label: "Salary",
    icon: Briefcase,
    color: "#4ade80",
    bgColor: "rgba(74,222,128,0.18)",
  },
  {
    id: "Bills",
    label: "Bills",
    icon: FileText,
    color: "#facc15",
    bgColor: "rgba(250,204,21,0.18)",
  },
  {
    id: "Other",
    label: "Other",
    icon: Package,
    color: "#94a3b8",
    bgColor: "rgba(148,163,184,0.18)",
  },
];

export function getCategoryConfig(id: string): CategoryConfig {
  return (
    CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[CATEGORIES.length - 1]
  );
}

export function formatAmount(amount: bigint): string {
  const num = Number(amount) / 100;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(num);
}

export function dateFromBigInt(time: bigint): Date {
  return new Date(Number(time / 1_000_000n));
}

export function dateToBigInt(date: Date): bigint {
  return BigInt(date.getTime()) * 1_000_000n;
}

export function formatDate(time: bigint): string {
  const d = dateFromBigInt(time);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
