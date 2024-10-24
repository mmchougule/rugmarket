import React from 'react';
import { motion } from 'framer-motion';
import styles from './RoundLeaderboard.module.css';

const LeaderboardItem = ({ rank, user, amount, token, tokenDetails }) => {
  const tokenInfo = tokenDetails.find(t => t.mint === token.toString());
  const truncatedUser = `${user.slice(0, 4)}...${user.slice(-4)}`;
  
  return (
    <>
      <td>{rank}</td>
      <td>{truncatedUser}</td>
      <td>{tokenInfo ? tokenInfo.symbol : ''}</td>
      <td>{(amount / 1e9).toFixed(2)} SOL</td>
    </>
  );
};

const Leaderboard = ({ game, tokenDetails, bets }) => {
  if (!game || !bets || bets.length === 0) {
    return <div className={styles.noData}>No bets placed yet.</div>;
  }

  // Sort bets by amount in descending order
  const sortedBets = [...bets].sort((a, b) => b.amount - a.amount);

  return (
    <div className={styles.leaderboardContainer}>
      <h2 className={styles.leaderboardTitle}>High Rollers</h2>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <table className={styles.leaderboardTable}>
          <thead>
            {/* <tr> */}
              <th></th>
              <th>User</th>
              <th>Token</th>
              <th>Amount</th>
            {/* </tr> */}
          </thead>
          <tbody>
            {sortedBets.map((bet, index) => (
              <motion.tr
                key={bet.user_address.toString()}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <LeaderboardItem 
                  key={index + bet.user_address.toString()}
                  rank={index + 1} 
                  user={bet.user_address.toString()} 
                  amount={bet.amount} 
                  token={bet.token_id} 
                  tokenDetails={tokenDetails} 
                />
              </motion.tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
};

export default Leaderboard;
