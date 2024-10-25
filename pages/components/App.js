import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { supabase } from '../../lib/supabase';
import styles from './App.module.css';
import PredictionGame from './PredictionGame/PredictionGame';
import GameList from './GameList/GameList';
import BetNotifications from './BetNotification/BetNotification';
import GameResults from './GameResults/GameResults';
import { Bell } from 'lucide-react';
import LastGameResults from './LastGameResults/LastGameResults';
import TwitterConnect from './TwitterConnect/TwitterConnect';
import Confetti from 'react-confetti';

function AppContent() {
  const wallet = useAnchorWallet();
  const [activeGames, setActiveGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [previousGame, setPreviousGame] = useState(null);
  const [showGameExplainer, setShowGameExplainer] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [newGameAvailable, setNewGameAvailable] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isTwitterConnected, setIsTwitterConnected] = useState(false);
  const [userCredits, setUserCredits] = useState(0);
  const [hasFreeBet, setHasFreeBet] = useState(false);
  const [showWinnerAnimation, setShowWinnerAnimation] = useState(false);

  useEffect(() => {
    fetchActiveGames();

    const gameSubscription = supabase
      .channel('game_rounds_new')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'game_rounds' },
        payload => {
          setShowWinnerAnimation(true);
          setTimeout(() => {
              setShowWinnerAnimation(false);
          }, 5000);
  
          setActiveGames(prevGames => {
            const newGames = [payload.new, ...prevGames];
            // setPreviousGame(prevGames[0]);
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

  useEffect(() => {
    if (wallet) {
      fetchUserDetails();
    }
  }, [wallet]);

  const fetchUserDetails = async () => {
    const { data, error } = await supabase
        .from('user_credits')
        .select('*')
        .eq('user_address', wallet?.publicKey?.toString())
        .single();

    if (error) console.error('Error fetching user details:', error);
    else {
      console.log('fetchUserDetails', data)
      if (data) {
        setUserDetails(data);
        setUserCredits(data.credits);
        setHasFreeBet(data.has_free_bet);
        setIsTwitterConnected(data.is_twitter_connected);
      }
    }
  };

  const handleTwitterConnect = async (email) => {
    if (!email || !wallet) return;
    const { data: userCredits, error } = await supabase.from('user_credits')
        .select('*')
        .eq('user_address', wallet.publicKey.toString())
        .single();
    let userObj = userCredits;
    console.log(userObj)
    // if user doesn't exist, insert it. id as wallet address
    if (userObj === null && email) {
        const { data, error } = await supabase.from('user_credits')
            .insert({
                user_address: wallet.publicKey.toString(), 
                credits: 0.005, 
                // is_first_bet: true, 
                has_free_bet: true,
                is_twitter_connected: true,
                email: email
            }).select().single();
        console.log(data)
        if (error) console.error('Error signing up:', error);
        else userObj = data;
    }

    console.log(userObj)
    // user credits were inserted but no credit added yet
    if (userObj && !userObj.is_twitter_connected) {
        // update user credits
      const { data, error } = await supabase
        .from('user_credits')
        .update({ is_twitter_connected: true, credits: userCredits + 0.005, email: email })
        .eq('user_address', wallet.publicKey.toString())
        .select().single();
      if (error) console.error('Error connecting Twitter:', error);
      else {
        userObj = data;
        // setIsTwitterConnected(true);
        // setUserCredits(prevCredits => prevCredits + 0.005);
      }
    }

    // when we have twitter connected, we need to update the user account on solana
    if (userObj && userObj.is_twitter_connected) {
        const program = getProgram(wallet);
        // we have email instead of twitter handle
        const userAccount = await initializeUserWithTwitter(program, wallet, userObj.email);
        console.log(userAccount);
        setUserCredits(userObj?.credits || 0);
        setIsTwitterConnected(true);
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
        {isTwitterConnected ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            Twitter Connected. Credits: {userDetails?.credits}
          </motion.div>
        ) : (
          <TwitterConnect onConnect={handleTwitterConnect} />
        )}
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
        {previousGame && <LastGameResults previousGame={previousGame} />}
        <section className={styles.gameSection}>
          <h2 className={styles.sectionTitle}>Recent Rounds</h2>
          <GameList games={activeGames} onSelectGame={setSelectedGame} />
        </section>
      </main>

      <AnimatePresence>
        {previousGame && showResults && (
          <>
          {showWinnerAnimation && <Confetti />}
          <GameResults 
            previousGame={previousGame} 
            onClose={() => setShowResults(false)} 
          />
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AppContent;
