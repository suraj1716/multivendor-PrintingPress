import React from 'react';
import { useForm } from '@inertiajs/react';
import { Star } from 'lucide-react';

interface ReviewProps {
  productId: number;
}

const Review: React.FC<ReviewProps> = ({ productId }) => {
  const { data, setData, post, processing, errors, reset } = useForm({
    rating: 0,
    comment: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('reviews.store', productId), {
      onSuccess: () => reset(),
    });
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <button
          key={i}
          type="button"
          onClick={() => setData('rating', i)}
          className="focus:outline-none"
        >
          <Star
            size={28}
            className={`inline-block transition-colors ${
              i <= data.rating ? 'text-yellow-400' : 'text-gray-300'
            }`}
            fill={i <= data.rating ? '#facc15' : 'none'}
          />
        </button>
      );
    }
    return stars;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <div>
        <label className="block text-sm font-medium mb-1">Rating</label>
        <div className="flex space-x-1">{renderStars()}</div>
        {errors.rating && <div className="text-red-600 text-sm mt-1">{errors.rating}</div>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Comment</label>
        <textarea
          value={data.comment}
          onChange={(e) => setData('comment', e.target.value)}
          className="border px-2 py-1 rounded w-full"
          rows={4}
          placeholder="Write your review..."
        />
        {errors.comment && <div className="text-red-600 text-sm">{errors.comment}</div>}
      </div>

      <button
        type="submit"
        disabled={processing || data.rating === 0}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        Submit Review
      </button>
    </form>
  );
};

export default Review;
