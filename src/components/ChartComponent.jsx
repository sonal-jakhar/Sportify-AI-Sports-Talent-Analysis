/**
 * ChartComponent.jsx
 * Component for displaying sports suitability scores as a bar chart
 */

function ChartComponent({ sports }) {
  if (!sports || sports.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        No sports data available
      </div>
    );
  }

  const maxScore = 100;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
      <div className="space-y-6">
        {sports.map((sport, index) => {
          const percentage = (sport.suitabilityScore / maxScore) * 100;
          const colorClass = sport.meetsRequirements
            ? 'bg-primary-600'
            : 'bg-gray-400';

          return (
            <div key={sport.id || index} className="space-y-1">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-900">{sport.name}</span>
                  {sport.meetsRequirements && (
                    <span className="text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded-full font-semibold">
                      ✓
                    </span>
                  )}
                </div>
                <span className="text-sm font-semibold text-gray-600">
                  {sport.suitabilityScore}/100
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-5 relative">
                <div
                  className={`${colorClass} h-5 rounded-full transition-all duration-500 flex items-center`}
                  style={{ width: `${percentage}%` }}
                >
                  <span className="text-xs text-white px-2 font-bold">
                    {sport.suitabilityScore}%
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2 text-xs text-gray-600 font-medium">
                <div>
                  Agility: {Math.round(sport.scoreBreakdown.agility)}
                </div>
                <div>
                  Balance: {Math.round(sport.scoreBreakdown.balance)}
                </div>
                <div>
                  Coordination: {Math.round(sport.scoreBreakdown.coordination)}
                </div>
                <div>
                  Reaction: {Math.round(sport.scoreBreakdown.reactionTime)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ChartComponent;
