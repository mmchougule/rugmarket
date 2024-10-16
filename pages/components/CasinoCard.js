import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, DollarSign, ChevronLeft, ChevronRight, Award, Coins } from 'lucide-react';

const PredictionCard = ({ market, onSwipe }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 rounded-xl shadow-lg p-6 mb-4 text-white"
    >
      <h2 className="text-2xl font-bold mb-4">{market.question}</h2>
      <div className="flex items-center mb-2">
        <Clock className="mr-2 text-yellow-300" />
        <span>Expires in {market.expiresIn} hours</span>
      </div>
      <div className="flex items-center mb-4">
        <DollarSign className="mr-2 text-green-300" />
        <span>Default bet: ${market.defaultBet}</span>
      </div>
      <div className="flex justify-between">
        <button onClick={() => onSwipe('no', market.id)} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full flex items-center">
          <ChevronLeft className="mr-1" /> No
        </button>
        <button onClick={() => onSwipe('yes', market.id)} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full flex items-center">
          Yes <ChevronRight className="ml-1" />
        </button>
      </div>
    </motion.div>
  );
};

const CasinoCard = ({ markets, onSwipe, initialBalance = 1000 }) => {
  const [balance, setBalance] = useState(initialBalance);

  const handleSwipe = (direction, marketId) => {
    const market = markets.find(m => m.id === marketId);
    setBalance(prevBalance => prevBalance - market.defaultBet);
    onSwipe(direction, marketId, market.defaultBet);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-purple-900 text-white p-4">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-pink-500">
          Rugged Roulette
        </h1>
        <div className="flex items-center space-x-4">
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="flex items-center bg-gradient-to-r from-yellow-400 to-yellow-600 px-4 py-2 rounded-full shadow-lg"
          >
            <Coins className="text-white mr-2" />
            <span className="text-xl font-bold">${balance}</span>
          </motion.div>
        </div>
      </header>

      <div className="space-y-4">
        {markets.map(market => (
          <PredictionCard key={market.id} market={market} onSwipe={handleSwipe} />
        ))}
      </div>

      <div className="mt-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-4 shadow-lg">
        <h2 className="text-2xl font-bold mb-2 flex items-center">
          <Award className="text-yellow-300 mr-2" />
          Leaderboard
        </h2>
        {/* Add leaderboard content here */}
      </div>

      <div className="mt-6 flex justify-center">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-gradient-to-r from-green-400 to-blue-500 text-white font-bold py-3 px-6 rounded-full text-lg shadow-lg"
        >
          Cash Out
        </motion.button>
      </div>
    </div>
  );
};

export default CasinoCard;