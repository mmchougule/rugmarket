import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export const TokenRace = ({ tokens }) => {
  const [racePositions, setRacePositions] = useState(tokens.map((t, i) => ({ ...t, position: i })));

  useEffect(() => {
    const interval = setInterval(() => {
      setRacePositions(prevPositions => {
        const newPositions = [...prevPositions];
        const i = Math.floor(Math.random() * newPositions.length);
        const j = Math.floor(Math.random() * newPositions.length);
        [newPositions[i].position, newPositions[j].position] = [newPositions[j].position, newPositions[i].position];
        return newPositions.sort((a, b) => a.position - b.position);
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-96 bg-gray-800 rounded-xl overflow-hidden">
      {racePositions.map((token, index) => (
        <motion.div
          key={token.id}
          className="absolute left-0 h-16 w-full flex items-center p-2 bg-gradient-to-r from-purple-600 to-indigo-600"
          initial={{ top: `${index * 20}%` }}
          animate={{ top: `${token.position * 20}%` }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <img src={`/token-icons/${token?.name.toLowerCase()}.png`} alt={token.name} className="w-12 h-12 rounded-full mr-4" />
          <span className="font-bold text-lg">{token.name || token.mintAddress.slice(0, 4) + '...' + token.mintAddress.slice(-4)}</span>
          <span className="ml-auto font-bold text-lg text-green-400">+{(Math.random() * 20).toFixed(2)}%</span>
          {/* <h4 className={styles.tokenName}>{token.name || token.mintAddress.slice(0, 4) + '...' + token.mintAddress.slice(-4)}</h4> */}
          <p className={styles.tokenSymbol}>{token.symbol || 'N/A'}</p>
          <p className={styles.tokenPrice}>${token.price ? token.price.toFixed(9) : 'N/A'}</p>
          <p className={styles.tokenChange} style={{ color: token.change24h >= 0 ? '#4caf50' : '#ff4d4d' }}>
            {Math.random() < 0.5 ? <TrendingUp /> : <TrendingDown />}
            {Math.random() < 0.5 ? 'N/A' : (Math.random() < 0.5 ? '+' : '-') + (Math.random() * 10).toFixed(2) + '%'}
          </p>

        </motion.div>
      ))}
    </div>
  );
};
