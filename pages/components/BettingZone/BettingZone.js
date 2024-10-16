import React from 'react';
import { PublicKey } from '@solana/web3.js';
import styles from './BettingZone.module.css';

const BettingZone = ({ bettingTokens, betAmount, setBetAmount, onBet, wallet }) => {
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
  };

  const handlePlaceBet = () => {
    if (bettingTokens.length > 0 && betAmount > 0) {
      // Assuming we're betting on the first token in the betting zone
      const tokenId = bettingTokens[0].id;
      onBet(tokenId, betAmount);
    } else {
      alert("Please drag a token and enter a bet amount.");
    }
  };

  return (
    <div 
      className={styles.bettingZone}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <h2>Betting Zone</h2>
      <div className={styles.dropZone}>
        {bettingTokens?.length === 0 ? (
          <p>Drag tokens here to bet</p>
        ) : (
          bettingTokens?.map((token) => (
            <div key={token.id} className={styles.betToken}>
              {token.name}
            </div>
          ))
        )}
      </div>
      <div className={styles.betControls}>
        <input
          type="number"
          value={betAmount}
          onChange={(e) => setBetAmount(Number(e.target.value))}
          placeholder="Enter bet amount"
          className={styles.betInput}
          min="0"
          step="0.1"
        />
        <button 
          onClick={handlePlaceBet} 
          className={styles.betButton}
          disabled={!wallet || betAmount <= 0 || bettingTokens.length === 0}
        >
          Place Bet
        </button>
      </div>
      {!wallet && (
        <p className={styles.warning}>Connect your wallet to place bets!</p>
      )}
    </div>
  );
};

export default BettingZone;
