"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Plus, History, Settings } from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/log-period", label: "Log Period", Icon: Plus },
  { href: "/cycle-history", label: "History", Icon: History },
  { href: "/settings", label: "Settings", Icon: Settings },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="bg-white border-b border-gray-200 shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-rose-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-lg">PT</span>
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900">
                Period Tracker
              </div>
              <div className="text-xs text-gray-500 font-medium">
                Health Tracking
              </div>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.Icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`py-3 px-6 rounded-lg font-semibold transition duration-200 flex items-center gap-2 ${
                    isActive
                      ? "bg-rose-600 hover:bg-rose-700 text-white shadow-sm hover:shadow-md"
                      : "text-gray-700 hover:bg-gray-100 hover:text-rose-600"
                  }`}
                >
                  <Icon size={18} />
                  <span className="hidden lg:inline">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
