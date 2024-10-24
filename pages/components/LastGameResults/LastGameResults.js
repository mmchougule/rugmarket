import React from 'react';
import { motion } from 'framer-motion';
import styles from './LastGameResults.module.css';
import { Trophy, DollarSign, Users, Clock } from 'lucide-react';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { useState, useEffect } from 'react';
import { PublicKey } from '@solana/web3.js';
import { fetchGameRoundDetails, getProgram } from '../../../lib/anchor-client';

const LastGameResults = ({ previousGame }) => {
  if (!previousGame) return null;
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
    const winningBets = gameDetails.bets.filter(bet => bet.token.toString() === previousGame.winning_token?.toString());
    setWinningBets(winningBets);
    const totalPot = parseInt(gameDetails.treasury) / 1e9; // Convert from lamports to SOL
    const totalPlayers = gameDetails.bets.length;
    setWinningToken(gameDetails.winningToken?.toString());
    setTotalPot(totalPot);
    setTotalPlayers(totalPlayers);
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
      className={styles.lastGameResults}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h3 className={styles.title}>Last Game Results</h3>
      <div className={styles.content}>
        <div className={styles.winnerSection}>
          <Trophy size={18} className={styles.icon} />
          <p>Winner: {winningToken?.slice(0, 4)}...{winningToken?.slice(-4)}</p>
        </div>
        <div className={styles.statsSection}>
          <div className={styles.statItem}>
            <DollarSign size={18} className={styles.icon} />
            <p>Pot: {totalPot.toFixed(2)} SOL</p>
          </div>
          <div className={styles.statItem}>
            <Users size={18} className={styles.icon} />
            <p>Players: {totalPlayers}</p>
          </div>
        </div>
        <div className={styles.winnersList}>
          {winningBets.length > 0 ? (
            winningBets.slice(0, 3).map((bet, index) => (
              <div key={index} className={styles.winnerItem}>
                <p>{bet.user?.toString().slice(0, 4)}...{bet.user?.toString().slice(-4)}</p>
                <p>{calculateWinnings(bet)} SOL</p>
              </div>
            ))
          ) : (
            <p>No winning bets</p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default LastGameResults;

