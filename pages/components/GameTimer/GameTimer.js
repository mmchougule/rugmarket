import React, { useState, useEffect } from 'react';
import styles from './GameTimer.module.css';

const GameTimer = ({ endTime }) => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  function calculateTimeLeft() {
    const endTimeMs = new Date(endTime).getTime();
    const now = Date.now();
    // console.log("endTime", endTimeMs);
    // console.log("now", now);
    const difference = endTimeMs - now;
    // console.log("difference", difference);
    return Math.max(0, Math.floor(difference / 1000));
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  // console.log("timeLeft", timeLeft);

  if (timeLeft === 0) {
    return <div className={styles.gameTimer}>Game Over</div>;
  }

  return (
    <div className={styles.gameTimer}>
      Time left: {minutes}:{seconds.toString().padStart(2, '0')}
    </div>
  );
};

export default GameTimer;
