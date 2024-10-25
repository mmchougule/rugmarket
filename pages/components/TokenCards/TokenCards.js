import React, { useEffect, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { Twitter, Globe, TrendingUp, TrendingDown } from 'lucide-react';
import styles from './TokenCards.module.css';
import DynamicTimestamp from '../DynamicTimestamp';


const TokenCard2 = ({ token }) => {
  const priceChange = ((token.currentPrice - token.openPrice) / token.openPrice * 100).toFixed(2);

  return (
    <motion.div
      className={styles.tokenCard}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <div className={styles.cardHeader}>
        <img src={token.imageUrl} alt={token.name} className={styles.tokenImage} />
        <h3 className={styles.tokenName}>{token.name}</h3>
        <span className={styles.tokenSymbol}>{token.symbol}</span>
      </div>
      <div className={styles.tokenDetails}>
        <p className={styles.tokenPrice}>${token.currentPrice.toFixed(2)}</p>
        <p className={`${styles.tokenChange} ${priceChange >= 0 ? styles.positive : styles.negative}`}>
          {priceChange >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
          {Math.abs(priceChange)}%
        </p>
      </div>
      <div className={styles.tokenStats}>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Market Cap</span>
          <span className={styles.statValue}>${token.marketCap.toLocaleString()}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Volume (24h)</span>
          <span className={styles.statValue}>${token.volume24h.toLocaleString()}</span>
        </div>
      </div>
    </motion.div>
  );
};

const TokenCard = ({ token, isSelected, onSelect, isWinner, newEvent }) => {
  const [currentData, setCurrentData] = useState(null);
  const [candleStickData, setCandleStickData] = useState(null);
  const controls = useAnimation();

  useEffect(() => {
    if (newEvent) {
      controls.start({
        x: [0, -5, 5, -5, 5, 0],
        transition: { duration: 0.5 }
      });
    }
  }, [newEvent, controls]);

  useEffect(() => {
    const fetchData = async () => {
      // const response = await fetch(`https://frontend-api.pump.fun/coins/${token.mint}`);
      const proxyUrl = `/api/proxy?path=coins/${token.mint}`;
      const response = await fetch(proxyUrl);
      const data = await response.json();
      const candleStickProxyUrl = `/api/proxy?path=candlesticks/${token.mint}?offset=0&limit=10&timeframe=5`;
      const candleStickResponse = await fetch(candleStickProxyUrl);
      const candleStickData = await candleStickResponse.json();
      const lastCandleStickData = candleStickData.length > 0 ? candleStickData[candleStickData.length - 1] : null;
      setCandleStickData(lastCandleStickData);
      setCurrentData(data);
    };

    fetchData();
  }, [token]);

  if (!currentData) return <div>Loading...</div>;

  let priceChange = 0;
  if (candleStickData) {
    priceChange = ((candleStickData.close - candleStickData.open) / candleStickData.open * 100).toFixed(2);
  }

  return (
    <motion.div
      className={`${styles.tokenCard} ${isSelected ? styles.selected : ''}`}
      animate={controls}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div 
        className={styles.cardHeader}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h3 className={styles.tokenName}>{token.name}
        {isWinner && ' - Winner'}
        </h3>
        <span className={styles.tokenSymbol}>Ticker: {token.symbol}</span>
        <p className={styles.positive}>Market Cap: ${currentData.usd_market_cap?.toFixed(2)}</p>
        <motion.img 
          src={currentData.image_uri} 
          alt={token.name} 
          className={styles.tokenImage}
          whileHover={{ rotate: 360 }}
          transition={{ duration: 0.5 }}
        />
      </motion.div>
      <motion.p 
        className={`${styles.tokenChange} ${priceChange >= 0 ? styles.positive : styles.negative}`}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {priceChange >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
        {priceChange}%
      </motion.p>
      <motion.div 
        className={styles.tokenDetails}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <p className={styles.description}>{token.description}</p>
      </motion.div>
      <div className={styles.socialLinks}>
        <a href={`https://pump.fun/${token.mint}`} target="_blank" rel="noopener noreferrer">
          <p className={styles.pumpFunLink}>view on Pump.fun</p>
        </a>
      </div>
      <div className={styles.socialLinks}>
        {token.telegram && 
          <a href={token.telegram} target="_blank" rel="noopener noreferrer">
            TG
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 496 512"><path d="M248 8C111 8 0 119 0 256S111 504 248 504 496 393 496 256 385 8 248 8zM363 176.7c-3.7 39.2-19.9 134.4-28.1 178.3-3.5 18.6-10.3 24.8-16.9 25.4-14.4 1.3-25.3-9.5-39.3-18.7-21.8-14.3-34.2-23.2-55.3-37.2-24.5-16.1-8.6-25 5.3-39.5 3.7-3.8 67.1-61.5 68.3-66.7 .2-.7 .3-3.1-1.2-4.4s-3.6-.8-5.1-.5q-3.3 .7-104.6 69.1-14.8 10.2-26.9 9.9c-8.9-.2-25.9-5-38.6-9.1-15.5-5-27.9-7.7-26.8-16.3q.8-6.7 18.5-13.7 108.4-47.2 144.6-62.3c68.9-28.6 83.2-33.6 92.5-33.8 2.1 0 6.6 .5 9.6 2.9a10.5 10.5 0 0 1 3.5 6.7A43.8 43.8 0 0 1 363 176.7z"/></svg>
          </a>}
        {token.twitter && <a href={token.twitter} target="_blank" rel="noopener noreferrer"><Twitter size={16} /></a>}
        {token.website && <a href={token.website} target="_blank" rel="noopener noreferrer"><Globe size={16} /></a>}
      </div>
      <span className={styles.tokenPrice}>created: <DynamicTimestamp date={new Date(token.created_timestamp).toISOString()} /></span>
      <p className={styles.totalReplies}>total replies: {currentData.reply_count}</p>
      <p className={styles.lastReplyTime}>
        last reply: {currentData.last_reply ? <DynamicTimestamp date={new Date(currentData.last_reply).toISOString()} /> : 'No replies yet'}
      </p>
    </motion.div>
  );
};

export default TokenCard;
