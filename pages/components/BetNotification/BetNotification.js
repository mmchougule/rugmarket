// components/BetNotifications/BetNotifications.js
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './BetNotification.module.css';

const BetNotifications = ({ notifications }) => {
  return (
    <div className={styles.notificationContainer}>
      <AnimatePresence>
        {notifications.map((notification, index) => (
          <motion.div
            key={notification.id}
            className={styles.notification}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.3 }}
            whileHover={{ scale: 1.05 }}
          >
            <motion.div
              animate={{ x: [0, -5, 5, -5, 5, 0] }}
              transition={{ repeat: Infinity, repeatDelay: 5, duration: 0.3 }}
            >
              {notification.message}
            </motion.div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default BetNotifications;

