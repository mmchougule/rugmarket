import React from 'react';
import styles from './DailyChallenge.module.css';

const DailyChallenge = () => {
  return (
    <div className={styles.dailyChallenge}>
      <h2 className={styles.title}>Daily Challenge</h2>
      <p className={styles.description}>Predict 3 rugged tokens in a row!</p>
      <div className={styles.reward}>
        <span className={styles.rewardText}>Reward:</span>
        <span className={styles.rewardAmount}>1000 RR Tokens</span>
      </div>
    </div>
  );
};

export default DailyChallenge;
