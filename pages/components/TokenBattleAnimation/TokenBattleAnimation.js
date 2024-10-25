import React, { useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import styles from './TokenBattleAnimation.module.css';

const TokenBattleAnimation = ({ tokens, onComplete }) => {
    const controls1 = useAnimation();
    const controls2 = useAnimation();

    const shakeAnimation = {
        x: [0, -10, 10, -10, 10, 0],
        rotate: [0, -5, 5, -5, 5, 0],
    };

    useEffect(() => {
        if (controls1 && controls2) {
        const animateTokens = async () => {
            // Wait for 1 second
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Move tokens to center
            await Promise.all([
                controls1.start({ x: '50%', transition: { duration: 1 } }),
                controls2.start({ x: '-50%', transition: { duration: 1 } })
            ]);

            // Shake animation
            for (let i = 0; i < 5; i++) {
                await Promise.all([
                    controls1.start(shakeAnimation),
                    controls2.start(shakeAnimation)
                ]);
            }

            // Wait for 1 more second
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Call onComplete after animation
            onComplete();
            };
            animateTokens();
        }
    }, [controls1, controls2, onComplete]);

    return (
        <div className={styles.battleContainer}>
            <motion.div
                className={styles.tokenLeft}
                initial={{ x: '-100%' }}
                animate={controls1}
            >
                <img src={tokens[0].image_uri} alt={tokens[0].name} />
            </motion.div>
            
            <motion.div
                className={styles.tokenRight}
                initial={{ x: '100%' }}
                animate={controls2}
            >
                <img src={tokens[1].image_uri} alt={tokens[1].name} />
            </motion.div>
            <motion.div
                className={styles.fightText}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 2, duration: 0.5 }}
            >
                Fight Begins! Place Your Bets!
            </motion.div>
        </div>
    );
};

export default TokenBattleAnimation;
