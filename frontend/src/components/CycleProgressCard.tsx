interface CycleProgressCardProps {
  currentDay: number | null | undefined;
  cycleLength: number;
  nextPeriodDate: string | null | undefined;
}

export default function CycleProgressCard({
  currentDay,
  cycleLength,
  nextPeriodDate,
}: CycleProgressCardProps) {
  if (!currentDay) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-3">Cycle Progress</h3>
        <p className="text-gray-600">
          Log your first period to track your cycle progress
        </p>
      </div>
    );
  }

  const progress = (currentDay / cycleLength) * 100;
  const isLate = currentDay > cycleLength;
  const daysUntilNext = isLate
    ? currentDay - cycleLength
    : cycleLength - currentDay;

  const getPhase = (day: number, length: number) => {
    const percent = (day / length) * 100;
    if (percent <= 5)
      return { name: "Menstrual", color: "text-red-600", bg: "bg-red-50" };
    if (percent <= 35)
      return { name: "Follicular", color: "text-green-600", bg: "bg-green-50" };
    if (percent <= 45)
      return {
        name: "Ovulation",
        color: "text-orange-600",
        bg: "bg-orange-50",
      };
    return { name: "Luteal", color: "text-blue-600", bg: "bg-blue-50" };
  };

  const phase = getPhase(currentDay, cycleLength);

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Cycle Progress</h3>

      {/* Period Late Alert */}
      {isLate && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="text-red-600 font-bold text-lg">⚠</div>
            <div>
              <div className="font-bold text-red-900 mb-1">Period is Late</div>
              <div className="text-sm text-red-800">
                Your period is{" "}
                <span className="font-bold">
                  {daysUntilNext} day{daysUntilNext !== 1 ? "s" : ""}
                </span>{" "}
                overdue. Consider logging a new period or consulting a
                healthcare provider if concerned.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-end mb-3">
          <div>
            <div
              className={`text-5xl font-bold ${isLate ? "text-red-600" : "text-rose-600"}`}
            >
              {currentDay}
            </div>
            <div className="text-sm text-gray-600 font-medium mt-1">
              {isLate ? (
                <span>
                  Day{" "}
                  <span className="font-bold text-red-600">{currentDay}</span> (
                  {daysUntilNext} days late)
                </span>
              ) : (
                <span>
                  Day {currentDay} of {cycleLength}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${isLate ? "bg-red-600" : "bg-rose-600"}`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div
          className={`${isLate ? "bg-red-50 border-red-200" : "bg-gray-50 border-gray-200"} rounded-lg p-4 border`}
        >
          <div
            className={`text-xs font-bold uppercase tracking-wider mb-2 ${isLate ? "text-red-700" : "text-gray-700"}`}
          >
            {isLate ? "Days Overdue" : "Days Until Next"}
          </div>
          <div
            className={`text-3xl font-bold ${isLate ? "text-red-600" : "text-gray-900"}`}
          >
            {daysUntilNext}
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
            Progress
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {isLate ? "100%+" : Math.round(progress) + "%"}
          </div>
        </div>
      </div>

      {nextPeriodDate && (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="text-sm">
            <span className="font-bold text-gray-900">
              Next period expected:
            </span>{" "}
            <span className="font-bold text-rose-600">
              {new Date(nextPeriodDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                weekday: "short",
              })}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
