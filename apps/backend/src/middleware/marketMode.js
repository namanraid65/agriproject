import { MarketModes } from '@open-agri/shared';

export const marketModeDetector = (req, res, next) => {
  // Determine mode from headers, query params, or default to B2C
  let mode = req.headers['x-market-mode'] || req.query.marketMode || MarketModes.B2C;
  
  mode = mode.toUpperCase();
  
  if (![MarketModes.B2B, MarketModes.B2C].includes(mode)) {
    mode = MarketModes.B2C;
  }
  
  req.marketMode = mode;
  next();
};
