// models/Review.js
import mongoose from 'mongoose';

const { Schema, model, models } = mongoose;

const reviewSchema = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Review must belong to a product.'],
      index: true
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user.'],
      index: true
    },
    rating: {
      type: Number,
      required: [true, 'Review must have a rating.'],
      min: [1, 'Rating must be at least 1.0.'],
      max: [5, 'Rating must be at most 5.0.']
    },
    comment: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

// Enforce one review per user per product
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

// Static method to calculate average rating and number of reviews for a product
reviewSchema.statics.calcAverageRatings = async function (productId) {
  const stats = await this.aggregate([
    {
      $match: { product: productId }
    },
    {
      $group: {
        _id: '$product',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);

  if (stats.length > 0) {
    await mongoose.model('Product').findByIdAndUpdate(productId, {
      numReviews: stats[0].nRating,
      averageRating: Math.round(stats[0].avgRating * 10) / 10 // round to 1 decimal place
    });
  } else {
    await mongoose.model('Product').findByIdAndUpdate(productId, {
      numReviews: 0,
      averageRating: 0
    });
  }
};

// Call calcAverageRatings after save
reviewSchema.post('save', function () {
  this.constructor.calcAverageRatings(this.product);
});

// Call calcAverageRatings after delete or update
reviewSchema.post(/^findOneAnd/, async function (doc) {
  if (doc) {
    await doc.constructor.calcAverageRatings(doc.product);
  }
});

const Review = models.Review || model('Review', reviewSchema);
export { Review };
export default Review;
