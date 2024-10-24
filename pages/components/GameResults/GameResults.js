import React from 'react';
import { motion } from 'framer-motion';
import styles from './GameResults.module.css';
import { Trophy, DollarSign, Users, Clock } from 'lucide-react';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import Confetti from 'react-confetti';
import { fetchGameRoundDetails, getProgram } from '../../../lib/anchor-client';
import { useEffect, useState } from 'react';

const GameResults = ({ previousGame, onClose }) => {
    if (!previousGame) return null;
    const wallet = useAnchorWallet();
    const [previousGameDetails, setPreviousGameDetails] = useState(null);
    const [winningBets, setWinningBets] = useState([]);
    const [winningToken, setWinningToken] = useState('');
    const [totalPot, setTotalPot] = useState(0);
    const [totalPlayers, setTotalPlayers] = useState(0);
    const [winnings, setWinnings] = useState(0);

  useEffect(() => {
    const fetchGameDetails = async () => {
      const gameDetails = await fetchGameRoundDetails(getProgram(wallet), new PublicKey(previousGame.address));
      if (!gameDetails) return;
      setPreviousGameDetails(gameDetails);
      console.log(previousGameDetails)
      const winningBets = previousGameDetails?.bets?.filter(bet => bet.token.toString() === previousGame.winning_token?.toString());
      setWinningBets(winningBets);
    //   console.log(winningBets)
      const totalPot = parseInt(previousGameDetails?.treasury) / 1e9; // Convert from lamports to SOL
      const totalPlayers = previousGameDetails?.bets?.length;
    //   console.log(previousGameDetails);console.log(previousGameDetails?.winningToken)
      setWinningToken(previousGame.winning_token);
      if (totalPot > 0) {
        setTotalPot(totalPot);
      }
      if (totalPlayers > 0) {
        setTotalPlayers(totalPlayers);
      }
      if (winningBets.length > 0) {
        setWinnings(calculateWinnings(winningBets[0]));
      }
    }
    fetchGameDetails();
  }, [previousGame])

  const calculateWinnings = (bet) => {
    const totalWinningBets = winningBets.reduce((sum, b) => sum + parseInt(b.amount), 0);
    if (totalWinningBets === 0) return 0;
    const share = parseInt(bet.amount) / totalWinningBets;
    const winnings = totalPot * share;
    return (winnings * (100 - previousGameDetails.feePercentage) / 100).toFixed(2);
  };

  return (
    <motion.div 
      className={styles.resultsOverlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className={styles.resultsCard}
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <Confetti />
        <h2 className={styles.title}>🎉 Game Results 🎉</h2>
        <div className={styles.winnerSection}>
          <Trophy size={24} className={styles.icon} />
          <h3>Winning Token</h3>
          <p>{winningToken?.slice(0, 4)}...{winningToken?.slice(-4)}</p>
        </div>
        <div className={styles.statsSection}>
          <div className={styles.statItem}>
            <DollarSign size={20} className={styles.icon} />
            <p>Total Pot: {totalPot?.toFixed(2)} SOL</p>
          </div>
          <div className={styles.statItem}>
            <Users size={20} className={styles.icon} />
            <p>Total Players: {totalPlayers}</p>
          </div>
          <div className={styles.statItem}>
            {/* <Clock size={20} className={styles.icon} /> */}
            {/* <p>Game ID: {previousGame.id}</p> */}
          </div>
        </div>
        {winningBets && (
            <div className={styles.winnersList}>
            <h3>Winners</h3>
            {winningBets?.map((bet, index) => (
                <div key={index} className={styles.winnerItem}>
                <p>{bet?.user?.toString().slice(0, 4)}...{bet?.user?.toString().slice(-4)}</p>
                <p>{calculateWinnings(bet)} SOL</p>
                </div>
            ))}
            </div>
        )}
        <button className={styles.closeButton} onClick={onClose}>Close</button>
      </motion.div>
    </motion.div>
  );
};

export default GameResults;
