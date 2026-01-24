/**
 * Product Reviews Component
 * Display and submit product reviews with real API integration
 */

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Star, ThumbsUp, MessageSquare, User, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useIsAuthenticated } from '@/hooks/useIsAuthenticated';
import { cn } from '@/lib/utils';
import reviewsService, {
  ProductReview as ApiReview,
  ReviewStats as ApiReviewStats,
  ReviewSortOption,
} from '@/services/reviewsService';

// Re-export types for backwards compatibility
export interface ProductReview {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title?: string;
  content: string;
  helpful: number;
  createdAt: string;
  verified?: boolean;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

interface ProductReviewsProps {
  productId: string;
  className?: string;
}

// Transform API review to component format
const transformReview = (review: ApiReview): ProductReview => ({
  id: review.id,
  productId: review.productId,
  userId: review.userId,
  userName: review.userName,
  userAvatar: review.userAvatar,
  rating: review.rating,
  title: review.title,
  content: review.text,
  helpful: review.helpfulCount,
  createdAt: review.createdAt,
  verified: review.isVerifiedPurchase,
});

// Transform API stats to component format
const transformStats = (stats: ApiReviewStats): ReviewStats => ({
  averageRating: stats.averageRating,
  totalReviews: stats.totalReviews,
  ratingDistribution: stats.ratingDistribution,
});

const ProductReviews: React.FC<ProductReviewsProps> = ({ productId, className }) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [content, setContent] = useState('');
  const [sortBy, setSortBy] = useState<ReviewSortOption>('newest');

  const isLoggedIn = useIsAuthenticated();

