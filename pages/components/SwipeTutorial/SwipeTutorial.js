import React, { useEffect, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import styles from './SwipeTutorial.module.css';

const SwipeTutorial = () => {
  const controls = useAnimation();
  const [iteration, setIteration] = useState(0);

  useEffect(() => {
    const runAnimation = async () => {
      await controls.start({ x: -100, transition: { duration: 0.5 } });
      await controls.start({ x: 0, transition: { duration: 0.5 } });
      await controls.start({ x: 100, transition: { duration: 0.5 } });
      await controls.start({ x: 0, transition: { duration: 0.5 } });
      setIteration(prev => prev + 1);
    };

    if (iteration < 10) {
      runAnimation();
    // } else {
    //   onComplete();
    }
  }, [controls, iteration]);

  return (
    <div className={styles.tutorialContainer}>
      <motion.div className={styles.tutorialCard} animate={controls}>
        <p>Swipe left or right to choose!</p>
      </motion.div>
    </div>
  );
};

export default SwipeTutorial;
