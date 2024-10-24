import React, { useState } from 'react';
import { supabase } from '../../../lib/supabase';
import styles from './CreditManager.module.css';
import { motion } from 'framer-motion';
const CreditManager = ({ userCredits, onCreditChange }) => {
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAddCredits = async () => {
    setIsLoading(true);
    setError(null);
    const solAmount = parseFloat(amount);

    if (isNaN(solAmount) || solAmount < 0.1) {
      setError('Please enter a valid amount (minimum 0.1 SOL)');
      setIsLoading(false);
      return;
    }

    try {
      // Here you would integrate with a payment processor or wallet connection
      // For this example, we'll just update the database
      const { data, error } = await supabase
        .from('user_credits')
        .update({ credits: userCredits + solAmount })
        .eq('user_address', supabase.auth.user().id)
        .single();

      if (error) throw error;

      onCreditChange(data.credits);
      setAmount('');
    } catch (error) {
      setError('Failed to add credits. Please try again.');
      console.error('Error adding credits:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCashOut = async () => {
    setIsLoading(true);
    setError(null);
    const solAmount = parseFloat(amount);

    if (isNaN(solAmount) || solAmount <= 0 || solAmount > userCredits) {
      setError('Please enter a valid amount to cash out');
      setIsLoading(false);
      return;
    }

    try {
      // Here you would integrate with a wallet or payment processor to send funds
      // For this example, we'll just update the database
      const { data, error } = await supabase
        .from('user_credits')
        .update({ credits: userCredits - solAmount })
        .eq('user_address', supabase.auth.user().id)
        .single();

      if (error) throw error;

      onCreditChange(data.credits);
      setAmount('');
    } catch (error) {
      setError('Failed to cash out. Please try again.');
      console.error('Error cashing out:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      className={styles.creditManager}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h3>Manage Credits</h3>
      <p>Current Balance: {userCredits.toFixed(3)} SOL</p>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Enter amount in SOL"
        min="0.1"
        step="0.1"
      />
      <button onClick={handleAddCredits} disabled={isLoading}>
        Add Credits
      </button>
      <button onClick={handleCashOut} disabled={isLoading}>
        Cash Out
      </button>
      {error && <p className={styles.error}>{error}</p>}
    </motion.div>
  );
};

export default CreditManager;

