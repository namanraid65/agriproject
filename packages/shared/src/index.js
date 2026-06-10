// Shared Constants for B2B/B2C agricultural e-commerce
export const MarketModes = {
  B2B: 'B2B',
  B2C: 'B2C'
};

export const UserRoles = {
  // B2C roles
  CUSTOMER: 'CUSTOMER',
  
  // B2B roles
  FARMER: 'FARMER',
  DISTRIBUTOR: 'DISTRIBUTOR',
  WHOLESALER: 'WHOLESALER',
  
  // Admin role
  ADMIN: 'ADMIN'
};

export const ProductCategories = [
  'SEEDS',
  'FERTILIZERS',
  'PESTICIDES',
  'MACHINERY',
  'IRRIGATION',
  'ANIMAL_FEED',
  'TOOLS'
];

export const OrderStatus = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED'
};

export const RFQStatus = {
  SUBMITTED: 'SUBMITTED',
  UNDER_REVIEW: 'UNDER_REVIEW',
  QUOTED: 'QUOTED',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED'
};
