import React, { useState, useEffect } from 'react';
import { PublicKey } from '@solana/web3.js';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './PredictionGame.module.css';
import { fetchGameDetails, getProgram } from '../../../lib/anchor-client';
import { DollarSign, Clock } from 'lucide-react';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { getTokenDetails } from '../../../lib/tokenUtils';
import Leaderboard from '../Leaderboard/Leaderboard';
import GameDetails from '../GameDetails/GameDetails';
import TokenCard from '../TokenCards/TokenCards';
import Confetti from 'react-confetti';
import BetNotifications from '../BetNotification/BetNotification';
// import BonusWheel from '../BonusWheel';

const PredictionGame = ({ gameAddress }) => {
    const wallet = useAnchorWallet();
    const [gameDetails, setGameDetails] = useState(null);
    const [tokenDetails, setTokenDetails] = useState([]);
    const [showWinnerAnimation, setShowWinnerAnimation] = useState(false);
    const [winners, setWinners] = useState([]);
    const [selectedToken, setSelectedToken] = useState(null);
    const [betAmount, setBetAmount] = useState('');
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        const fetchDetails = async (isPolling) => {
            const program = getProgram(wallet);
            const details = await fetchGameDetails(program, new PublicKey(gameAddress));
            setGameDetails(details);

            // token info doesn't change except for the market cap, we can update it later
            if (!isPolling) {
                const tokenIds = details.tokens.map(token => token.id.toString());
                const topTokens = await getTokenDetails(tokenIds);
                setTokenDetails(topTokens);
                if (details.status.ended && gameDetails?.winningToken !== null) {
                    calculateWinners(details);
                }
            }
            // Check for new bets
            if (isPolling && gameDetails) {
                const newBets = details.bets.filter(bet => 
                    !gameDetails.bets.some(oldBet => 
                        oldBet.user.toString() === bet.user.toString() && 
                        oldBet.amount.eq(bet.amount) && 
                        oldBet.token.toString() === bet.token.toString()
                    )
                );
                if (newBets.length > 0) {
                    console.log(newBets);
                    newBets.forEach(bet => {
                    const token = tokenDetails.find(t => t.mint === bet.token.toString());
                    addNotification(
                        `Placed bet: ${(bet.amount.toNumber() / 1e9).toFixed(2)} SOL on ${token ? token.name : 'Token'}`,
                        gameAddress
                    );
                    });
                }
            }
        };
        
        fetchDetails(false);
        const interval = setInterval(() => {
            fetchDetails(true);
        }, 5000);
        return () => clearInterval(interval);
    }, [gameAddress, wallet]);

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

    const handleTokenSelect = (mintAddress) => {
        setSelectedToken(mintAddress === selectedToken ? null : mintAddress);
    };

    const calculateWinners = (gameDetails) => {
        const winningToken = gameDetails.winningToken?.toString();
        //  || gameDetails.tokens[0].id.toString();
        const totalPot = gameDetails.treasury.toNumber();
        const winningBets = gameDetails.bets.filter(bet => bet.token.toString() === winningToken);
        const totalWinningBets = winningBets.reduce((sum, bet) => sum + bet.amount.toNumber(), 0);
        console.log(totalWinningBets);
        const calculatedWinners = winningBets.map(bet => {
            const share = bet.amount.toNumber() / totalWinningBets;
            let winnings = Math.floor(totalPot * share);
            const profit = winnings - bet.amount.toNumber();
            // we take 10% fee for the house
            const houseFee = Math.floor(winnings * 0.1);
            winnings = winnings - houseFee;
            return {
                user: bet.user.toString(),
                amount: bet.amount.toNumber(),
                winnings,
                profit,
                roi: ((winnings / bet.amount.toNumber()) - 1) * 100
            };
        });

        // just show vibrating animation on each bet
        setWinners(calculatedWinners);
        // setShowWinnerAnimation(true);
        // setTimeout(() => {
        //     setShowWinnerAnimation(false);
        // }, 5000);
    };
    const handleBetAmountChange = (e) => {
        setBetAmount(e.target.value);
    };
    if (!gameDetails || !tokenDetails) return <div className={styles.loading}>Loading...</div>;

    const winningToken = tokenDetails.find(token => token.mint === gameDetails?.winningToken?.toString());

    return (
        <div className={styles.gameContainer}>
            <AnimatePresence>
                {showWinnerAnimation && false && (
                    <motion.div
                        className={styles.winnerOverlay}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <Confetti />
                        <motion.div
                            className={styles.winnerCard}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                        >
                            <h2>Winner: {winningToken.name}</h2>
                            <img src={winningToken.image_uri} alt={winningToken.name} className={styles.winnerTokenImage} />
                            <p>Final Market Cap: ${winningToken.usd_market_cap.toFixed(2)}</p>
                            <motion.button onClick={() => setShowWinnerAnimation(false)}>Close</motion.button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className={styles.header}>
                <h1 className={styles.title}>who will get rekt first?</h1>
                <span>Total bets: {gameDetails.bets.length}</span>
                <div className={styles.gameInfo}>
                    <div className={styles.infoItem}>
                        <Clock className={styles.icon} />
                        <span>Round ID: {gameAddress?.toString().slice(0, 4)}...{gameAddress?.toString().slice(-4)}</span>
                    </div>
                    <div className={styles.infoItem}>
                        <Clock className={styles.icon} />
                        <span>Ends: {new Date(gameDetails.endTime.toNumber() * 1000).toLocaleString()}</span>
                    </div>
                    <div className={styles.infoItem}>
                        <DollarSign className={styles.icon} />
                        <span>Total Pot: {gameDetails.treasury.toNumber() / 1e9} SOL</span>
                    </div>
                </div>
            </div>
            
            <div className={styles.content}>
                <div className={styles.tokenSection}>
                    {tokenDetails.map((token, index) => (
                        <TokenCard
                            key={index}
                            token={token}
                            isSelected={selectedToken === token.mint}
                            onSelect={handleTokenSelect}
                            isWinner={winningToken?.mint === token?.mint}
                        />
                    ))}
                </div>
                {!gameDetails.status.ended && (
                    <div className={styles.gameDetails}>
                        <GameDetails
                            gameAddress={gameAddress}
                            selectedToken={selectedToken}
                            gameDetails={gameDetails}
                            setGameDetails={setGameDetails}
                        />
                    </div>
                )}
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
            <BetNotifications notifications={notifications} />
        </div>
    );
};

export default PredictionGame;
