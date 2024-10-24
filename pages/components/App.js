import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { supabase } from '../../lib/supabase';
import styles from './App.module.css';
import PredictionGame from './PredictionGame/PredictionGame';
import GameList from './GameList/GameList';
import BetNotifications from './BetNotification/BetNotification';
import GameResults from './GameResults/GameResults';
import { Bell } from 'lucide-react';
import LastGameResults from './LastGameResults/LastGameResults';

function AppContent() {
  const { wallet } = useWallet();
  const [activeGames, setActiveGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [previousGame, setPreviousGame] = useState(null);
  const [showGameExplainer, setShowGameExplainer] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [newGameAvailable, setNewGameAvailable] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    fetchActiveGames();

    const gameSubscription = supabase
      .channel('game_rounds_new')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'game_rounds' },
        payload => {

          setActiveGames(prevGames => {
            const newGames = [payload.new, ...prevGames];
            setPreviousGame(prevGames[0]);
            return newGames.slice(0, 10);
          });
          addNotification(`New game added: ${payload.new.address.slice(0, 4)}...${payload.new.address.slice(-4)}`, payload.new.address);
          setNewGameAvailable(true);
          setShowResults(true);
          setSelectedGame(payload.new?.address)
        }
      )
      .subscribe();

    return () => {
      gameSubscription.unsubscribe();
    };
  }, []);

  const fetchActiveGames = async () => {
    const { data, error } = await supabase
      .from('game_rounds')
      .select('*')
      .order('start_time', { ascending: false })
      .limit(10);

    if (error) {
      console.error("Error fetching active games:", error);
    } else {
      setActiveGames(data);
      if (data.length > 0) {
        if (!selectedGame) {
          setSelectedGame(data[0].address);
        }
        if (data.length > 1) {
          setPreviousGame(data[1]);
        }
      }
    }
  };

  const handleGameChange = (payload) => {
    console.log('New game added:', payload);
    setActiveGames(prevGames => {
      const newGames = [payload.new, ...prevGames];
      setPreviousGame(prevGames[0]);
      return newGames.slice(0, 10);
    });
    addNotification(`New game added: ${payload.new.address.slice(0, 4)}...${payload.new.address.slice(-4)}`, payload.new.address);
    setNewGameAvailable(true);
    setShowResults(true);
  };

  const addNotification = (message, gameAddress) => {
    setNotifications(prev => [
      { id: Date.now(), message, gameAddress },
      ...prev.slice(0, 4)
    ]);
    setTimeout(() => {
      setNotifications(prev => prev.slice(1));
    }, 5000);
  };

  const handleNewGameClick = () => {
    if (activeGames.length > 0) {
      setSelectedGame(activeGames[0].address);
      setNewGameAvailable(false);
      setShowResults(true);
    }
  };

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1 className={styles.title}><a href="/">RugMarket</a></h1>
        <button
          onClick={() => setShowGameExplainer(true)}
          className={styles.walletButton}
        >
          How to Play
        </button>
        <WalletMultiButton />
        {newGameAvailable && (
          <motion.button
            className={styles.newGameButton}
            onClick={handleNewGameClick}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Bell size={20} />
            New Game Available!
          </motion.button>
        )}
      </header>
      
      <BetNotifications notifications={notifications} />

      <main className={styles.mainContent}>
        <AnimatePresence>
          {selectedGame && (
            <PredictionGame key={selectedGame} gameAddress={selectedGame} />
          )}
        </AnimatePresence>
        <LastGameResults previousGame={previousGame} />
        <section className={styles.gameSection}>
          <h2 className={styles.sectionTitle}>Recent Rounds</h2>
          <GameList games={activeGames} onSelectGame={setSelectedGame} />
        </section>
      </main>

      <AnimatePresence>
        {previousGame && showResults && (
          <GameResults 
            previousGame={previousGame} 
            onClose={() => setShowResults(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default AppContent;
