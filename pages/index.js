// import App from './components/App';
import dynamic from 'next/dynamic';
import WalletContextProvider from './contexts/WalletContextProvider';
// import '../styles/global.css'

// Use dynamic import to avoid SSR issues with wallet adapter
const AppContent = dynamic(() => import('./components/App'), { ssr: false });

export default function Home() {
  return (
    <WalletContextProvider>
      <AppContent />
    </WalletContextProvider>
  )
}