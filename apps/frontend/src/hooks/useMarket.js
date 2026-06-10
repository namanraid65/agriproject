import { useContext } from 'react';
import { MarketContext } from '../context/MarketContext.jsx';

export const useMarket = () => {
  const context = useContext(MarketContext);
  if (!context) {
    throw new Error('useMarket must be used within a MarketProvider');
  }
  return context;
};
export default useMarket;
