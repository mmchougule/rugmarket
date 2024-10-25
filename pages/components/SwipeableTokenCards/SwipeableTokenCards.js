import React, { useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import styles from './SwipeableTokenCards.module.css';
import TokenCard from '../TokenCards/TokenCards';
import { X, Check, Heart, Star } from 'lucide-react';
import Confetti from 'react-confetti';

const SwipeableTokenCards = ({ tokens, onSwipe, onPlaceBet }) => {
  const [selectedToken, setSelectedToken] = useState(null);
  const controls = [useAnimation(), useAnimation()];
  const [showHearts, setShowHearts] = useState([true, false]);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const heartInterval = setInterval(() => {
      setShowHearts(prev => {
        const newState = [false, false];
        const activeIndex = prev[0] ? 1 : 0;
        newState[activeIndex] = true;
        return newState;
      });
    }, 3000); // Show hearts every 3 seconds

    return () => clearInterval(heartInterval);
  }, []);

  const handleSwipe = (token, direction, index) => {
    if (direction === 'right') {
      setShowConfetti(true);
    }
    const otherIndex = index === 0 ? 1 : 0;
    controls[index].start({
      x: direction === 'right' ? 300 : -300,
      opacity: 0,
      rotate: direction === 'right' ? 30 : -30,
      transition: { duration: 0.3 }
    });
    controls[otherIndex].start({
      scale: 1.1,
      transition: { duration: 0.3 }
    });
    setSelectedToken({ 
      token: tokens[otherIndex], 
      direction: direction === 'right' ? 'left' : 'right'
    });

    setTimeout(() => {
      setShowConfetti(false);
    }, 2000);
  };

  const handleBetConfirmation = (amount) => {
    onPlaceBet(selectedToken.token, selectedToken.direction, amount);
    resetCards();
  };

  const resetCards = () => {
    controls.forEach(control => control.start({ x: 0, opacity: 1, scale: 1, rotate: 0 }));
    setSelectedToken(null);
  };

  return (
    <div className={styles.swipeContainer}>
      <div className={`${styles.cardContainer} ${selectedToken ? styles.blurred : ''}`}>
        {tokens.map((token, index) => (
          <motion.div
            key={token.mint}
            className={styles.card}
            animate={controls[index]}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={(event, info) => {
              if (info.offset.x > 100) handleSwipe(token, 'right', index);
              else if (info.offset.x < -100) handleSwipe(token, 'left', index);
              else controls[index].start({ x: 0 });
            }}
          >
            {showConfetti && <Confetti />}
            {showHearts[index] && (
              <motion.div
                className={styles.floatingItems}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                {[...Array(Math.floor(Math.random() * 20) + 50)].map((_, i) => {
                  const isHeart = Math.random() > 0.3;
                  return isHeart ? (
                    <Heart
                      key={i}
                      size={Math.floor(Math.random() * 24) + 12}
                      className={styles.floatingItem}
                      style={{
                        left: `${Math.random() * 100}%`,
                        animationDuration: `${Math.random() * 1 + 0.5}s`,
                        animationDelay: `${Math.random() * 0.5}s`
                      }}
                    />
                  ) : (
                    <Star
                      key={i}
                      size={Math.floor(Math.random() * 24) + 12}
                      className={styles.floatingItem}
                      style={{
                        left: `${Math.random() * 100}%`,
                        animationDuration: `${Math.random() * 1 + 0.5}s`,
                        animationDelay: `${Math.random() * 0.5}s`
                      }}
                    />
                  );
                })}
              </motion.div>
            )}

            <TokenCard token={token} />
            <div className={styles.cardActions}>
              <button className={`${styles.actionButton} ${styles.dislike}`} onClick={() => handleSwipe(token, 'left', index)}>
                <X size={24} />
              </button>
              <button className={`${styles.actionButton} ${styles.like}`} onClick={() => handleSwipe(token, 'right', index)}>
                <Check size={24} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
      {selectedToken && (
        <BetConfirmationDialog
          token={selectedToken.token}
          direction={selectedToken.direction}
          onConfirm={handleBetConfirmation}
          onCancel={resetCards}
        />
      )}
    </div>
  );
};

const BetConfirmationDialog = ({ token, direction, onConfirm, onCancel }) => {
  const [betAmount, setBetAmount] = useState(0.1);

  // add loading state until the bet is confirmed
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className={styles.betDialog}>
      <h3>Confirm Your Bet</h3>
      <p>You're betting that {token.name} will {direction === 'right' ? 'win' : 'lose'}.</p>
      <input
        type="number"
        value={betAmount}
        onChange={(e) => setBetAmount(parseFloat(e.target.value))}
        step="0.1"
        min="0.1"
      />
      <div className={styles.dialogButtons}>
        <button onClick={() => {
          setIsLoading(true);
          onConfirm(betAmount);
        }}>Confirm Bet</button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
};

export default SwipeableTokenCards;
