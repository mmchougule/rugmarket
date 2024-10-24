import React, { useState } from 'react'
// import { Wheel } from 'react-custom-roulette'
import styles from './WheelOfFortune.module.css'
import dynamic from 'next/dynamic';

const Wheel = dynamic(() => import('react-custom-roulette').then(mod => mod.Wheel), {
  ssr: false,
});

const data = [
  { option: 'Lose bet', style: { backgroundColor: '#FF6B6B', textColor: '#ffffff' } },
  { option: '0.005 SOL', style: { backgroundColor: '#4ECDC4', textColor: '#ffffff' } },
  { option: '0.01 SOL', style: { backgroundColor: '#45B7D1', textColor: '#ffffff' } },
  { option: 'Double credits', style: { backgroundColor: '#FFA07A', textColor: '#ffffff' } },
  { option: 'Try again', style: { backgroundColor: '#98D8C8', textColor: '#ffffff' } },
  { option: '0.02 SOL', style: { backgroundColor: '#F7DC6F', textColor: '#ffffff' } },
];

const WheelOfFortune = ({ userCredits, onSpin }) => {
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [result, setResult] = useState(null);

  // add vrf to this for better randomness.
  const handleSpinClick = () => {
    if (userCredits < 0.005) {
      alert('Not enough credits to spin!');
      return;
    }

    const newPrizeNumber = Math.floor(Math.random() * data.length);
    setPrizeNumber(newPrizeNumber);
    setMustSpin(true);
    setResult(null);
    onSpin(-0.005);
  };

  const handleSpinStop = () => {
    setMustSpin(false);
    console.log(`prizeNumber: ${prizeNumber}`)
    const prize = data[prizeNumber].option;
    setResult(prize);

    let prizeValue;
    switch (prize) {
      case 'Double credits':
        prizeValue = userCredits;
        break;
      case '0.005 SOL':
        prizeValue = 0.005;
        break;
      case '0.01 SOL':
        prizeValue = 0.01;
        break;
      case '0.02 SOL':
        prizeValue = 0.02;
        break;
      default:
        prizeValue = 0;
    }

    onSpin(prizeValue);
  };

  return (
    <div className={styles.wheelOfFortune}>
      <h2>Wheel of Fortune</h2>
      <div className={styles.wheelContainer}>
        <Wheel
          mustStartSpinning={mustSpin}
          prizeNumber={prizeNumber}
          data={data}
          onStopSpinning={handleSpinStop}
          outerBorderColor="#333333"
          spinDuration={1}
          outerBorderWidth={10}
          innerRadius={0}
          innerBorderColor="#333333"
          innerBorderWidth={20}
          radiusLineColor="#333333"
          radiusLineWidth={2}
          textDistance={60}
        />
      </div>
      <button onClick={handleSpinClick} disabled={mustSpin || userCredits < 0.005}>
        {mustSpin ? 'Spinning...' : 'Spin (0.005 SOL)'}
      </button>
      {result && (
        <div className={styles.result}>
          You won: {result}
        </div>
      )}
    </div>
  );
};

export default WheelOfFortune;
