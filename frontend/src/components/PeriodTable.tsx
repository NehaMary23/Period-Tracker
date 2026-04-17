import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface Period {
  id: number;
  start_date: string;
  end_date: string;
  flow_intensity: string;
  notes?: string;
}

interface PeriodTableProps {
  periods: Period[];
}

const flowIntensityStyles = {
  light: "bg-blue-50 text-blue-900 border border-blue-300",
  moderate: "bg-red-50 text-red-900 border border-red-300",
  heavy: "bg-rose-50 text-rose-900 border border-rose-300",
};

const flowIntensityLabels = {
  light: "Light",
  moderate: "Moderate",
  heavy: "Heavy",
};

export default function PeriodTable({ periods }: PeriodTableProps) {
  if (periods.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-16 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            No periods logged yet
          </h3>
          <p className="text-gray-600 mb-6">
            Start tracking your cycle by logging your first period
          </p>
          <Link
            href="/log-period"
            className="inline-block bg-rose-600 hover:bg-rose-700 text-white font-bold py-2 px-6 rounded-lg transition duration-200 shadow-md hover:shadow-lg"
          >
            Log Your First Period
          </Link>
        </div>
      </div>
    );
  }

  const calculateDuration = (start: string, end: string): number => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return (
      Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
      ) + 1
    );
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <h3 className="text-lg font-bold text-gray-900">Recent Periods</h3>
      </div>

      <div className="overflow-hidden">
        <table className="w-full text-sm md:text-base">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Start Date
              </th>
              <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider hidden sm:table-cell">
                Duration
              </th>
              <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Flow
              </th>
              <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider hidden md:table-cell">
                Notes
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {periods.slice(0, 10).map((period) => {
              const duration = calculateDuration(
                period.start_date,
                period.end_date,
              );
              const flowKey =
                period.flow_intensity as keyof typeof flowIntensityStyles;
              const flowStyles =
                flowIntensityStyles[flowKey] || flowIntensityStyles.moderate;

              return (
                <tr
                  key={period.id}
                  className="hover:bg-gray-50 transition duration-200"
                >
                  <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap">
                    <div className="text-xs sm:text-sm font-medium text-gray-900">
                      {new Date(period.start_date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>
                  </td>
                  <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap hidden sm:table-cell">
                    <div className="text-xs sm:text-sm text-gray-700">
                      {duration} days
                    </div>
                  </td>
                  <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-2 px-2 sm:px-3 py-1 rounded-full text-xs font-bold ${flowStyles}`}
                    >
                      <span className="capitalize text-xs sm:text-sm">
                        {flowIntensityLabels[flowKey] || "Moderate"}
                      </span>
                    </span>
                  </td>
                  <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 hidden md:table-cell">
                    <div className="text-xs sm:text-sm text-gray-600 max-w-xs truncate">
                      {period.notes || "—"}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {periods.length > 10 && (
        <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
          <Link
            href="/cycle-history"
            className="text-rose-600 hover:text-rose-700 font-medium text-sm transition inline-flex items-center gap-1"
          >
            View All Periods
            <ArrowRight size={14} />
          </Link>
        </div>
      )}
    </div>
  );
}
