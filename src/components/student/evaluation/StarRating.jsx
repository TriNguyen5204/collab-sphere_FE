import React, { useState } from 'react';
import { Star } from 'lucide-react';

const StarRating = ({ value = 0, onChange, readOnly = false, size = 22 }) => {
  const [hover, setHover] = useState(0);
  const display = hover || value || 0;

  return (
    <div className="flex items-center gap-2 select-none" role="radiogroup" aria-label="rating">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            disabled={readOnly}
            onMouseEnter={() => !readOnly && setHover(n)}
            onMouseLeave={() => !readOnly && setHover(0)}
            onClick={() => !readOnly && onChange?.(n)}
            className={`p-0.5 transition-transform ${readOnly ? 'cursor-default' : 'hover:scale-110'}`}
            title={`${n} star${n>1?'s':''}`}
          >
            <Star
              size={size}
              className={`${n <= display ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
            />
          </button>
        ))}
      </div>
      <span className="text-sm text-gray-600 w-10">{value ? `${value}/5` : '-'}</span>
    </div>
  );
};

export default StarRating;
