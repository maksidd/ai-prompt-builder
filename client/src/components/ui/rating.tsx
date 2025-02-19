import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RatingProps {
  value: number;
  onChange?: (value: number) => void;
  max?: number;
  readonly?: boolean;
}

export function Rating({ value, onChange, max = 5, readonly = false }: RatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: max }).map((_, index) => {
        const starValue = index + 1;
        const filled = hoverValue !== null 
          ? starValue <= hoverValue
          : starValue <= value;

        const StarComponent = (
          <Star 
            className={cn(
              "h-4 w-4",
              filled ? "text-yellow-400 fill-current" : "text-muted-foreground"
            )}
          />
        );

        if (readonly) {
          return <div key={index}>{StarComponent}</div>;
        }

        return (
          <button
            key={index}
            type="button"
            className="p-1 hover:scale-110 transition-transform"
            onMouseEnter={() => setHoverValue(starValue)}
            onMouseLeave={() => setHoverValue(null)}
            onClick={() => onChange?.(starValue)}
          >
            {StarComponent}
          </button>
        );
      })}
    </div>
  );
}