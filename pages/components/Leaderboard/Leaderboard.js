import React, { useState, useEffect } from 'react';
// import { supabase } from '../../../lib/supabaseClient';
import { supabase } from '../../../lib/supabase';
import styles from './Leaderboard.module.css';

const Leaderboard = () => {
  const [topWinners, setTopWinners] = useState([]);

  useEffect(() => {
    fetchTopWinners();
  }, []);

  const fetchTopWinners = async () => {
    const { data, error } = await supabase
      .rpc('get_top_winners')
      .limit(10);

    if (error) console.error('Error fetching top winners:', error);
    else setTopWinners(data);
  };

  return (
    <div className={styles.leaderboard}>
      <h2>Top Winners</h2>
      <table>
        <thead>
          <tr>
            <th>Rank</th>
            <th>Player</th>
            <th>Total Winnings</th>
          </tr>
        </thead>
        <tbody>
          {topWinners.map((winner, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{winner.player.slice(0, 4)}...{winner.player.slice(-4)}</td>
              <td>{winner.total_winnings.toFixed(2)} SOL</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Leaderboard;

