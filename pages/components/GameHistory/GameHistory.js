import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './GameHistory.module.css';
import { supabase } from '../../../lib/supabase';

const GameHistory = () => {
  const [historicalGames, setHistoricalGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);

  useEffect(() => {
    fetchHistoricalGames();
  }, []);

  const fetchHistoricalGames = async () => {
    const { data, error } = await supabase
      .from('game_rounds')
      .select('*')
      .order('end_time', { ascending: false })
      .limit(10);

    if (error) console.error('Error fetching historical games:', error);
    else setHistoricalGames(data);
  };
  return (
    <div className={styles.historyContainer}>
      <h2>Game History</h2>
      <div className={styles.gameList}>
        {historicalGames.map((game) => (
          <motion.div
            key={game.id}
            className={styles.gameItem}
            onClick={() => setSelectedGame(game)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>Game {game.id}</span>
            <span>Ended: {new Date(game.end_time).toLocaleString()}</span>
          </motion.div>
        ))}
      </div>
      <AnimatePresence>
        {selectedGame && (
          <motion.div
            className={styles.gameDetails}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <h3>Game Details</h3>
            <p>Winner: {selectedGame.winning_token}</p>
            {/* <p>Total Pot: {selectedGame.total_pot} SOL</p>
            <p>Number of Bets: {selectedGame.bet_count}</p> */}
            <button onClick={() => setSelectedGame(null)}>Close</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GameHistory;

