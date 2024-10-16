import { useState, useEffect } from 'react';
import { DynamicContextProvider } from '@dynamic-labs/sdk-react-core';
import { SolanaWalletConnectors } from '@dynamic-labs/solana';
import WalletContextProvider from '../contexts/WalletContextProvider';
export function DynamicProvider({ children }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

    // dynamic doesnt work well use native methods.
  return (
    <WalletContextProvider>
      {children}
    </WalletContextProvider>
  )


//   return (
//     <DynamicContextProvider
//       settings={{
//         environmentId: "a5248b42-b4db-450a-9a28-d8ac39a96561",
//         initialAuthenticationMode: 'connect-only',
//         walletConnectors: [SolanaWalletConnectors],
//       }}
//     >
//       {children}
//     </DynamicContextProvider>
//   );
}

