import { useState } from "react";
import { FaStar } from "react-icons/fa";

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void; // optional for read-only
  readOnly?: boolean; // new prop
}

const StarRating: React.FC<StarRatingProps> = ({ rating, onRatingChange, readOnly = false }) => {
  const [hover, setHover] = useState<number>(0);

  return (
    <div className="flex space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <FaStar
          key={star}
          size={24}
          className={`cursor-pointer transition-colors duration-150 ${
            star <= (hover || rating) ? "text-yellow-400" : "text-gray-300"
          } ${readOnly ? "cursor-default" : ""}`}
          onClick={() => !readOnly && onRatingChange?.(star)}
          onMouseEnter={() => !readOnly && setHover(star)}
          onMouseLeave={() => !readOnly && setHover(0)}
        />
      ))}
    </div>
  );
};


export default StarRating;
