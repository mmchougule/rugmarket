import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PublicKey } from '@solana/web3.js';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { fetchGameDetails, placeBet, getProgram } from '../../lib/anchor-client';
import { getTokenDetails } from '../../utils/tokenUtils';
import GameTimer from '../GameTimer/GameTimer';
import styles from './GameDetails.module.css';
import { Clock, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import TokenCard from '../TokenCards/TokenCards';
import Leaderboard from '../Leaderboard/Leaderboard';

const lamportsToSol = (lamports) => lamports / 10 ** 9;

const GameDetails = ({ gameAddress, selectedToken, gameDetails, setGameDetails }) => {
  const wallet = useAnchorWallet();
  // const [gameDetails, setGameDetails] = useState(null);
  // const [selectedToken, setSelectedToken] = useState(null);
  const [tokenDetails, setTokenDetails] = useState([]);
  const [betAmount, setBetAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [placeBetMessage, setPlaceBetMessage] = useState('');

  useEffect(() => {
    const fetchDetails = async () => {
      if (wallet) {
        // const program = getProgram(wallet);
        // const details = await fetchGameDetails(program, new PublicKey(gameAddress));
        // setGameDetails(details);
        const tokenIds = gameDetails.tokens.map(token => token.id.toString());
        const topTokens = await getTokenDetails(tokenIds);
        setTokenDetails(topTokens);
      }
    };
    fetchDetails();
  }, [gameAddress, wallet]);

  // const handleTokenSelect = (mintAddress) => {
  //   setSelectedToken(mintAddress === selectedToken ? null : mintAddress);
  // };

  const handlePlaceBet = async () => {
    if (!wallet || !selectedToken || !betAmount) return;
    const program = getProgram(wallet);
    setIsLoading(true);
    try {
      const lamports = Math.floor(parseFloat(betAmount) * 1e9);
      const tx = await placeBet(
        program, wallet, new PublicKey(gameAddress), 
        new PublicKey(selectedToken), lamports
      );
      setPlaceBetMessage(tx);
      const updatedDetails = await fetchGameDetails(program, new PublicKey(gameAddress));
      setGameDetails(updatedDetails);
    } catch (error) {
      alert("Error placing bet: " + error.message);
      setPlaceBetMessage(`error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!gameDetails) return <div className={styles.loading}>Loading...</div>;

  return (
    <motion.div 
      className={styles.gameDetails}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
    >
      {/* <h2 className={styles.title}>Rugged Roulette: Which Token Will Get Rekt?</h2> */}
      <div className={styles.mainContent}>
        {/* <div className={styles.tokenSection}>
          {tokenDetails.map((token, index) => (
            <TokenCard
              key={index}
              token={token}
              isSelected={selectedToken === token.mintAddress}
              selectedToken={selectedToken}
              onSelect={() => handleTokenSelect(token.mintAddress)}
            />
          ))}
        </div> */}
        <div className={styles.betSection}>
          <div className={styles.gameInfo}>
            <GameTimer endTime={gameDetails.endTime.toNumber() * 1000} />
            <div className={styles.infoItem}>
              <Clock className={styles.icon} />
              <span>Admin: {gameDetails.admin.toString().slice(0, 4)}...{gameDetails.admin.toString().slice(-4)}</span>
            </div>
            <div className={styles.infoItem}>
              <DollarSign className={styles.icon} />
              <span>Treasury: {lamportsToSol(gameDetails.treasury).toFixed(2)} SOL</span>
            </div>
          </div>
          <motion.div 
            className={styles.betInputSection}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h3>Place Your Bet</h3>
            <div className={styles.quickBets}>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setBetAmount('0.1')}>0.1 SOL</motion.button>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setBetAmount('0.5')}>0.5 SOL</motion.button>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setBetAmount('1')}>1 SOL</motion.button>
            </div>
            <input
              type="number"
              value={betAmount}
              onChange={(e) => setBetAmount(e.target.value)}
              placeholder="Enter bet amount"
              className={styles.betInput}
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
              onClick={handlePlaceBet}
              disabled={!selectedToken || !betAmount || isLoading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isLoading ? 'Placing Bet...' : 'Place Bet!'}
            </motion.button>
          </motion.div>
          {/* bet success message */}
          {placeBetMessage.length > 0 && modalMessage(placeBetMessage)}
          {/* {placeBetMessage && 
            <motion.div 
              className={styles.betSuccess}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              style={{ overflowWrap: 'break-word', wordWrap: 'break-word' }}
            >
              {placeBetMessage?.includes('error') ?
                placeBetMessage : 
                `Bet placed successfully! ${betAmount} SOL on ${tokenDetails.find(t => t.mint === selectedToken)?.name} to get rugged!` + 
                `view transaction: https://solscan.io/tx/${placeBetMessage}?cluster=devnet`}
            </motion.div>
          } */}
          <motion.div 
            className={styles.leaderboardSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h3>High Rollers</h3>
            <Leaderboard game={gameDetails} tokenDetails={tokenDetails} />
          </motion.div>
        </div>
      </div>
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
        Bet placed successfully! 
      </span>
      <a href={`https://solscan.io/tx/${message}?cluster=devnet`} target="_blank" rel="noopener noreferrer">
        View Transaction
      </a>
    </motion.div>
  )
}
