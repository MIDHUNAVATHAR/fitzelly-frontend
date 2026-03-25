import { useState, useEffect, useCallback } from "react";

interface TimerProps {
  initialMinutes: number;
  onTimeUp: () => void;
}

/**
 * A reusable timer component that displays time as m.ss
 * @param initialMinutes - The time in minutes
 * @param onTimeUp - Callback function triggered when the timer reaches zero
 */
export default function Timer({ initialMinutes, onTimeUp }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(initialMinutes * 60);

  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeUp();
      return;
    }

    const intervalId = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [timeLeft, onTimeUp]);

  // Reset the timer when initialMinutes changes (e.g., if it's passed a new value)
  useEffect(() => {
    setTimeLeft(initialMinutes * 60);
  }, [initialMinutes]);

  /**
   * Formats the time into m.ss
   */
  const formatTime = useCallback((totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}.${secs.toString().padStart(2, "0")}`;
  }, []);

  return <>{formatTime(timeLeft)}</>;
}
