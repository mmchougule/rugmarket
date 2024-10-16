import React, { useContext } from 'react';
// import { useDynamicContext, DynamicWidget } from '@dynamic-labs/sdk-react-core';
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from '@solana/wallet-adapter-react';
import styles from './Header.module.css';

const Header = () => {
  // const { primaryWallet } = useDynamicContext();
  // // const { user, handleLogOut, showAuthFlow } = useDynamicContext();
  // const user = primaryWallet;
  const user = [];
  const primaryWallet = [];
  // const { primaryWallet } = useWallet();
  const { wallet } = useWallet();
  const handleLogOut = () => {
    console.log('disconnect');
  };
  console.log(wallet);
    return (
      <header className={styles.header}>
      <div className={styles.logo}>Rugged a as Roulette</div>
      <WalletMultiButton />

      <nav className={styles.nav}>
        {wallet ? (
          <>
            <span className={styles.walletAddress}>
              {primaryWallet?.address?.slice(0, 6)}...{primaryWallet?.address?.slice(-4)}
            </span>
            <button className={styles.navButton} onClick={handleLogOut}>
              Disconnect
            </button>
          </>
        ) : (
          // <DynamicWidget />
          <button className={styles.navButton} onClick={showAuthFlow}>
            Connect Wallet
          </button>
        )}
      </nav>
      </header>
    );
};

export default Header;