  // Fetch reviews from API
  const {
    data,
    isLoading,
    error: _error,
  } = useQuery({
    queryKey: ['reviews', productId, sortBy],
    queryFn: () => reviewsService.getProductReviews(productId, { sort: sortBy, limit: 20 }),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const reviews = useMemo(() => (data?.reviews || []).map(transformReview), [data?.reviews]);

  const stats = useMemo(
    () =>
      data?.stats
        ? transformStats(data.stats)
        : {
            averageRating: 0,
            totalReviews: 0,
            ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
          },
    [data?.stats]
  );

  // Submit review mutation
  const submitMutation = useMutation({
    mutationFn: (reviewData: { rating: number; text: string }) =>
      reviewsService.submitReview(productId, reviewData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', productId] });
      toast({
        title: t('reviews.submitted', 'Review submitted'),
        description: t('reviews.submittedDesc', 'Thank you for your feedback!'),
      });
      setRating(0);
      setContent('');
      setShowForm(false);
    },
    onError: () => {
      toast({
        title: t('reviews.submitError', 'Failed to submit review'),
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({
        title: t('reviews.ratingRequired', 'Please select a rating'),
        variant: 'destructive',
      });
      return;
    }

    if (content.trim().length < 10) {
      toast({
        title: t('reviews.contentRequired', 'Please write at least 10 characters'),
        variant: 'destructive',
      });
      return;
    }

    submitMutation.mutate({ rating, text: content });
  };

  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center py-12', className)}>
        <Loader2 className="w-8 h-8 animate-spin text-white/40" />
      </div>
    );
  }

  // Don't show error state - just show empty reviews
  // The service already handles errors gracefully

  return (
    <section className={cn('space-y-6', className)}>
      {/* Header with stats */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-6">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-white/60" />
          <h2 className="font-display text-xl font-semibold text-white">
            {t('reviews.title', 'Reviews')}
          </h2>
        </div>

        {/* Rating summary */}
        <div className="flex-1 flex flex-col sm:flex-row gap-6">
          <div className="text-center sm:text-left">
            <div className="text-4xl font-bold text-white">{stats.averageRating.toFixed(1)}</div>
            <StarRating rating={stats.averageRating} size="sm" />
            <p className="text-sm text-white/40 mt-1">
              {stats.totalReviews} {t('reviews.reviews', 'reviews')}
            </p>
          </div>

          {/* Rating distribution */}
          <div className="flex-1 space-y-1.5">
            {[5, 4, 3, 2, 1].map(star => {
              const count = stats.ratingDistribution[star as keyof typeof stats.ratingDistribution];
              const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-2">
                  <span className="text-xs text-white/60 w-3">{star}</span>
                  <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                  <Progress value={percentage} className="flex-1 h-2 bg-white/10" />
                  <span className="text-xs text-white/40 w-8">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Write review button */}
        {isLoggedIn && !showForm && (
          <Button
            onClick={() => setShowForm(true)}
            className="bg-white text-black hover:bg-white/90"
          >
            <Star className="w-4 h-4 mr-2" />
            {t('reviews.writeReview', 'Write a Review')}
          </Button>
        )}
      </div>

      {/* Review form */}
      {showForm && (
        <div className="p-6 rounded-xl bg-white/5 border border-white/10 space-y-4">
          <h3 className="font-semibold text-white">{t('reviews.yourReview', 'Your Review')}</h3>

          {/* Star rating input */}
          <div>
            <label className="text-sm text-white/60 mb-2 block">
              {t('reviews.yourRating', 'Your Rating')}
            </label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="p-1 transition-transform hover:scale-110"
                  aria-label={`${star} ${t('reviews.stars', 'stars')}`}
                >
                  <Star
                    className={cn(
                      'w-8 h-8 transition-colors',
                      (hoverRating || rating) >= star
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-white/20'
                    )}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Review text */}
          <div>
            <label htmlFor="review-content" className="text-sm text-white/60 mb-2 block">
              {t('reviews.yourFeedback', 'Your Feedback')}
            </label>
            <Textarea
              id="review-content"
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder={t('reviews.placeholder', 'Share your experience with this product...')}
              className="min-h-[120px] bg-white/5 border-white/10 text-white placeholder:text-white/30"
            />
            <p className="text-xs text-white/40 mt-1">
              {content.length}/500 {t('reviews.characters', 'characters')}
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowForm(false)}
              className="bg-transparent border-white/10 text-white hover:bg-white/5"
            >
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitMutation.isPending}
              className="bg-white text-black hover:bg-white/90"
            >
              {submitMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  {t('reviews.submitting', 'Submitting...')}
                </span>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  {t('reviews.submit', 'Submit Review')}
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Login prompt */}
      {!isLoggedIn && (
        <div className="p-4 rounded-lg bg-white/5 border border-white/10 text-center">
          <p className="text-white/60">
            {t('reviews.loginToReview', 'Please log in to write a review')}
          </p>
        </div>
      )}

      {/* Sort options */}
      {reviews.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {(['newest', 'oldest', 'highest', 'lowest', 'helpful'] as const).map(option => (
            <button
              key={option}
              onClick={() => setSortBy(option)}
              className={cn(
                'px-3 py-1.5 text-xs rounded-full transition-colors',
                sortBy === option
                  ? 'bg-white text-black'
                  : 'bg-white/10 text-white/60 hover:bg-white/20'
              )}
            >
              {t(`reviews.sort.${option}`, option)}
            </button>
          ))}
        </div>
      )}

      {/* Reviews list */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="text-center py-8 text-white/40">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>{t('reviews.noReviews', 'No reviews yet')}</p>
            <p className="text-sm mt-1">
              {t('reviews.beFirst', 'Be the first to review this product!')}
            </p>
          </div>
        ) : (
          reviews.map(review => <ReviewCard key={review.id} review={review} />)
        )}
      </div>
    </section>
  );
};

interface StarRatingProps {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const StarRating: React.FC<StarRatingProps> = ({ rating, size = 'md', className }) => {
  const sizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <div className={cn('flex gap-0.5', className)}>
      {[1, 2, 3, 4, 5].map(star => {
        let fillClass: string;
        if (rating >= star) {
          fillClass = 'text-yellow-400 fill-yellow-400';
        } else if (rating >= star - 0.5) {
          fillClass = 'text-yellow-400 fill-yellow-400/50';
        } else {
          fillClass = 'text-white/20';
        }

        return <Star key={star} className={cn(sizes[size], fillClass)} />;
      })}
    </div>
  );
};

interface ReviewCardProps {
  review: ProductReview;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isLoggedIn = useIsAuthenticated();
  const [helpfulCount, setHelpfulCount] = useState(review.helpful);
  const [isHelpful, setIsHelpful] = useState(false);

  const helpfulMutation = useMutation({
    mutationFn: () => reviewsService.toggleHelpful(review.id),
    onSuccess: data => {
      setHelpfulCount(data.helpfulCount);
      setIsHelpful(!isHelpful);
      queryClient.invalidateQueries({ queryKey: ['reviews', review.productId] });
    },
    onError: () => {
      toast({
        title: t('reviews.helpfulError', 'Failed to mark as helpful'),
        variant: 'destructive',
      });
    },
  });

  const handleHelpfulClick = () => {
    if (!isLoggedIn) {
      toast({
        title: t('reviews.loginToHelp', 'Please log in to mark reviews as helpful'),
        variant: 'destructive',
      });
      return;
    }
    helpfulMutation.mutate();
  };

  const [formattedDate, setFormattedDate] = useState('');

  useEffect(() => {
    setFormattedDate(
      new Date(review.createdAt).toLocaleDateString('uk-UA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    );
  }, [review.createdAt]);

  return (
    <div className="p-4 rounded-lg bg-white/5 border border-white/10 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
            {review.userAvatar ? (
              <img
                src={review.userAvatar}
                alt={review.userName}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <User className="w-5 h-5 text-white/40" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-white">{review.userName}</span>
              {review.verified && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">
                  {t('reviews.verified', 'Verified')}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <StarRating rating={review.rating} size="sm" />
              <span className="text-xs text-white/40">{formattedDate}</span>
            </div>
          </div>
        </div>
      </div>

      {review.title && <h4 className="font-medium text-white">{review.title}</h4>}

      <p className="text-white/80 text-sm leading-relaxed">{review.content}</p>

      <div className="flex items-center gap-4 pt-2">
        <button
          onClick={handleHelpfulClick}
          disabled={helpfulMutation.isPending}
          className={cn(
            'flex items-center gap-1.5 text-sm transition-colors',
            isHelpful ? 'text-green-400' : 'text-white/40 hover:text-white',
            helpfulMutation.isPending && 'opacity-50 cursor-not-allowed'
          )}
        >
          <ThumbsUp className="w-4 h-4" />
          <span>
            {t('reviews.helpful', 'Helpful')} ({helpfulCount})
          </span>
        </button>
      </div>
    </div>
  );
};

export default ProductReviews;
export { StarRating };
