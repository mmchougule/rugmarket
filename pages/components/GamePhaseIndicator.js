import React from 'react';
import { motion } from 'framer-motion';

export const GamePhaseIndicator = ({ phase, timeRemaining, totalPot }) => {
  const phases = ['Betting', 'Waiting', 'Results'];
      const currentIndex = phases.indexOf(phase.charAt(0).toUpperCase() + phase.slice(1));
    // phase is null above
    console.log(phase, phases);

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        {phases.map((p, index) => (
          <motion.div
            key={p}
            className={`text-lg font-bold ${index === currentIndex ? 'text-pink-500' : 'text-gray-400'}`}
            animate={{ scale: index === currentIndex ? 1.2 : 1 }}
          >
            {p}
          </motion.div>
        ))}
      </div>
      <motion.div className="bg-gray-700 h-2 rounded-full overflow-hidden">
        <motion.div
          className="bg-gradient-to-r from-pink-500 to-yellow-500 h-full"
          initial={{ width: '0%' }}
          animate={{ width: `${(currentIndex / 2) * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </motion.div>
      <div className="mt-4 flex justify-between">
        <div className="text-yellow-500 font-bold">Time: {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}</div>
        <div className="text-green-500 font-bold">Pot: {totalPot} SOL</div>
      </div>
    </div>
  );
};