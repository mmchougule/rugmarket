// components/CreateRound.js
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { createGameSession } from '../../lib/anchor-client';
import styles from './CreateRound.module.css';

const CreateRound = ({ onRoundCreated }) => {
  const [duration, setDuration] = useState(10);
  const [tokenIds, setTokenIds] = useState(['', '']);
  const [isCreating, setIsCreating] = useState(false);
  const wallet = useAnchorWallet();

  const handleCreateRound = async (e) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const result = await createGameSession(wallet, duration * 60, tokenIds);
      onRoundCreated(result);
    } catch (error) {
      console.error("Error creating round:", error);
    }
    setIsCreating(false);
  };

  return (
    <motion.div
      className={styles.createRoundContainer}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2>Create New Round</h2>
      <form onSubmit={handleCreateRound}>
        <div className={styles.inputGroup}>
          <label htmlFor="duration">Duration (minutes)</label>
          <input
            type="number"
            id="duration"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            min="1"
            max="60"
          />
        </div>
        {tokenIds.map((tokenId, index) => (
          <div key={index} className={styles.inputGroup}>
            <label htmlFor={`tokenId${index}`}>Token {index + 1} ID</label>
            <input
              type="text"
              id={`tokenId${index}`}
              value={tokenId}
              onChange={(e) => {
                const newTokenIds = [...tokenIds];
                newTokenIds[index] = e.target.value;
                setTokenIds(newTokenIds);
              }}
              placeholder="Enter token public key"
            />
          </div>
        ))}
        <motion.button
          type="submit"
          disabled={isCreating}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isCreating ? 'Creating...' : 'Create Round'}
        </motion.button>
      </form>
    </motion.div>
  );
};

export default CreateRound;

