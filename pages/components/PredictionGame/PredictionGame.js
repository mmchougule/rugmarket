import React, { useState, useEffect } from 'react';
import { PublicKey } from '@solana/web3.js';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './PredictionGame.module.css';
import { DollarSign, Clock } from 'lucide-react';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { getTokenDetails } from '../../../lib/tokenUtils';
import Leaderboard from '../RoundLeaderboard/RoundLeaderboard';
import GameDetails from '../GameDetails/GameDetails';
import TokenCard from '../TokenCards/TokenCards';
import Confetti from 'react-confetti';
import BetNotifications from '../BetNotification/BetNotification';
import WheelOfFortune from '../WheelOfFortune/WheelOfFortune';
import { Copy } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import SwipeableTokenCards from '../SwipeableTokenCards/SwipeableTokenCards';
import { initializeUserWithTwitter, fetchGameRoundDetails, getProgram } from '../../../lib/anchor-client';
import SwipeTutorial from '../SwipeTutorial/SwipeTutorial';

const PredictionGame = ({ gameAddress }) => {
    const wallet = useAnchorWallet();
    const [gameDetails, setGameDetails] = useState(null);
    const [bets, setBets] = useState([]);
    const [tokenDetails, setTokenDetails] = useState([]);
    const [showWinnerAnimation, setShowWinnerAnimation] = useState(false);
    const [winners, setWinners] = useState([]);
    const [selectedToken, setSelectedToken] = useState(null);
    const [betAmount, setBetAmount] = useState('');
    const [notifications, setNotifications] = useState([]);

    const [userCredits, setUserCredits] = useState(0);
    const [hasFreeBet, setHasFreeBet] = useState(false);
    const [isTwitterConnected, setIsTwitterConnected] = useState(false);
    const [placeBetFunction, setPlaceBetFunction] = useState(null);

    useEffect(() => {
        fetchGameDetails();
        fetchUserDetails();

        const gameSubscription = supabase
            .channel('game_rounds_changes')
            .on('postgres_changes', 
                { event: '*', schema: 'public', table: 'game_rounds', filter: `address=eq.${gameAddress}` },
                (payload) => {
                    console.log('Game round changed in PredictionGame:', payload);
                    setGameDetails(prevDetails => ({...prevDetails, ...payload.new}));
                    if (payload.new.status === 'ended') {
                        calculateWinners(payload.new);
                    }
                }
            )
            .subscribe();

        const betsSubscription = supabase
            .channel('bets_changes')
            .on('postgres_changes', 
                { event: '*', schema: 'public', table: 'bets', filter: `game_address=eq.${gameAddress}` },
                (payload) => {
                    console.log('New bet:', payload);
                    setBets(currentBets => [...currentBets, payload.new]);
                    addNotification(`New bet: ${payload.new.amount} SOL on ${payload.new.token_id}`, gameAddress);
                }
            )
            .subscribe();

        return () => {
            gameSubscription.unsubscribe();
            betsSubscription.unsubscribe();
        };
    }, [gameAddress, wallet]);

    useEffect(() => {
        if (gameDetails) {
            fetchTokenDetails();
        }
    }, [gameDetails]);


    const handlePlaceBet = (token, direction, amount) => {
        if (placeBetFunction) {
            placeBetFunction(token, direction, amount);
        } else {
            console.error('placeBetFunction is not set');
        }
    };

    const fetchGameDetails = async () => {
        // first get game details from solana program
        const gameDetails = await fetchGameRoundDetails(getProgram(wallet), new PublicKey(gameAddress));
        // setGameDetails(gameDetails);

        // get game details from supabase
        const { data, error } = await supabase
            .from('game_rounds')
            .select('*')
            .eq('address', gameAddress)
            .single();
        
        const { data: allBets, betsRrror } = await supabase
            .from('bets')
            .select('*')
            .eq('game_address', gameAddress);

        if (allBets) {
            setBets(allBets)
        }
        if (error) console.error('Error fetching game details:', error);
        else {
            data.tokens = gameDetails.tokens;
            setGameDetails(data);
        }

        // get token details from solana
        // const program = getProgram(wallet);
        // const tokenDetails = await getTokenDetails(gameDetails.tokens);
        // setTokenDetails(tokenDetails);
    };

    const fetchUserDetails = async () => {
        if (!wallet) return;
        const { data, error } = await supabase
            .from('user_credits')
            .select('*')
            .eq('user_address', wallet.publicKey.toString())
            .single();
        if (error) console.error('Error fetching user details:', error);
        else {
            setUserCredits(data.credits);
            setHasFreeBet(data.has_free_bet);
            setIsTwitterConnected(data.is_twitter_connected);
        }
    };

    const fetchTokenDetails = async () => {
        const tokenIds = gameDetails.tokens.map(token => token.id.toString());
        const details = await getTokenDetails(tokenIds);
        setTokenDetails(details);
    };

    const handleSpinResult = async (spinResult) => {
        const newCredits = userCredits + spinResult;
        setUserCredits(newCredits);
        const { error } = await supabase.from('user_credits')
            .update({ credits: newCredits })
            .eq('user_address', wallet.publicKey.toString());

        if (error) {
            console.error('Error updating user credits:', error);
        }
    };

    const handleCreditChange = (newCredits) => {
        setUserCredits(newCredits);
    };

    const handleTwitterConnect = async (email) => {
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
        // do this only once
        if (userObj && userObj.is_twitter_connected) {
            const program = getProgram(wallet);
            // we have email instead of twitter handle
            const userAccount = await initializeUserWithTwitter(program, wallet, userObj.email);
            console.log(userAccount);
            setUserCredits(userObj?.credits || 0);
            setIsTwitterConnected(true);
        }

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

    const handleTokenSelect = (mintAddress) => {
        setSelectedToken(mintAddress === selectedToken ? null : mintAddress);
    };

    const calculateWinners = async (gameDetails) => {
        const winningToken = gameDetails.winning_token;
        const winningBets = bets.filter(bet => bet.token_id === winningToken);
        const totalWinningBets = winningBets.reduce((sum, bet) => sum + parseFloat(bet.amount), 0);

        const calculatedWinners = winningBets.map(bet => {
            const share = parseFloat(bet.amount) / totalWinningBets;
            let winnings = Math.floor(gameDetails.treasury * share);
            const profit = winnings - parseFloat(bet.amount);
            const houseFee = Math.floor(winnings * 0.1);
            winnings = winnings - houseFee;
            return {
                user: bet.user_address,
                amount: parseFloat(bet.amount),
                winnings,
                profit,
                roi: ((winnings / parseFloat(bet.amount)) - 1) * 100
            };
        });

        setWinners(calculatedWinners);
        setShowWinnerAnimation(true);
        setTimeout(() => {
            setShowWinnerAnimation(false);
        }, 5000);
    };
    const handleSwipe = (token, direction) => {
        // Handle the swipe action
        // This is where you'd implement the betting logic
        console.log(`Swiped ${direction} on ${token.name}`);
        // show toast notification
        addNotification(`Swiped ${direction} on ${token.name}`, gameAddress);
        // Implement your betting logic here
    };
    if (!gameDetails || !tokenDetails.length) return <div className={styles.loading}>Loading...</div>;

    const winningToken = tokenDetails.find(token => token.mint === gameDetails?.winning_token);

    return (
        <div className={styles.gameContainer}>
            <div className={styles.header}>
                <h1 className={styles.title}>Who will get rekt first?</h1>
                <div className={styles.gameInfo}>
                    <div className={styles.infoItem}>
                        <Clock className={styles.icon} />
                        <span>Round ID: {gameAddress?.slice(0, 4)}...{gameAddress?.slice(-4)}</span>
                        <Copy className={styles.icon} onClick={() => navigator.clipboard.writeText(gameAddress)} />
                    </div>
                    <div className={styles.infoItem}>
                        <Clock className={styles.icon} />
                        <span>Ends: {new Date(gameDetails.end_time).toLocaleString()}</span>
                    </div>
                    <div className={styles.infoItem}>
                        <DollarSign className={styles.icon} />
                        <span>Total Pot: {gameDetails.treasury || 0} SOL</span>
                    </div>
                </div>
                <SwipeTutorial />
            </div>

            <div className={styles.content}>
                <div className={styles.swipeableCardsContainer}>
                    <SwipeableTokenCards
                        tokens={tokenDetails}
                        onSwipe={handleSwipe}
                        onPlaceBet={handlePlaceBet}
                    />
                </div>
                
                <div className={styles.gameDetailsContainer}>
                    <GameDetails
                        gameAddress={gameAddress}
                        selectedToken={selectedToken}
                        gameDetails={gameDetails}
                        setGameDetails={setGameDetails}
                        bets={bets}
                        userCredits={userCredits}
                        setPlaceBetFunction={setPlaceBetFunction}
                    />
                </div>

                {/* <div className={styles.tokenSection}> */}
                    {/* {tokenDetails.map((token, index) => (
                        <TokenCard
                            key={index}
                            token={token}
                            isSelected={selectedToken === token.mint}
                            onSelect={handleTokenSelect}
                            isWinner={winningToken?.mint === token?.mint}
                        />
                    ))} */}
                {/* </div> */}
            
                {/* {!gameDetails.status.ended && (
                    <div className={styles.gameDetails}>
                        <GameDetails
                            gameAddress={gameAddress}
                            selectedToken={selectedToken}
                            gameDetails={gameDetails}
                            setGameDetails={setGameDetails}
                            bets={bets}
                        />
                    </div>
                )} */}
                {gameDetails.status.ended && (
                <div className={styles.resultsSection}>
                    {/* <div className={styles.winningToken}>
                        <h2>Winning Token</h2>
                        <TokenCard
                            token={winningToken}
                            isWinner={true}
                        />
                    </div> */}
                    <div className={styles.leaderboard}>
                        {/* show confetti only for 5 seconds */}
                        {showWinnerAnimation && (
                            <Confetti />
                        )}
                        {winningToken && (
                            <motion.div
                                className={styles.winnerCard}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                            >
                                <h2>Winner: {winningToken.name}</h2>
                                <img src={winningToken.image_uri} alt={winningToken.name} className={styles.winnerTokenImage} />
                                <p>Final Market Cap: ${winningToken.usd_market_cap.toFixed(2)}</p>
                            </motion.div>
                            )}
                            {winners.length > 0 && (
                            <motion.div
                                className={styles.leaderboardSection}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                >
                                <h2>Winners</h2>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Player</th>
                                            <th>Bet (SOL)</th>
                                            <th>Winnings (SOL)</th>
                                            <th>Profit (SOL)</th>
                                            <th>ROI</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {winners.map((winner, index) => (
                                            <motion.tr
                                                key={index}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.1 }}
                                            >
                                                <td>{winner.user.slice(0, 4)}...{winner.user.slice(-4)}</td>
                                                <td>{(winner.amount / 1e9).toFixed(2)}</td>
                                                <td>{(winner.winnings / 1e9).toFixed(2)}</td>
                                                <td className={winner.profit > 0 ? styles.positive : styles.negative}>
                                                    {(winner.profit / 1e9).toFixed(2)}
                                                </td>
                                                <td className={winner.roi > 0 ? styles.positive : styles.negative}>
                                                    {winner.roi.toFixed(2)}%
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            </motion.div>
                            )}

                        <motion.div 
                            className={styles.leaderboardSection}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <Leaderboard game={gameDetails} tokenDetails={tokenDetails} />
                        </motion.div>

                    </div>
                </div>
                )}
            </div>
            <div className={styles.userCredits}>Your Credits: {userCredits} SOL</div>
            {/* {!isTwitterConnected ? <TwitterConnect onConnect={handleTwitterConnect} />
                : <WheelOfFortune userCredits={userCredits} onSpin={handleSpinResult} />} */}

            {isTwitterConnected ? (
                <>
                    <WheelOfFortune userCredits={userCredits} onSpin={handleSpinResult} />
                </>
            ) : (
                <div>Connect your Twitter account to get 5 free credits!</div>
            )}

            {/* <GameAnalytics /> */}

            <BetNotifications notifications={notifications} />
        </div>
    );
};

export default PredictionGame;
