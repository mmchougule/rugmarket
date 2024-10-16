import React, { useState, useEffect } from 'react';
import { formatDistanceToNow, parseISO } from 'date-fns';

interface DynamicTimesatampProps {
  date: string;
  color?: string;
}

const DynamicTimestamp: React.FC<DynamicTimesatampProps> = ({ date, color = 'indigo-400' }) => {
  const [timeAgo, setTimeAgo] = useState<string>('');

  useEffect(() => {
    const updateTimeAgo = () => {
      try {
        const parsedDate = parseISO(date);
        console.log(parsedDate);
        console.log(date);
        if (isNaN(parsedDate.getTime())) {
          throw new Error('Invalid date');
        }
        setTimeAgo(formatDistanceToNow(parsedDate, { addSuffix: true }));
      } catch (error) {
        console.error('Error parsing date:', error);
        setTimeAgo('Invalid date');
      }
    };

    if (date) {
      updateTimeAgo();
    }
    const timer = setInterval(updateTimeAgo, 60000); // Update every minute

    return () => clearInterval(timer);
  }, [date]);

  return (
    <span className={`text-xs text-${color}`}>
      {timeAgo}
    </span>
  );
};

export default DynamicTimestamp;