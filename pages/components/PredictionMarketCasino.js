import React, { useState } from 'react';
import PredictionMarketSwiper from './PredictionMarketSwiper';
import { Coins, Award, Settings } from 'lucide-react';

const CasinoThemedPredictionMarket = ({ markets, onSwipe, initialBalance = 1000 }) => {
  const [balance, setBalance] = useState(initialBalance);
  const [defaultBetAmount, setDefaultBetAmount] = useState(10);

  const handleSwipe = (direction, marketId, amount) => {
    setBalance(prevBalance => prevBalance - amount);
    onSwipe(direction, marketId, amount);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-yellow-400">Rugged Roulette</h1>
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <Coins className="text-yellow-400 mr-2" />
            <span className="text-xl">${balance}</span>
          </div>
          <button className="bg-purple-600 hover:bg-purple-700 p-2 rounded-full">
            <Settings />
          </button>
        </div>
      </header>

      <PredictionMarketSwiper
        markets={markets}
        onSwipe={handleSwipe}
        defaultBetAmount={defaultBetAmount}
      />

      <div className="mt-6 bg-gray-800 rounded-xl p-4">
        <h2 className="text-xl font-bold mb-2 flex items-center">
          <Award className="text-yellow-400 mr-2" />
          Leaderboard
        </h2>
        {/* Add leaderboard content here */}
      </div>

      <div className="mt-6 flex justify-center">
        <button className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-full">
          Cash Out
        </button>
      </div>
    </div>
  );
};

export default CasinoThemedPredictionMarket;