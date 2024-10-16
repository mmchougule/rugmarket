import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const LiveFeed = ({ game }) => {
  return (
    <div className="bg-gradient-to-r from-purple-800 to-indigo-800 rounded-xl p-6 shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-yellow-500">
        Live Bets
      </h2>
      <div className="max-h-60 overflow-y-auto">
        <AnimatePresence>
          {game.bets.slice().reverse().map((bet, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="bg-purple-900 rounded-lg p-3 mb-2 flex justify-between items-center"
            >
              <span className="text-pink-500 font-bold">
                {bet.user.toString().slice(0, 4)}...{bet.user.toString().slice(-4)}
              </span>
              <span className="text-yellow-500 font-bold">{bet.amount.toString()} SOL</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};