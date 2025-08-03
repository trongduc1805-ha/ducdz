import React, { useMemo, useEffect } from 'react';

const animationStyleId = 'generated-thumbnail-animations';
const animationStyles = `
  @keyframes float {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    25% { transform: translateY(-10px) rotate(5deg); }
    50% { transform: translateY(-5px) rotate(0deg); }
    75% { transform: translateY(-15px) rotate(-5deg); }
  }
  @keyframes swing {
    0%, 100% { transform: rotate(0deg) scale(1); }
    25% { transform: rotate(15deg) scale(1.1); }
    50% { transform: rotate(0deg) scale(0.9); }
    75% { transform: rotate(-15deg) scale(1.1); }
  }
  @keyframes glow {
    0%, 100% { filter: brightness(1) drop-shadow(0 0 5px rgba(255,255,255,0.3)); }
    50% { filter: brightness(1.3) drop-shadow(0 0 20px rgba(255,255,255,0.8)); }
  }
  .animate-float { animation: float 3s ease-in-out infinite; }
  .animate-swing { animation: swing 2s ease-in-out infinite; }
  .animate-glow { animation: glow 2s ease-in-out infinite; }
  
  /* Wave animations */
  @keyframes wave-0 { 0%, 100% { transform: translateY(0px) scaleX(1); } 50% { transform: translateY(-5px) scaleX(1.1); } }
  @keyframes wave-1 { 0%, 100% { transform: translateY(2px) scaleX(0.9); } 50% { transform: translateY(-3px) scaleX(1.2); } }
  @keyframes wave-2 { 0%, 100% { transform: translateY(-1px) scaleX(1.1); } 50% { transform: translateY(-6px) scaleX(0.8); } }
  @keyframes wave-3 { 0%, 100% { transform: translateY(3px) scaleX(1); } 50% { transform: translateY(-2px) scaleX(1.3); } }
  @keyframes wave-4 { 0%, 100% { transform: translateY(1px) scaleX(0.95); } 50% { transform: translateY(-4px) scaleX(1.15); } }
  @keyframes wave-5 { 0%, 100% { transform: translateY(-2px) scaleX(1.05); } 50% { transform: translateY(-7px) scaleX(0.9); } }
  @keyframes wave-6 { 0%, 100% { transform: translateY(4px) scaleX(1.1); } 50% { transform: translateY(-1px) scaleX(1.25); } }
  @keyframes wave-7 { 0%, 100% { transform: translateY(0px) scaleX(0.85); } 50% { transform: translateY(-5px) scaleX(1.4); } }
`;


