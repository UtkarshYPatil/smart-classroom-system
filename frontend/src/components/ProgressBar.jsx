const ProgressBar = ({ percentage }) => {
  // Ensure percentage is between 0 and 100
  const normalizedPercentage = Math.min(Math.max(percentage, 0), 100);

  // Determine color based on percentage
  const getColor = () => {
    if (normalizedPercentage < 75) {
      return 'bg-red-500';
    } else if (normalizedPercentage < 85) {
      return 'bg-yellow-500';
    } else {
      return 'bg-green-500';
    }
  };

  const getTextColor = () => {
    if (normalizedPercentage < 75) {
      return 'text-red-700';
    } else if (normalizedPercentage < 85) {
      return 'text-yellow-700';
    } else {
      return 'text-green-700';
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">Attendance</span>
        <span className={`text-sm font-bold ${getTextColor()}`}>
          {normalizedPercentage.toFixed(1)}%
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
        <div
          className={`h-full ${getColor()} transition-all duration-500 ease-out flex items-center justify-end pr-2`}
          style={{ width: `${normalizedPercentage}%` }}
        >
          {normalizedPercentage > 10 && (
            <span className="text-xs text-white font-semibold">
              {normalizedPercentage.toFixed(0)}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
