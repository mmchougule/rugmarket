import React, { useState, useEffect } from 'react';
// import { supabase } from '../../../lib/supabaseClient';
import { supabase } from '../../../lib/supabase';
import styles from './GameAnalytics.module.css';

const GameAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    const { data, error } = await supabase
      .from('game_analytics')
      .select('*')
      .single();
    if (error) {
      console.error('Error fetching analytics:', error);
      setAnalytics(null);
    } else {
      setAnalytics(data);
    }
  };

  if (!analytics) return null;

  return (
    <div className={styles.gameAnalytics}>
      <h2>Game Analytics</h2>
      <div className={styles.statsGrid}>
        <div className={styles.statItem}>
          <h3>Total Games</h3>
          <p>{analytics.total_games}</p>
        </div>
        <div className={styles.statItem}>
          <h3>Total Volume</h3>
          <p>{analytics.total_volume.toFixed(2)} SOL</p>
        </div>
        <div className={styles.statItem}>
          <h3>Unique Players</h3>
          <p>{analytics.unique_players}</p>
        </div>
        <div className={styles.statItem}>
          <h3>Average Pot Size</h3>
          <p>{analytics.avg_pot_size.toFixed(2)} SOL</p>
        </div>
      </div>
      <div className={styles.leaderboard}>
        <h3>Top Winners</h3>
        <table>
          <thead>
            <tr>
              <th>Player</th>
              <th>Total Winnings</th>
            </tr>
          </thead>
          <tbody>
            {analytics.top_winners.map((winner, index) => (
              <tr key={index}>
                <td>{winner.player.slice(0, 4)}...{winner.player.slice(-4)}</td>
                <td>{winner.total_winnings.toFixed(2)} SOL</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className={styles.stats}>
        <div>Total Games: {analytics.total_games}</div>
        <div>Total Volume: {analytics.total_volume.toFixed(2)} SOL</div>
        <div>Unique Players: {analytics.unique_players}</div>
        <div>Average Pot Size: {analytics.avg_pot_size.toFixed(2)} SOL</div>
      </div>
    </div>
  );
};

export default GameAnalytics;
