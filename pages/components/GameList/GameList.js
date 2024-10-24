// components/GameList.js
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './GameList.module.css';
import { listActiveGames } from '../../../lib/anchor-client';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import GameHistory from '../GameHistory/GameHistory';

const GameList = ({ games, onSelectGame }) => {
//   const [games, setGames] = useState([]);
  const [currentGame, setCurrentGame] = useState(null);
  const [lastFinishedGame, setLastFinishedGame] = useState(null);
  const wallet = useAnchorWallet();
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const fetchGames = async () => {
    //   const fetchedGames = await listActiveGames(wallet);
    //   setGames(fetchedGames);
      // Sort games by end time (descending)
      const sortedGames = games.sort((a, b) => b.endTime - a.endTime);
      
      // Set current game (first game that hasn't ended)
      const current = sortedGames?.[0] ;//.find(game => game.status !== 'ended');
      setCurrentGame(current);
      
      // Set last finished game (first game that has ended)
      const lastFinished = sortedGames.find(game => game.status === 'ended');
      setLastFinishedGame(lastFinished);
    };

    fetchGames();
  }, [onSelectGame]);

  return (
    <>
    <motion.button onClick={() => setShowHistory(!showHistory)}>
    {showHistory ? 'Hide History' : 'Show History'}
      </motion.button>
      <div className={styles.gameListContainer}>
        {showHistory ? (
          <GameHistory />
      ) : (
        <div>
          <CurrentGame game={currentGame} onSelectGame={onSelectGame} />
          {/* <LastFinishedGame game={lastFinishedGame} onSelectGame={onSelectGame} />
          <HistoricalGames games={games}
            onSelectGame={onSelectGame} /> */}
          </div>
        )}
      </div>
    </>
  );
};

const CurrentGame = ({ game, onSelectGame }) => {
  if (!game) return null;

  return (
    <motion.div 
      className={styles.currentGame}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2>Current Round</h2>
      <GameCard game={game} onSelect={onSelectGame} />
    </motion.div>
  );
};

const LastFinishedGame = ({ game }) => {
  if (!game) return null;

  return (
    <motion.div 
      className={styles.lastFinishedGame}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <h2>Last Finished Round</h2>
      <WinnerAnnouncement game={game} />
    </motion.div>
  );
};

const HistoricalGames = ({ games, onSelectGame }) => {
  return (
    <motion.div 
      className={styles.historicalGames}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <AnimatePresence>
        {games?.map((game, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <GameCard game={game} onSelect={onSelectGame} />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
};

const GameCard = ({ game, onSelect }) => {
  return (
    <div className={styles.gameCard} onClick={() => onSelect(game)}>
      <h3>Round #{game.toString()}</h3>
      {/* <p>Start: {new Date(game.startTime * 1000).toLocaleString()}</p>
      <p>End: {new Date(game.endTime * 1000).toLocaleString()}</p>
      <p>Status: {game.status}</p> */}
    </div>
  );
};

const WinnerAnnouncement = ({ game }) => {
  return (
    <motion.div 
      className={styles.winnerAnnouncement}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, type: 'spring' }}
    >
      <h3>Winner Announcement!</h3>
      <p>Winning Token: {game.winningToken}</p>
      <motion.div 
        className={styles.confetti}
        animate={{ 
          y: [0, -20, 0], 
          rotate: [0, 180, 360] 
        }}
        transition={{ 
          duration: 2, 
          repeat: Infinity, 
          ease: 'easeInOut' 
        }}
      >
        🎉
      </motion.div>
    </motion.div>
  );
};

export default GameList;
