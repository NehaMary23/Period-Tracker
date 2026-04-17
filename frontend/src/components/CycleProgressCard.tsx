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
      <div className="bg-white border border-gray-200 rounded-lg shadow-md p-4 sm:p-6">
        <h3
          className="font-bold text-gray-900 mb-3"
          style={{ fontSize: "clamp(1.1rem, 3vw, 1.5rem)" }}
        >
          Cycle Progress
        </h3>
        <p
          className="text-gray-600"
          style={{ fontSize: "clamp(0.875rem, 2vw, 1rem)" }}
        >
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
    <div className="bg-white border border-gray-200 rounded-lg shadow-md p-4 sm:p-6">
      <h3
        className="font-bold text-gray-900 mb-6"
        style={{ fontSize: "clamp(1.1rem, 3vw, 1.5rem)" }}
      >
        Cycle Progress
      </h3>

      {/* Period Late Alert */}
      {isLate && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
          <div className="flex items-start gap-3">
            <div className="text-red-600 font-bold text-lg flex-shrink-0">
              ⚠
            </div>
            <div className="min-w-0">
              <div
                className="font-bold text-red-900 mb-1"
                style={{ fontSize: "clamp(0.875rem, 1.5vw, 1rem)" }}
              >
                Period is Late
              </div>
              <div
                className="text-red-800"
                style={{ fontSize: "clamp(0.75rem, 1.3vw, 0.875rem)" }}
              >
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
              className={`font-bold ${isLate ? "text-red-600" : "text-rose-600"}`}
              style={{ fontSize: "clamp(2.5rem, 8vw, 3.5rem)" }}
            >
              {(() => {
                const percent = (currentDay / cycleLength) * 100;
                let phaseStartDay;

                if (percent <= 5) {
                  phaseStartDay = 1;
                } else if (percent <= 35) {
                  phaseStartDay = Math.ceil(cycleLength * 0.05) + 1;
                } else if (percent <= 45) {
                  phaseStartDay = Math.ceil(cycleLength * 0.35) + 1;
                } else {
                  phaseStartDay = Math.ceil(cycleLength * 0.45) + 1;
                }

                const dayInPhase = currentDay - phaseStartDay + 1;
                return dayInPhase;
              })()}
            </div>
            <div
              className="text-gray-600 font-medium mt-1"
              style={{ fontSize: "clamp(0.75rem, 1.3vw, 0.875rem)" }}
            >
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
        <div className="w-full bg-gray-200 rounded-full h-3 sm:h-4 overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${isLate ? "bg-red-600" : "bg-rose-600"}`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>

        {/* Phase-based day display */}
        <div className="mt-4">
          <div
            className="text-gray-700 font-medium"
            style={{ fontSize: "clamp(0.875rem, 1.5vw, 1rem)" }}
          >
            {(() => {
              const percent = (currentDay / cycleLength) * 100;
              let phaseStartDay, phaseEndDay;

              if (percent <= 5) {
                phaseStartDay = 1;
                phaseEndDay = Math.ceil(cycleLength * 0.05);
              } else if (percent <= 35) {
                phaseStartDay = Math.ceil(cycleLength * 0.05) + 1;
                phaseEndDay = Math.ceil(cycleLength * 0.35);
              } else if (percent <= 45) {
                phaseStartDay = Math.ceil(cycleLength * 0.35) + 1;
                phaseEndDay = Math.ceil(cycleLength * 0.45);
              } else {
                phaseStartDay = Math.ceil(cycleLength * 0.45) + 1;
                phaseEndDay = cycleLength;
              }

              const dayInPhase = currentDay - phaseStartDay + 1;
              const totalDaysInPhase = phaseEndDay - phaseStartDay + 1;

              return `Day ${dayInPhase} of ${totalDaysInPhase}`;
            })()}
          </div>
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
