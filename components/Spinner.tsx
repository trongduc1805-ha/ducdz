import React from 'react';

const Spinner = ({ size = '8', color = 'yellow' }: { size?: string; color?: 'yellow' | 'white' | 'black' | 'slate' }) => {
  // Mapping size prop to Tailwind's font-size classes.
  const sizeMap: { [key: string]: string } = {
    '4': 'text-lg',   // was h-4
    '5': 'text-xl',   // was h-5
    '6': 'text-2xl',  // was h-6
    '8': 'text-3xl',  // was h-8
    '12': 'text-5xl', // was h-12
    '16': 'text-6xl', // was h-16
  };

  // Enhanced color mapping with gradients
  const colorMap: { [key: string]: string } = {
    'yellow': 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-500',
    'white': 'text-white',
    'black': 'text-black',
    'slate': 'text-slate-500 dark:text-slate-400'
  };

  const sizeClass = sizeMap[size] || 'text-3xl';
  const colorClass = colorMap[color] || 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-500';

  return (
    <div className="relative">
      {/* Glow effect for yellow spinner */}
      {color === 'yellow' && (
        <div className="absolute inset-0 animate-spin blur-lg">
          <span className={`${sizeClass} ${colorClass} font-bold opacity-50`} aria-hidden="true">
            #
          </span>
        </div>
      )}
      
      {/* Main spinner */}
      <div
        className={`animate-spin ${sizeClass} ${colorClass} font-bold drop-shadow-lg`}
        role="status"
        style={{ 
          animationDuration: '1.2s',
          filter: color === 'yellow' ? 'drop-shadow(0 0 10px rgba(251, 191, 36, 0.5))' : 'none'
        }}
      >
        <span aria-hidden="true">#</span>
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
};

export default Spinner;
