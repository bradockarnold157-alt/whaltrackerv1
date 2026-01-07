import { Star, StarHalf } from "lucide-react";

interface StarRatingProps {
  rating: number;
  showValue?: boolean;
  reviewsCount?: number;
  size?: "sm" | "md" | "lg";
}

const StarRating = ({ rating, showValue = true, reviewsCount, size = "md" }: StarRatingProps) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center">
        {/* Full stars */}
        {[...Array(fullStars)].map((_, i) => (
          <Star
            key={`full-${i}`}
            className={`${sizeClasses[size]} fill-warning text-warning`}
          />
        ))}
        
        {/* Half star */}
        {hasHalfStar && (
          <div className="relative">
            <Star className={`${sizeClasses[size]} text-muted-foreground`} />
            <div className="absolute inset-0 overflow-hidden w-1/2">
              <Star className={`${sizeClasses[size]} fill-warning text-warning`} />
            </div>
          </div>
        )}
        
        {/* Empty stars */}
        {[...Array(emptyStars)].map((_, i) => (
          <Star
            key={`empty-${i}`}
            className={`${sizeClasses[size]} text-muted-foreground`}
          />
        ))}
      </div>
      
      {showValue && (
        <span className={`font-medium ${size === "sm" ? "text-sm" : ""}`}>
          {rating.toFixed(1)}
        </span>
      )}
      
      {reviewsCount !== undefined && (
        <span className={`text-muted-foreground ${size === "sm" ? "text-sm" : ""}`}>
          ({reviewsCount.toLocaleString("pt-BR")} avaliações)
        </span>
      )}
    </div>
  );
};

export default StarRating;
