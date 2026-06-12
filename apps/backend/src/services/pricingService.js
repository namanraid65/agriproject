/**
 * Calculate the correct price for a product based on purchase quantity and market mode.
 * For B2B, verifies minimum order quantities (MOQ) and selects the corresponding bulk tier.
 */
export const calculateProductPrice = (product, quantity, marketMode) => {
  if (marketMode === 'B2B') {
    if (quantity < (product.minimumOrderQuantity || 1)) {
      throw new Error(`Minimum order quantity for "${product.name}" is ${product.minimumOrderQuantity} ${product.unit || 'units'}`);
    }

    if (product.wholesalePricing && product.wholesalePricing.length > 0) {
      // Sort tiers by minQuantity in descending order to match the highest reached tier first
      const sortedTiers = [...product.wholesalePricing].sort((a, b) => b.minQuantity - a.minQuantity);
      const matchedTier = sortedTiers.find(tier => quantity >= tier.minQuantity);

      if (matchedTier) {
        return matchedTier.pricePerUnit;
      }

      // Default to the first tier's price if above MOQ but below all tier targets
      return product.wholesalePricing[0].pricePerUnit;
    }
  }

  // Default to retail price for B2C or B2B fallback
  if (marketMode !== 'B2B' && product.discountPrice && product.discountPrice > 0) {
    return product.discountPrice;
  }
  return product.retailPrice;
};
