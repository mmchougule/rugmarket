import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Twitter, Globe, TrendingUp, TrendingDown } from 'lucide-react';
import styles from './TokenCards.module.css';
import DynamicTimestamp from '../DynamicTimestamp';

const TokenCard = ({ token, isSelected, onSelect, isWinner }) => {
  const [currentData, setCurrentData] = useState(null);
  const [candleStickData, setCandleStickData] = useState(null);

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

  if (!currentData || !candleStickData) return <div>Loading...</div>;

  const priceChange = ((candleStickData.close - candleStickData.open) / candleStickData.open * 100).toFixed(2);

  return (
    <motion.div
      className={`${styles.tokenCard} ${isSelected ? styles.selected : ''}`}
      onClick={() => onSelect(token.mint)}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <div className={styles.cardHeader}>
        <h3 className={styles.tokenName}>{token.name}
        {isWinner && ' - Winner'}
        </h3>
        <span className={styles.tokenSymbol}>Ticker: {token.symbol}</span>
        <p className={styles.positive}>Market Cap: ${currentData.usd_market_cap?.toFixed(2)}</p>
        <img src={currentData.image_uri} alt={token.name} className={styles.tokenImage} />
      </div>
      <p className={`${styles.tokenChange} ${priceChange >= 0 ? styles.positive : styles.negative}`}>
        {priceChange >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
        {priceChange}%
      </p>
      <div className={styles.tokenDetails}>
        <p className={styles.description}>{token.description}</p>
        <div className={styles.socialLinks}>
          <a href={`https://pump.fun/${token.mint}`} target="_blank" rel="noopener noreferrer">
            <p className={styles.pumpFunLink}>View on Pump.fun</p>
          </a>
          {token.twitter && <a href={token.twitter} target="_blank" rel="noopener noreferrer"><Twitter size={16} /></a>}
          {token.website && <a href={token.website} target="_blank" rel="noopener noreferrer"><Globe size={16} /></a>}
        </div>
        <p className={styles.totalReplies}>Total Replies: {currentData.reply_count}</p>
        <p className={styles.lastReplyTime}>Last Reply: 
          {currentData.last_reply ? <DynamicTimestamp date={new Date(currentData.last_reply).toISOString()} /> : 'No replies yet'}
        </p>
      </div>
    </motion.div>
  );
};

export default TokenCard;
