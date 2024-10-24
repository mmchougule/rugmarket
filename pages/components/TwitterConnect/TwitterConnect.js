import React from 'react';
import styles from './TwitterConnect.module.css';
import Capsule, { Environment, OAuthMethod } from '@usecapsule/web-sdk';

const capKey = process.env.CAPSULE_API_KEY || '39b56c1ec3b25918324fb27b2b32b203';
const capsule = new Capsule(Environment.BETA, capKey);

const TwitterConnect = ({ onConnect = () => {} }) => {
  const oAuthMethod = OAuthMethod.TWITTER;
  const handleConnect = async () => {
    const oAuthUrl = await capsule.getOAuthURL(oAuthMethod);
    if (typeof window !== 'undefined') {
      window.open(oAuthUrl, 'popup', 'width=500,height=600');
    }
    const { email, userExists } = await capsule.waitForOAuth();
    console.log(email, userExists);
    console.log(capsule.xUrl);
    onConnect(email);
  }
  return (
    <div className={styles.twitterConnect}>
      <h3>Connect your Twitter account to get 5 free credits!</h3>
      <button onClick={handleConnect}>Connect Twitter</button>
    </div>
  );
};

export default TwitterConnect;
