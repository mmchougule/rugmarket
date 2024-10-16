import React from 'react';
import styles from './SpinButton.module.css';

const SpinButton = ({ onSpin, isSpinning, timeLeft, pot }) => {
  return (
    <div className={styles.spinContainer}>
      <button 
        className={`${styles.spinButton} ${isSpinning ? styles.spinning : ''}`}
        onClick={onSpin}
        disabled={isSpinning || timeLeft === 0}
      >
        {isSpinning ? 'SPINNING...' : 'SPIN'}
      </button>
      <div className={styles.info}>
        <p className={styles.timer}>Time left: {timeLeft}s</p>
        <p className={styles.pot}>Pot: {pot} SOL</p>
      </div>
    </div>
  );
};

export default SpinButton;