const GeneratedThumbnail = ({ name }: { name: string }) => {
  useEffect(() => {
    if (!document.getElementById(animationStyleId)) {
      const styleEl = document.createElement('style');
      styleEl.id = animationStyleId;
      styleEl.innerHTML = animationStyles;
      document.head.appendChild(styleEl);
    }
  }, []);

  // Generate deterministic random values based on course name
  const randomSeed = useMemo(() => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      const char = name.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }, [name]);

  // Deterministic random function
  const seededRandom = (seed: number) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };

  // Generate unique characteristics for each course
  const courseData = useMemo(() => {
    const baseColors = [
      'from-yellow-400 via-yellow-500 to-amber-500',
      'from-amber-400 via-orange-500 to-yellow-500',
      'from-yellow-300 via-yellow-400 to-amber-400',
      'from-orange-400 via-yellow-500 to-amber-600',
      'from-yellow-500 via-amber-500 to-orange-500',
      'from-amber-300 via-yellow-500 to-amber-500',
      'from-rose-400 via-pink-500 to-red-500',
      'from-purple-400 via-violet-500 to-indigo-500',
      'from-blue-400 via-cyan-500 to-teal-500',
      'from-green-400 via-emerald-500 to-lime-500',
      'from-indigo-400 via-blue-500 to-cyan-500',
      'from-pink-400 via-rose-500 to-orange-500',
    ];

    const patternTypes = ['matrix', 'dots', 'waves', 'hexagon', 'circuit', 'organic'];
    const animationStyles = ['bounce', 'pulse', 'spin', 'float', 'swing', 'glow'];
    
    return {
      colorIndex: randomSeed % baseColors.length,
      gradientClass: baseColors[randomSeed % baseColors.length],
      patternType: patternTypes[Math.floor(seededRandom(randomSeed + 1) * patternTypes.length)],
      animationStyle: animationStyles[Math.floor(seededRandom(randomSeed + 2) * animationStyles.length)],
      triangleCount: 6 + Math.floor(seededRandom(randomSeed + 3) * 8), // 6-13 triangles
      particleCount: 8 + Math.floor(seededRandom(randomSeed + 4) * 12), // 8-19 particles
      shapeVariant: Math.floor(seededRandom(randomSeed + 5) * 4), // 0-3 shape variants
      glowIntensity: 0.3 + seededRandom(randomSeed + 6) * 0.4, // 0.3-0.7
      rotationDirection: seededRandom(randomSeed + 7) > 0.5 ? 1 : -1,
      pulseSpeed: 1.5 + seededRandom(randomSeed + 8) * 2, // 1.5-3.5s
      matrixDensity: 15 + Math.floor(seededRandom(randomSeed + 9) * 15), // 15-29 lines
    };
  }, [name, randomSeed]);

  const getDisplayText = (name: string) => {
    const words = name.trim().split(' ');
    if (words.length >= 2) {
      return words.slice(0, 3).map(word => word.charAt(0).toUpperCase()).join('');
    } else {
      return name.slice(0, Math.min(3, name.length)).toUpperCase();
    }
  };
  
  const displayText = getDisplayText(name);
  const textSize = displayText.length === 1 ? 'text-8xl' : displayText.length === 2 ? 'text-6xl' : 'text-5xl';

  // Generate unique background patterns
  const renderBackgroundPattern = () => {
    switch (courseData.patternType) {
      case 'matrix':
        return (
          <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-700">
            {[...Array(courseData.matrixDensity)].map((_, i) => (
              <div key={`v-${i}`} className="absolute w-px bg-white/30 animate-pulse"
                style={{
                  left: `${(i * (100 / courseData.matrixDensity)) + seededRandom(randomSeed + i * 10) * 5}%`,
                  height: '100%',
                  animationDelay: `${seededRandom(randomSeed + i) * 2}s`,
                  animationDuration: `${courseData.pulseSpeed + seededRandom(randomSeed + i + 50) * 1.5}s`
                }}
              />
            ))}
            {[...Array(Math.floor(courseData.matrixDensity * 0.7))].map((_, i) => (
              <div key={`h-${i}`} className="absolute h-px bg-white/20 animate-pulse"
                style={{
                  top: `${(i * (100 / Math.floor(courseData.matrixDensity * 0.7))) + seededRandom(randomSeed + i * 20) * 8}%`,
                  width: '100%',
                  animationDelay: `${seededRandom(randomSeed + i + 100) * 3}s`,
                  animationDuration: `${courseData.pulseSpeed + seededRandom(randomSeed + i + 150) * 2}s`
                }}
              />
            ))}
          </div>
        );
      
      case 'dots':
        return (
          <div className="absolute inset-0 opacity-15 group-hover:opacity-25 transition-opacity duration-700">
            {[...Array(25)].map((_, i) => (
              <div key={i} className="absolute w-2 h-2 bg-white/30 rounded-full animate-pulse"
                style={{
                  left: `${seededRandom(randomSeed + i * 30) * 90 + 5}%`,
                  top: `${seededRandom(randomSeed + i * 31) * 90 + 5}%`,
                  animationDelay: `${seededRandom(randomSeed + i + 200) * 4}s`,
                  animationDuration: `${courseData.pulseSpeed + seededRandom(randomSeed + i + 250) * 2}s`,
                  transform: `scale(${0.5 + seededRandom(randomSeed + i + 300) * 1.5})`
                }}
              />
            ))}
          </div>
        );
      
      case 'waves':
        return (
          <div className="absolute inset-0 opacity-12 group-hover:opacity-22 transition-opacity duration-700">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="absolute w-full h-px bg-white/25"
                style={{
                  top: `${12.5 * i}%`,
                  transform: `translateY(${Math.sin(i * 0.5) * 10}px)`,
                  animation: `wave-${i} ${3 + seededRandom(randomSeed + i) * 2}s ease-in-out infinite`,
                  animationDelay: `${seededRandom(randomSeed + i + 400) * 2}s`
                }}
              />
            ))}
          </div>
        );
      
      case 'hexagon':
        return (
          <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-700">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="absolute bg-white/20 animate-pulse"
                style={{
                  width: `${8 + seededRandom(randomSeed + i * 40) * 12}px`,
                  height: `${8 + seededRandom(randomSeed + i * 41) * 12}px`,
                  left: `${seededRandom(randomSeed + i * 42) * 85 + 5}%`,
                  top: `${seededRandom(randomSeed + i * 43) * 85 + 5}%`,
                  clipPath: 'polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%)',
                  transform: `rotate(${seededRandom(randomSeed + i * 44) * 360}deg)`,
                  animationDelay: `${seededRandom(randomSeed + i + 500) * 3}s`,
                  animationDuration: `${courseData.pulseSpeed + seededRandom(randomSeed + i + 550) * 2.5}s`
                }}
              />
            ))}
          </div>
        );
      
      case 'circuit':
        return (
          <div className="absolute inset-0 opacity-8 group-hover:opacity-18 transition-opacity duration-700">
            {[...Array(15)].map((_, i) => (
              <div key={`circuit-${i}`}>
                <div className="absolute w-px bg-white/30 animate-pulse"
                  style={{
                    left: `${seededRandom(randomSeed + i * 60) * 80 + 10}%`,
                    top: `${seededRandom(randomSeed + i * 61) * 60 + 20}%`,
                    height: `${20 + seededRandom(randomSeed + i * 62) * 40}px`,
                    animationDelay: `${seededRandom(randomSeed + i + 600) * 2}s`
                  }}
                />
                <div className="absolute h-px bg-white/30 animate-pulse"
                  style={{
                    left: `${seededRandom(randomSeed + i * 63) * 60 + 20}%`,
                    top: `${seededRandom(randomSeed + i * 64) * 80 + 10}%`,
                    width: `${20 + seededRandom(randomSeed + i * 65) * 40}px`,
                    animationDelay: `${seededRandom(randomSeed + i + 650) * 2.5}s`
                  }}
                />
                <div className="absolute w-2 h-2 bg-white/40 rounded-full animate-pulse"
                  style={{
                    left: `${seededRandom(randomSeed + i * 66) * 90 + 5}%`,
                    top: `${seededRandom(randomSeed + i * 67) * 90 + 5}%`,
                    animationDelay: `${seededRandom(randomSeed + i + 700) * 3}s`
                  }}
                />
              </div>
            ))}
          </div>
        );
      
      default: // organic
        return (
          <div className="absolute inset-0 opacity-12 group-hover:opacity-22 transition-opacity duration-700">
            {[...Array(20)].map((_, i) => (
              <div key={i} className="absolute bg-white/20 rounded-full animate-pulse"
                style={{
                  width: `${3 + seededRandom(randomSeed + i * 70) * 15}px`,
                  height: `${3 + seededRandom(randomSeed + i * 71) * 15}px`,
                  left: `${seededRandom(randomSeed + i * 72) * 90 + 5}%`,
                  top: `${seededRandom(randomSeed + i * 73) * 90 + 5}%`,
                  transform: `scale(${0.3 + seededRandom(randomSeed + i * 74) * 1.2})`,
                  animationDelay: `${seededRandom(randomSeed + i + 800) * 4}s`,
                  animationDuration: `${courseData.pulseSpeed + seededRandom(randomSeed + i + 850) * 3}s`
                }}
              />
            ))}
          </div>
        );
    }
  };

  // Generate unique triangles
  const renderTriangles = () => {
    return (
      <div className="absolute inset-0 opacity-30">
        {[...Array(courseData.triangleCount)].map((_, i) => {
          const size = 3 + seededRandom(randomSeed + i * 80) * 10; // 3-13px
          const opacity = 0.4 + seededRandom(randomSeed + i * 81) * 0.4; // 0.4-0.8
          const rotation = seededRandom(randomSeed + i * 82) * 360;
          const x = seededRandom(randomSeed + i * 83) * 85 + 5;
          const y = seededRandom(randomSeed + i * 84) * 85 + 5;
          const delay = seededRandom(randomSeed + i * 85) * 2;
          const duration = 1.5 + seededRandom(randomSeed + i * 86) * 2.5;
          const moveX = (seededRandom(randomSeed + i * 87) - 0.5) * 20;
          const moveY = (seededRandom(randomSeed + i * 88) - 0.5) * 20;
          const finalRotation = rotation + (seededRandom(randomSeed + i * 89) - 0.5) * 180;

          return (
            <div key={i} 
              className="absolute opacity-0 group-hover:opacity-100 transition-all duration-1000"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                transitionDelay: `${delay * 100}ms`,
                transform: `translate(${moveX}px, ${moveY}px) rotate(${finalRotation}deg)`
              }}
            >
              <div 
                className={`w-0 h-0 border-l-transparent border-r-transparent border-b-white animate-${courseData.animationStyle}`}
                style={{ 
                  borderLeftWidth: `${size}px`,
                  borderRightWidth: `${size}px`,
                  borderBottomWidth: `${size * 1.6}px`,
                  borderBottomColor: `rgba(255, 255, 255, ${opacity})`,
                  filter: `drop-shadow(${seededRandom(randomSeed + i * 90) * 4}px ${seededRandom(randomSeed + i * 91) * 6}px ${8 + seededRandom(randomSeed + i * 92) * 8}px rgba(0,0,0,0.4)) drop-shadow(0 0 ${10 + seededRandom(randomSeed + i * 93) * 15}px rgba(255,255,255,${opacity * 0.5}))`,
                  animationDelay: `${delay}s`,
                  animationDuration: `${duration}s`,
                  transformStyle: 'preserve-3d',
                  transform: `translateZ(${5 + seededRandom(randomSeed + i * 94) * 25}px) rotateX(${seededRandom(randomSeed + i * 95) * 40 - 20}deg) rotateY(${seededRandom(randomSeed + i * 96) * 40 - 20}deg)`
                }}
              />
            </div>
          );
        })}
      </div>
    );
  };

  // Generate unique geometric shapes
  const renderGeometricShapes = () => {
    const shapes = ['cube', 'diamond', 'hexagon', 'star'];
    return (
      <div className="absolute inset-0 opacity-25">
        {[...Array(6 + courseData.shapeVariant * 2)].map((_, i) => {
          const shapeType = shapes[Math.floor(seededRandom(randomSeed + i * 100) * shapes.length)];
          const size = 4 + seededRandom(randomSeed + i * 101) * 8;
          const x = seededRandom(randomSeed + i * 102) * 80 + 10;
          const y = seededRandom(randomSeed + i * 103) * 80 + 10;
          const rotation = seededRandom(randomSeed + i * 104) * 360;
          const animDuration = 8 + seededRandom(randomSeed + i * 105) * 12;
          const scale = 1 + seededRandom(randomSeed + i * 106) * 0.8;

          const getShapeStyle = () => {
            switch (shapeType) {
              case 'diamond':
                return { clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' };
              case 'hexagon':
                return { clipPath: 'polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%)' };
              case 'star':
                return { clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' };
              default: // cube
                return {};
            }
          };

          return (
            <div key={`shape-${i}`} 
              className="absolute bg-white/30 animate-spin transform group-hover:scale-150 transition-all duration-1500"
              style={{
                width: `${size}px`,
                height: `${size}px`,
                left: `${x}%`,
                top: `${y}%`,
                transform: `rotate(${rotation}deg) scale(${scale})`,
                animationDuration: `${animDuration}s`,
                animationDirection: courseData.rotationDirection > 0 ? 'normal' : 'reverse',
                filter: `drop-shadow(${seededRandom(randomSeed + i * 107) * 4}px ${seededRandom(randomSeed + i * 108) * 4}px ${6 + seededRandom(randomSeed + i * 109) * 8}px rgba(0,0,0,0.5)) drop-shadow(0 0 ${8 + seededRandom(randomSeed + i * 110) * 12}px rgba(255,255,255,0.3))`,
                transformStyle: 'preserve-3d',
                ...getShapeStyle()
              }}
            />
          );
        })}
      </div>
    );
  };

  // Generate unique floating particles
  const renderFloatingParticles = () => {
    return (
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000">
        {[...Array(courseData.particleCount)].map((_, i) => {
          const size = 1 + seededRandom(randomSeed + i * 120) * 4;
          const x = seededRandom(randomSeed + i * 121) * 90 + 5;
          const y = seededRandom(randomSeed + i * 122) * 90 + 5;
          const delay = seededRandom(randomSeed + i * 123) * 3;
          const duration = 1 + seededRandom(randomSeed + i * 124) * 2.5;
          const moveX = (seededRandom(randomSeed + i * 125) - 0.5) * 30;
          const moveY = (seededRandom(randomSeed + i * 126) - 0.5) * 30;
          const opacity = 0.3 + seededRandom(randomSeed + i * 127) * 0.4;

          return (
            <div
              key={`particle-${i}`}
              className="absolute bg-white rounded-full animate-bounce transform transition-all duration-1200"
              style={{
                width: `${size}px`,
                height: `${size}px`,
                left: `${x}%`,
                top: `${y}%`,
                opacity: opacity,
                animationDelay: `${delay}s`,
                animationDuration: `${duration}s`,
                filter: `drop-shadow(1px 2px 4px rgba(0,0,0,0.3))`,
                transform: `translateZ(${seededRandom(randomSeed + i * 128) * 15}px) translate(${moveX}px, ${moveY}px)`
              }}
            />
          );
        })}
      </div>
    );
  };

  // Generate unique pulsing rings
  const renderPulsingRings = () => {
    const ringCount = 2 + Math.floor(seededRandom(randomSeed + 200) * 3); // 2-4 rings
    return (
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        {[...Array(ringCount)].map((_, i) => {
          const size = 32 + i * 16 + seededRandom(randomSeed + i * 130) * 20;
          const delay = i * 800 + seededRandom(randomSeed + i * 131) * 500;
          const opacity = (0.15 - i * 0.03) * courseData.glowIntensity;
          
          return (
            <div key={`ring-${i}`}
              className="absolute bg-white rounded-full animate-ping"
              style={{ 
                width: `${size}px`,
                height: `${size}px`,
                backgroundColor: `rgba(255, 255, 255, ${opacity})`,
                animationDelay: `${delay}ms`,
                animationDuration: `${courseData.pulseSpeed + i * 0.5}s`,
                filter: `drop-shadow(0 0 ${20 + i * 10}px rgba(255,255,255,${opacity * 2})) drop-shadow(0 0 ${40 + i * 20}px rgba(255,255,255,${opacity}))`,
                transformStyle: 'preserve-3d',
                transform: `translateZ(${5 + i * 3}px)`
              }}
            />
          );
        })}
      </div>
    );
  };

  // Generate unique corner effects
  const renderCornerEffects = () => {
    const corners = [
      { position: 'top-3 left-3', gradient: 'from-white/40 to-transparent', direction: 'br' },
      { position: 'top-3 right-3', gradient: 'from-white/35 to-transparent', direction: 'bl' },
      { position: 'bottom-3 left-3', gradient: 'from-white/30 to-transparent', direction: 'tr' },
      { position: 'bottom-3 right-3', gradient: 'from-white/25 to-transparent', direction: 'tl' }
    ];

    return corners.map((corner, i) => {
      const size = 8 + seededRandom(randomSeed + i * 140) * 8;
      const delay = seededRandom(randomSeed + i * 141) * 600;
      const scale = 1.1 + seededRandom(randomSeed + i * 142) * 0.4;
      
      return (
        <div key={`corner-${i}`}
          className={`absolute ${corner.position} bg-gradient-to-${corner.direction} ${corner.gradient} rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700 transform group-hover:scale-${Math.floor(scale * 100)}`}
          style={{
            width: `${size}px`,
            height: `${size}px`,
            transitionDelay: `${delay}ms`,
            filter: `drop-shadow(${seededRandom(randomSeed + i * 143) * 4 - 2}px ${seededRandom(randomSeed + i * 144) * 4 - 2}px 8px rgba(0,0,0,0.4)) drop-shadow(0 0 12px rgba(255,255,255,0.3))`
          }}
        />
      );
    });
  };

  return (
    <div 
      className={`w-full h-48 bg-gradient-to-br ${courseData.gradientClass} rounded-xl flex items-center justify-center shadow-2xl relative overflow-hidden group transition-all duration-700 hover:shadow-3xl cursor-pointer hover:scale-[1.02]`}
      style={{
        transform: `rotate(${seededRandom(randomSeed + 300) * 2 - 1}deg)`,
        boxShadow: `0 25px 50px rgba(0,0,0,0.5), inset 0 2px 0 rgba(255,255,255,0.3), 0 0 0 1px rgba(255,255,255,0.1), 0 0 ${20 + courseData.glowIntensity * 30}px rgba(255,255,255,${courseData.glowIntensity * 0.2})`
      }}
    >
      {/* Dynamic Background Pattern */}
      {renderBackgroundPattern()}

      {/* Unique Triangles */}
      {renderTriangles()}

      {/* Unique Geometric Shapes */}
      {renderGeometricShapes()}

      {/* Unique Pulsing Rings */}
      {renderPulsingRings()}

      {/* Unique Floating Particles */}
      {renderFloatingParticles()}
      
      {/* Enhanced 3D Text with Course-Specific Styling */}
      <div className="relative z-20 flex items-center justify-center">
        <div className="relative transform-gpu">
          {/* Multi-layer Text Glow */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`${textSize} font-black text-white blur-xl transform scale-125`}
              style={{ opacity: courseData.glowIntensity }}>
              {displayText}
            </span>
          </div>
          
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`${textSize} font-black text-white blur-2xl transform scale-150`}
              style={{ opacity: courseData.glowIntensity * 0.7 }}>
              {displayText}
            </span>
          </div>
          
          {/* Main 3D Text */}
          <span 
            className={`${textSize} font-black text-black relative z-10 transform transition-all duration-700 group-hover:scale-125 tracking-wider`}
            style={{
              textShadow: `
                0 ${4 + seededRandom(randomSeed + 401) * 4}px ${8 + seededRandom(randomSeed + 402) * 8}px rgba(0,0,0,0.5),
                0 ${2 + seededRandom(randomSeed + 403) * 2}px ${4 + seededRandom(randomSeed + 404) * 4}px rgba(0,0,0,0.4),
                0 ${8 + seededRandom(randomSeed + 405) * 8}px ${16 + seededRandom(randomSeed + 406) * 16}px rgba(0,0,0,0.3),
                0 0 ${20 + seededRandom(randomSeed + 407) * 20}px rgba(255,255,255,${courseData.glowIntensity}),
                ${(seededRandom(randomSeed + 408) - 0.5) * 3}px ${-(seededRandom(randomSeed + 409) - 0.5) * 3}px 0 rgba(0,0,0,0.2),
                ${(seededRandom(randomSeed + 410) - 0.5) * 6}px ${-(seededRandom(randomSeed + 411) - 0.5) * 6}px 0 rgba(0,0,0,0.1)
              `,
              filter: `drop-shadow(0 0 30px rgba(0,0,0,0.4)) drop-shadow(0 0 60px rgba(255,255,255,${courseData.glowIntensity * 0.3}))`,
              transformStyle: 'preserve-3d',
              transform: `perspective(800px) rotateX(${seededRandom(randomSeed + 412) * 16 - 8}deg) rotateY(${seededRandom(randomSeed + 413) * 16 - 8}deg) translateZ(30px)`
            }}
          >
            {displayText}
          </span>
          
          {/* Enhanced Reflection */}
          <div className="absolute top-full left-0 right-0 flex items-start justify-center opacity-30 transform scale-y-[-1] translate-y-4 perspective-[800px]">
            <span 
              className={`${textSize} font-black blur-sm transform rotate-x-[8deg]`}
              style={{
                background: `linear-gradient(to bottom, rgba(0,0,0,${0.3 + courseData.glowIntensity * 0.2}) 0%, transparent 60%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                color: 'transparent',
                filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.3))',
                transformStyle: 'preserve-3d',
                transform: 'translateZ(15px)'
              }}
            >
              {displayText}
            </span>
          </div>
        </div>
      </div>
      
      {/* Multiple Dynamic Overlay Layers */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-white/30 rounded-xl"
        style={{ opacity: 0.8 + courseData.glowIntensity * 0.2 }}></div>
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent rounded-xl"
        style={{ opacity: courseData.glowIntensity }}></div>
      <div className="absolute inset-0 bg-gradient-to-tl from-black/20 via-transparent to-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"
        style={{ opacity: courseData.glowIntensity * 0.8 }}></div>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ 
          transform: `rotate(${seededRandom(randomSeed + 500) * 10 - 5}deg)`,
          opacity: courseData.glowIntensity * 0.6 
        }}></div>
      
      {/* Dynamic Shine Effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1500 ease-in-out"
           style={{ 
             filter: `drop-shadow(0 0 25px rgba(255,255,255,${courseData.glowIntensity}))`,
             animationDelay: `${seededRandom(randomSeed + 501) * 500}ms`
           }}></div>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -skew-x-6 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1200 ease-in-out delay-200"
           style={{ 
             filter: `drop-shadow(0 0 15px rgba(255,255,255,${courseData.glowIntensity * 0.6}))`,
             transform: `skewX(${-6 + seededRandom(randomSeed + 502) * 4}deg)`
           }}></div>
      
      {/* Additional Unique 3D Depth Layers */}
      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-40 transition-opacity duration-1000"
           style={{
             background: `radial-gradient(circle at ${25 + seededRandom(randomSeed + 503) * 50}% ${25 + seededRandom(randomSeed + 504) * 50}%, rgba(255,255,255,${courseData.glowIntensity * 0.3}) 0%, transparent 40%)`,
             filter: `blur(${20 + seededRandom(randomSeed + 505) * 15}px)`
           }}></div>
      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-30 transition-opacity duration-1200 delay-200"
           style={{
             background: `radial-gradient(circle at ${75 - seededRandom(randomSeed + 506) * 50}% ${75 - seededRandom(randomSeed + 507) * 50}%, rgba(255,255,255,${courseData.glowIntensity * 0.2}) 0%, transparent 50%)`,
             filter: `blur(${25 + seededRandom(randomSeed + 508) * 20}px)`
           }}></div>
      
      {/* Dynamic Inner Shadow for Enhanced Depth */}
      <div className="absolute inset-0 rounded-xl"
           style={{
             boxShadow: `inset 0 ${2 + seededRandom(randomSeed + 509) * 4}px ${4 + seededRandom(randomSeed + 510) * 8}px rgba(0,0,0,${0.1 + courseData.glowIntensity * 0.1}), inset 0 ${-2 - seededRandom(randomSeed + 511) * 4}px ${4 + seededRandom(randomSeed + 512) * 8}px rgba(255,255,255,${0.1 + courseData.glowIntensity * 0.1})`
           }}></div>

      {/* Unique Floating Elements Based on Course */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-800">
        {/* Dynamic Stars */}
        {[...Array(Math.floor(courseData.glowIntensity * 10))].map((_, i) => (
          <div key={`star-${i}`} 
            className="absolute animate-pulse"
            style={{
              left: `${seededRandom(randomSeed + i * 600) * 85 + 5}%`,
              top: `${seededRandom(randomSeed + i * 601) * 85 + 5}%`,
              fontSize: `${8 + seededRandom(randomSeed + i * 602) * 8}px`,
              color: `rgba(255, 255, 255, ${0.4 + seededRandom(randomSeed + i * 603) * 0.4})`,
              animationDelay: `${seededRandom(randomSeed + i * 604) * 2}s`,
              animationDuration: `${1.5 + seededRandom(randomSeed + i * 605) * 2}s`,
              filter: `drop-shadow(0 0 ${4 + seededRandom(randomSeed + i * 606) * 6}px rgba(255,255,255,0.5))`
            }}
          >
            ✦
          </div>
        ))}

        {/* Dynamic Lightning Bolts */}
        {courseData.shapeVariant > 1 && [...Array(3)].map((_, i) => (
          <div key={`lightning-${i}`} 
            className="absolute animate-pulse"
            style={{
              left: `${seededRandom(randomSeed + i * 700) * 80 + 10}%`,
              top: `${seededRandom(randomSeed + i * 701) * 80 + 10}%`,
              fontSize: `${10 + seededRandom(randomSeed + i * 702) * 6}px`,
              color: `rgba(255, 255, 255, ${0.3 + seededRandom(randomSeed + i * 703) * 0.3})`,
              transform: `rotate(${seededRandom(randomSeed + i * 704) * 360}deg)`,
              animationDelay: `${seededRandom(randomSeed + i * 705) * 3}s`,
              animationDuration: `${2 + seededRandom(randomSeed + i * 706) * 2}s`,
              filter: `drop-shadow(0 0 8px rgba(255,255,255,0.4))`
            }}
          >
            ⚡
          </div>
        ))}

        {/* Dynamic Sparkles */}
        {courseData.animationStyle === 'glow' && [...Array(8)].map((_, i) => (
          <div key={`sparkle-${i}`} 
            className="absolute animate-bounce"
            style={{
              left: `${seededRandom(randomSeed + i * 800) * 90 + 5}%`,
              top: `${seededRandom(randomSeed + i * 801) * 90 + 5}%`,
              fontSize: `${6 + seededRandom(randomSeed + i * 802) * 4}px`,
              color: `rgba(255, 255, 255, ${0.5 + seededRandom(randomSeed + i * 803) * 0.3})`,
              animationDelay: `${seededRandom(randomSeed + i * 804) * 2.5}s`,
              animationDuration: `${1 + seededRandom(randomSeed + i * 805) * 1.5}s`,
              filter: `drop-shadow(0 0 6px rgba(255,255,255,0.6))`
            }}
          >
            ✨
          </div>
        ))}
      </div>

      {/* Course-Specific Border Animations */}
      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700">
        <div className="absolute inset-0 rounded-xl border-2 animate-pulse"
             style={{ 
               borderColor: `rgba(255, 255, 255, ${0.3 + courseData.glowIntensity * 0.2})`,
               filter: `drop-shadow(0 0 ${15 + courseData.glowIntensity * 15}px rgba(255,255,255,${courseData.glowIntensity * 0.4})) drop-shadow(inset 0 0 20px rgba(255,255,255,0.2))`,
               animationDuration: `${courseData.pulseSpeed}s`
             }}></div>
        <div className="absolute inset-1 rounded-xl border animate-pulse delay-300"
             style={{ 
               borderColor: `rgba(255, 255, 255, ${0.2 + courseData.glowIntensity * 0.15})`,
               filter: `drop-shadow(0 0 ${8 + courseData.glowIntensity * 8}px rgba(255,255,255,${courseData.glowIntensity * 0.3}))`,
               animationDuration: `${courseData.pulseSpeed + 0.5}s`
             }}></div>
        <div className="absolute inset-2 rounded-xl border animate-pulse delay-600"
             style={{ 
               borderColor: `rgba(255, 255, 255, ${0.15 + courseData.glowIntensity * 0.1})`,
               filter: `drop-shadow(0 0 ${5 + courseData.glowIntensity * 5}px rgba(255,255,255,${courseData.glowIntensity * 0.2}))`,
               animationDuration: `${courseData.pulseSpeed + 1}s`
             }}></div>
      </div>

      {/* Dynamic Noise Texture Overlay */}
      <div className="absolute inset-0 rounded-xl opacity-5 group-hover:opacity-10 transition-opacity duration-500"
           style={{
             backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='${0.65 + seededRandom(randomSeed + 900) * 0.3}' numOctaves='${3 + Math.floor(seededRandom(randomSeed + 901) * 2)}' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.4'/%3E%3C/svg%3E")`,
             mixBlendMode: 'overlay'
           }}></div>

      {/* Unique Gradient Overlays Based on Course */}
      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-1000"
           style={{
             background: courseData.colorIndex % 2 === 0 
               ? `conic-gradient(from ${seededRandom(randomSeed + 950) * 360}deg, rgba(255,255,255,0.1) 0deg, transparent 60deg, rgba(255,255,255,0.05) 120deg, transparent 180deg, rgba(255,255,255,0.08) 240deg, transparent 300deg)`
               : `radial-gradient(ellipse at ${30 + seededRandom(randomSeed + 951) * 40}% ${30 + seededRandom(randomSeed + 952) * 40}%, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 30%, transparent 70%)`
           }}></div>
    </div>
  );
};

export default GeneratedThumbnail;