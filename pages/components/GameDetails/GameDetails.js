import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PublicKey } from '@solana/web3.js';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { placeBet, getProgram } from '../../../lib/anchor-client';
import { getTokenDetails } from '../../../lib/tokenUtils';
import GameTimer from '../GameTimer/GameTimer';
import styles from './GameDetails.module.css';
import { Clock, DollarSign, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import Leaderboard from '../RoundLeaderboard/RoundLeaderboard';
import { supabase } from '../../../lib/supabase';

const lamportsToSol = (lamports) => lamports / 10 ** 9;

const GameDetails = ({ gameAddress, selectedToken, gameDetails, setGameDetails, userCredits, bets, setPlaceBetFunction }) => {
  const wallet = useAnchorWallet();
  const [tokenDetails, setTokenDetails] = useState([]);
  const [betAmount, setBetAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [placeBetMessage, setPlaceBetMessage] = useState('');
  const [isBettingClosed, setIsBettingClosed] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [hasFreeBet, setHasFreeBet] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {

      if (gameDetails) {
        const tokenIds = gameDetails.tokens.map(token => token.id.toString());
        const topTokens = await getTokenDetails(tokenIds);
        // if (topTokens.length === 0) {
        setTokenDetails(topTokens);

        const endTime = new Date(gameDetails.end_time).getTime();
        setIsGameOver(Date.now() > endTime);
  
        // "2024-10-23T21:54:29.892+00:00" this is the format of the start time
        // Check if betting is closed (5 minutes after game start)
        const currentTime = Date.now() / 1000;
        const bettingCloseTime = new Date(gameDetails.start_time).getTime() / 1000 + 300; // 5 minutes after start
        setIsBettingClosed(currentTime > bettingCloseTime);

        // Check if game is over
        // setIsGameOver(currentTime > new Date(gameDetails.end_time).getTime() / 1000);
      }
    };

    fetchDetails();
    const interval = setInterval(fetchDetails, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, [gameDetails]);
  // wallet, 

  useEffect(() => {
    checkFreeBetEligibility();
  }, []);
  const handleSwipe = (token, direction) => {
    // Handle the swipe action
    // This is where you'd implement the betting logic
    // console.log(`Swiped ${direction} on ${token.name}`);
    // show toast notification
    addNotification(`Swiped ${direction} on ${token.name}`, gameAddress);
    // Implement your betting logic here
};

  const checkFreeBetEligibility = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('has_free_bet')
        .eq('user_address', wallet.publicKey.toString())
        .single();

      if (error) console.error('Error checking free bet eligibility:', error);
      else setHasFreeBet(data.has_free_bet);
    }
  };

  const handlePlaceBet = async (token, direction, amount) => {
    // console.log('in handlePlaceBet', token, direction, amount);
    if (!wallet || !token || !amount) return;

    setIsLoading(true);
    setPlaceBetMessage('');

    try {
      if (isBettingClosed) {
        return 'Betting is closed for this game';
      }

      const betAmountLamports = parseFloat(amount) * 10 ** 9;
      const program = getProgram(wallet);
      const tx = await placeBet(program, wallet, new PublicKey(gameAddress), new PublicKey(token.mint), betAmountLamports);
      setPlaceBetMessage(tx);

      if (hasFreeBet && userCredits > 0) {
        // Update the user's profile to mark the free bet as used
        const newCredits = hasFreeBet ? userCredits : userCredits - amount;
        await supabase
          .from('user_credits')
          .update({ credits: newCredits, has_free_bet: false, free_bet_used: true })
          .eq('user_address', wallet.publicKey.toString());
        setHasFreeBet(false);
      }
    } catch (error) {
      console.error('Error placing bet:', error);
      if (error.message === 'User rejected the request.') {
        setPlaceBetMessage('Transaction cancelled by user.');
      } else {
        setPlaceBetMessage(`Error: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Use useEffect to set the handlePlaceBet function
  useEffect(() => {
    console.log('Setting handlePlaceBet in GameDetails');
    setPlaceBetFunction(() => handlePlaceBet);
  }, [setPlaceBetFunction]);

  const shakeAnimation = {
    shake: {
      x: [0, -20, 20, -20, 20, -15, 15, -10, 10, -5, 5, 0],
      y: [0, 15, -15, 10, -10, 5, -5, 0],
      rotate: [0, -10, 10, -8, 8, -6, 6, -4, 4, -2, 2, 0],
      transition: { 
        duration: 0.8,
        ease: "easeInOut",
        times: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]
      }
    }
  };

  if (!gameDetails) {
    return <div>Loading...</div>;
  }

  return (
    <motion.div 
      className={styles.gameDetails}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className={styles.betInputSection}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className={styles.gameInfo}>
          <GameTimer endTime={gameDetails.end_time} />
          {/* <GameTimer endTime={new Date(gameDetails.end_time).getTime() / 1000} /> */}
          {/* <div className={styles.infoItem}>
            <Clock className={styles.icon} />
            <span>Admin: {gameDetails?.admin?.toString().slice(0, 4)}...{gameDetails?.admin?.toString().slice(-4)}</span>
          </div> */}
          {gameDetails.treasury && (
          <div className={styles.infoItem}>
              <DollarSign className={styles.icon} />
              <span>Treasury: {lamportsToSol(gameDetails.treasury).toFixed(2)} SOL</span>
            </div>
          )}
        </div>

        <h3>Place Your Bet</h3>
        {isBettingClosed && !isGameOver && (
          <div className={styles.warningMessage}>
            <AlertTriangle className={styles.icon} />
            <span>Betting is closed for this game.</span>
            {/*  New game starts in {timeLeft} seconds  */}
          </div>
        )}
        {isGameOver && (
          <motion.div 
            className={styles.gameOverMessage}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h3>Game Over!</h3>
            <p>Winnings will be distributed shortly. Please wait...</p>
          </motion.div>
        )}
        {!isGameOver && (
          <>
            <div className={styles.quickBets}>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setBetAmount('0.1')}>0.1 SOL</motion.button>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setBetAmount('0.5')} className={styles.selectedBet}>0.5 SOL</motion.button>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setBetAmount('1')}>1 SOL</motion.button>
            </div>
            <input 
              type="number" 
              value={betAmount} 
              onChange={(e) => setBetAmount(e.target.value)}
              placeholder="Enter bet amount"
              min="0.1"
              // defaultValue="0.5"
              className={styles.betInput}
              disabled={isBettingClosed}
            />
            <AnimatePresence>
              {selectedToken && betAmount && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={styles.betConfirmation}
                >
                  Betting {betAmount} SOL on {tokenDetails.find(t => t.mint === selectedToken)?.name} to get rugged!
                </motion.div>
              )}
            </AnimatePresence>
            <motion.button 
              className={styles.betButton}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handlePlaceBet(selectedToken, direction, betAmount)}
              disabled={isLoading || isBettingClosed || !selectedToken || !betAmount}
              animate={isBettingClosed ? "disabled" : "shake"}
              variants={shakeAnimation}
            >
              {isLoading ? 'Placing Bet...' : 'Place Bet'}
            </motion.button>
          </>
        )}
      </motion.div>

      {placeBetMessage && modalMessage(placeBetMessage)}

      <motion.div 
        className={styles.leaderboardSection}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h3>High Rollers</h3>
        <Leaderboard game={gameDetails} tokenDetails={tokenDetails} bets={bets} />
      </motion.div>

      {hasFreeBet && (
        <div className={styles.freeBetNotice}>
          You have a free bet available!
        </div>
      )}

      {/* <SwipeableTokenCards 
        tokens={tokenDetails} 
        onPlaceBet={handlePlaceBet}
      /> */}
    </motion.div>
  );
};

export default GameDetails;
const modalMessage = (message) => {
  return (
    <motion.div 
      className={styles.betSuccess}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay: 0.4 }}
    >
      <span className={styles.betSuccessMessage}>
        {message.includes('Error') ? 'Error placing bet:' : 'Bet placed successfully!'}
      </span>
      {!message.includes('Error') && (
        <a href={`https://explorer.solana.com/tx/${message}?cluster=devnet`} target="_blank" rel="noopener noreferrer">
          View Transaction
        </a>
      )}
      {message.includes('Error') && <span>{message}</span>}
    </motion.div>
  )
}
