import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { listActiveGames, getProgram } from '../../lib/anchor-client';
import styles from './App.module.css';
import PredictionGame from './PredictionGame/PredictionGame';
import GameList from './GameList/GameList';
import BetNotifications from './BetNotification/BetNotification';

function AppContent() {
  const { wallet } = useWallet();
  const [activeGames, setActiveGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [currentPhase, setCurrentPhase] = useState('betting');
  const [totalPot, setTotalPot] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [showGameExplainer, setShowGameExplainer] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (wallet) {
      fetchActiveGames();
      // check for new games added
      const interval = setInterval(() => {
        fetchActiveGames();
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [wallet]);

  const addNotification = (message, gameAddress) => {
    setNotifications(prev => [
        { id: Date.now(), message, gameAddress },
        ...prev.slice(0, 4) // Keep only the last 5 notifications
    ]);
    // hide notification after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.slice(1));
    }, 5000);
  };

  const fetchActiveGames = async () => {
    if (!wallet) return;
    try {
      const program = getProgram(wallet.publicKey);
      const games = await listActiveGames(program);
      const newGame = games[games.length - 1];
      if (activeGames.length < games.length) {
        // console.log(`in if ${games[games.length - 1]}`)
        setSelectedGame(newGame);
      }

      if (selectedGame !== newGame) {
        addNotification(`New game added: ${newGame.toString().slice(0, 4)}...${newGame.toString().slice(-4)}`, newGame);
      }

      // const activeGames = games.sort((a, b) => b.timestamp - a.timestamp); // need to add date etc.
      setActiveGames(games.reverse());
      // if (games.length > 0) {
      //   setSelectedGame(games[games.length - 1]);
      // }
    } catch (error) {
      console.error("Error fetching active games:", error);
    }
  };

  const handleRoundCreated = (newRound) => {
    setGames([newRound, ...games]);
    setSelectedGame(newRound);
  };

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1 className={styles.title}><a href="/">RugMarket</a></h1>
        {/* create a button with modal popup on how to play */}
        <button
          onClick={() => setShowGameExplainer(true)}
          className={styles.walletButton}
        >
          How to Play
        </button>
        <WalletMultiButton />
      </header>
      <AnimatePresence>
        {showGameExplainer && (
          <motion.div
            className={styles.howToPlayOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
              <GameExplainer />
              <button
                className={styles.walletButton}
                onClick={() => setShowGameExplainer(false)}
              >
                Close
              </button>
          </motion.div>
        )}
      </AnimatePresence>
      <BetNotifications notifications={notifications} />

      <main className={styles.mainContent}>
        {wallet ? (
          <>
            <AnimatePresence>
              {selectedGame && (
                <>
                  <PredictionGame
                    gameAddress={selectedGame}
                  />
                </>
              )}
            </AnimatePresence>
            <section className={styles.gameSection}>
              <h2 className={styles.sectionTitle}>Recent Rounds</h2>
              <GameList games={activeGames} onSelectGame={setSelectedGame} />
              {/* <div className={styles.gameList}>
                {activeGames.map((game, index) => (
                  <motion.button
                    key={index}
                    className={styles.gameButton}
                    onClick={() => setSelectedGame(game)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Game {index + 1}
                  </motion.button>
                ))}
              </div> */}
            </section>
          </>
        ) : (
          <div className={styles.connectPrompt}>
            <p>Please connect your wallet to view active games and place bets.</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default AppContent;

// for now let's just end game using backend service

const GameExplainer = () => (
  <div className={styles.gameExplainer}>
    <h3 className={styles.explainerTitle}>How to Play</h3>
    <motion.ol
      className={styles.explainerList}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1
          }
        }
      }}
    >
      {[
        "Connect your wallet",
        "Choose a token to bet on",
        "Enter your bet amount",
        "Click \"Place Bet\"",
        "Wait for the game to end",
        "If your predicted token price goes down, you win!"
      ].map((step, index) => (
        <motion.li
          key={index}
          className={styles.explainerItem}
          variants={{
            hidden: { y: 20, opacity: 0 },
            visible: {
              y: 0,
              opacity: 1
            }
          }}
        >
          <span className={styles.stepText}>{step}</span>
        </motion.li>
      ))}
    </motion.ol>
  </div>
);