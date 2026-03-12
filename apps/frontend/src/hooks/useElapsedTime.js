import { useState, useEffect } from 'react';

function formatElapsed(ms) {
  if (ms < 0) return '0s';
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
}

export default function useElapsedTime(startTime) {
  const [elapsed, setElapsed] = useState(() => {
    if (!startTime) return '0s';
    return formatElapsed(Date.now() - new Date(startTime).getTime());
  });

  useEffect(() => {
    if (!startTime) {
      setElapsed('0s');
      return;
    }

    const update = () => {
      const diff = Date.now() - new Date(startTime).getTime();
      setElapsed(formatElapsed(diff));
    };

    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [startTime]);

  return elapsed;
}
