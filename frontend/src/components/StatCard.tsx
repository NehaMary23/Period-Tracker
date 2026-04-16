import React from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ComponentType<{ size: number; className: string }>;
  variant?: "default" | "highlight" | "warning";
}

export default function StatCard({
  label,
  value,
  subtitle,
  icon: Icon,
  variant = "default",
}: StatCardProps) {
  const variantStyles = {
    default: {
      bg: "bg-white",
      border: "border-gray-200",
      iconBg: "bg-gray-100",
      iconColor: "text-gray-600",
      valueColor: "text-gray-900",
    },
    highlight: {
      bg: "bg-white",
      border: "border-gray-200",
      iconBg: "bg-gray-100",
      iconColor: "text-gray-900",
      valueColor: "text-gray-900",
    },
    warning: {
      bg: "bg-white",
      border: "border-amber-200",
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      valueColor: "text-amber-600",
    },
  };

  const styles = variantStyles[variant];

  return (
    <div
      className={`${styles.bg} border ${styles.border} rounded-lg shadow-md hover:shadow-lg p-6 transition duration-200`}
    >
      {Icon && (
        <div
          className={`${styles.iconBg} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}
        >
          <Icon size={24} className={styles.iconColor} />
        </div>
      )}
      <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
        {label}
      </div>
      <div className={`text-3xl font-bold ${styles.valueColor}`}>{value}</div>
      {subtitle && <div className="text-sm text-gray-600 mt-2">{subtitle}</div>}
    </div>
  );
}
