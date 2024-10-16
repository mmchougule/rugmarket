import React, { useState, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { ArrowLeft, ArrowRight, Clock, DollarSign } from 'lucide-react';

const PredictionCard = ({ market, onSwipe, defaultBetAmount }) => {
  const controls = useAnimation();
  const [exitX, setExitX] = useState(0);

  const handleDragEnd = (event, info) => {
    const threshold = 100;
    if (info.offset.x > threshold) {
      controls.start({ x: "100%", opacity: 0 });
      setExitX(1);
      onSwipe('yes', market.id, defaultBetAmount);
    } else if (info.offset.x < -threshold) {
      controls.start({ x: "-100%", opacity: 0 });
      setExitX(-1);
      onSwipe('no', market.id, defaultBetAmount);
    } else {
      controls.start({ x: 0, opacity: 1 });
    }
  };

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      animate={controls}
      exit={{ x: exitX * 300, opacity: 0 }}
      className="absolute w-full h-full bg-gradient-to-br from-purple-600 to-blue-500 rounded-xl shadow-lg p-6 text-white"
    >
      <h2 className="text-2xl font-bold mb-4">{market.question}</h2>
      <div className="flex items-center mb-2">
        <Clock className="mr-2" />
        <span>Expires in {market.expiresIn} hours</span>
      </div>
      <div className="flex items-center">
        <DollarSign className="mr-2" />
        <span>Default bet: ${defaultBetAmount}</span>
      </div>
      <div className="absolute bottom-6 left-6 right-6 flex justify-between">
        <div className="flex items-center">
          <ArrowLeft className="mr-2" />
          <span>No</span>
        </div>
        <div className="flex items-center">
          <span>Yes</span>
          <ArrowRight className="ml-2" />
        </div>
      </div>
    </motion.div>
  );
};

const PredictionMarketSwiper = ({ markets, onSwipe, defaultBetAmount }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleSwipe = (direction, marketId, amount) => {
    onSwipe(direction, marketId, amount);
    setCurrentIndex(prevIndex => prevIndex + 1);
  };

  return (
    <div className="relative w-full h-[70vh] bg-gray-900 overflow-hidden rounded-xl">
      {markets.map((market, index) => (
        index >= currentIndex && (
          <PredictionCard
            key={market.id}
            market={market}
            onSwipe={handleSwipe}
            defaultBetAmount={defaultBetAmount}
          />
        )
      ))}
    </div>
  );
};

export default PredictionMarketSwiper;