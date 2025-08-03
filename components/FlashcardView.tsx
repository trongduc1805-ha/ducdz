import React, { useState, useEffect, useMemo } from 'react';
import { VocabularyItem } from '../types';
import { ArrowLeftIcon, ChevronLeftIcon, ChevronRightIcon } from './icons';

interface FlashcardViewProps {
  vocabulary: VocabularyItem[];
  onBack: () => void;
}

const FlashcardView = ({ vocabulary, onBack }: FlashcardViewProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const shuffledVocabulary = useMemo(() => {
    return [...vocabulary].sort(() => Math.random() - 0.5);
  }, [vocabulary]);

  const currentCard = shuffledVocabulary[currentIndex];

  useEffect(() => {
    setIsFlipped(false);
  }, [currentIndex]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % shuffledVocabulary.length);
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + shuffledVocabulary.length) % shuffledVocabulary.length);
  };

  if (shuffledVocabulary.length === 0) {
    return (
      <div className="h-screen flex flex-col bg-gradient-to-br from-black via-gray-900 to-black text-gray-300">
        <header className="bg-black/90 backdrop-blur-lg p-4 px-8 flex items-center z-20 shrink-0 border-b border-yellow-500/30 shadow-lg">
          <button onClick={onBack} className="flex items-center gap-3 font-semibold text-yellow-300 hover:text-yellow-200 transition-colors duration-300">
            <ArrowLeftIcon className="w-6 h-6"/>
            <span>Back</span>
          </button>
        </header>
        
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl flex items-center justify-center border border-yellow-500/30">
              <span className="text-6xl text-yellow-400/50">#</span>
            </div>
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-400 mb-4 drop-shadow-lg">
              No Vocabulary Found
            </h2>
            <p className="text-gray-400 text-lg leading-relaxed">
              Add some vocabulary words from your courses to start practicing with flashcards.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 3D Card Styles
  const cardContainerStyle = {
    perspective: '1000px',
  };

  const cardStyle = {
    transformStyle: 'preserve-3d' as const,
    transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
    transition: 'transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  };

  const cardFrontStyle = {
    backfaceVisibility: 'hidden' as const,
  };

  const cardBackStyle = {
    backfaceVisibility: 'hidden' as const,
    transform: 'rotateY(180deg)',
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-black via-gray-900 to-black text-gray-300 overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-yellow-400/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-yellow-400/3 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <header className="bg-black/90 backdrop-blur-lg p-4 px-8 flex items-center z-20 shrink-0 border-b border-yellow-500/30 shadow-lg relative">
        <button onClick={onBack} className="flex items-center gap-3 font-semibold text-yellow-300 hover:text-yellow-200 transition-colors duration-300">
          <ArrowLeftIcon className="w-6 h-6"/>
          <span>Back</span>
        </button>
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-400 drop-shadow-lg">
            Flashcards
          </h1>
        </div>
      </header>
      
      <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 relative z-10 min-h-0">
        {/* Navigation Controls */}
        <div className="flex items-center justify-center space-x-4 md:space-x-8 w-full max-w-7xl">
          {/* Previous Button */}
          <button 
            onClick={handlePrevious} 
            className="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center rounded-full bg-gradient-to-br from-gray-800 to-gray-900 text-yellow-400 hover:from-gray-700 hover:to-gray-800 transition-all duration-300 shadow-2xl hover:shadow-yellow-500/30 transform hover:scale-110 border border-yellow-500/30 shrink-0"
          >
            <ChevronLeftIcon className="w-6 h-6 md:w-8 md:h-8"/>
          </button>

          {/* 3D Card Container - Made responsive and taller */}
          <div className="w-full max-w-4xl h-[500px] md:h-[600px]" style={cardContainerStyle}>
            <div 
              className="relative w-full h-full cursor-pointer transition-transform duration-300 hover:scale-105"
              style={cardStyle}
              onClick={() => setIsFlipped(!isFlipped)}
            >
              {/* Front of card */}
              <div 
                className="absolute inset-0 w-full h-full bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-2xl flex items-center justify-center p-6 md:p-8 border border-yellow-500/30 backdrop-blur-lg"
                style={{
                  ...cardFrontStyle,
                  boxShadow: '0 25px 50px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1), 0 0 30px rgba(251, 191, 36, 0.1)'
                }}
              >
                <div className="text-center relative">
                  <div className="absolute inset-0 bg-yellow-400/10 blur-3xl rounded-full -z-10"></div>
                  <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 mb-4 drop-shadow-2xl">
                    {currentCard.word}
                  </h2>
                  <div className="w-20 h-1 bg-gradient-to-r from-yellow-400 to-yellow-500 mx-auto rounded-full shadow-lg"></div>
                  <p className="text-gray-400 text-sm mt-6 animate-pulse">Click to reveal</p>
                </div>
              </div>
              
              {/* Back of card - Fixed height and scrollable */}
              <div 
                className="absolute inset-0 w-full h-full bg-gradient-to-br from-yellow-900/20 via-gray-900 to-black rounded-2xl flex flex-col border border-yellow-400/50 backdrop-blur-lg overflow-hidden"
                style={{
                  ...cardBackStyle,
                  boxShadow: '0 25px 50px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1), 0 0 30px rgba(251, 191, 36, 0.2)'
                }}
              >
                {/* Header section - Fixed */}
                <div className="p-6 md:p-8 text-center border-b border-yellow-500/30 shrink-0">
                  <h3 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-400 mb-3 drop-shadow-lg">
                    {currentCard.word}
                  </h3>
                  {currentCard.translation && (
                    <p className="text-xl md:text-2xl font-semibold text-yellow-100 drop-shadow-lg">
                      {currentCard.translation}
                    </p>
                  )}
                </div>
                
                {/* Content section - Scrollable */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 min-h-0">
                  <div className="flex items-start space-x-4 bg-gradient-to-r from-yellow-400/10 to-transparent p-4 md:p-6 rounded-lg">
                    <div className="w-3 h-3 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full mt-2 shrink-0 shadow-lg"></div>
                    <div className="min-w-0 flex-1">
                      <strong className="font-semibold text-yellow-300 block mb-2 text-lg">Pronunciation</strong>
                      <span className="font-mono text-yellow-200 text-base md:text-lg break-all">{currentCard.ipa}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4 bg-gradient-to-r from-yellow-400/10 to-transparent p-4 md:p-6 rounded-lg">
                    <div className="w-3 h-3 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full mt-2 shrink-0 shadow-lg"></div>
                    <div className="min-w-0 flex-1">
                      <strong className="font-semibold text-yellow-300 block mb-2 text-lg">Meaning</strong>
                      <span className="text-gray-200 leading-relaxed text-base md:text-lg break-words">{currentCard.meaning}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4 bg-gradient-to-r from-yellow-400/10 to-transparent p-4 md:p-6 rounded-lg">
                    <div className="w-3 h-3 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full mt-2 shrink-0 shadow-lg"></div>
                    <div className="min-w-0 flex-1">
                      <strong className="font-semibold text-yellow-300 block mb-2 text-lg">Example</strong>
                      <em className="italic text-gray-200 leading-relaxed text-base md:text-lg break-words">"{currentCard.example}"</em>
                    </div>
                  </div>
                  
                  {/* Spacer for better scrolling */}
                  <div className="h-4"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Next Button */}
          <button 
            onClick={handleNext} 
            className="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center rounded-full bg-gradient-to-br from-gray-800 to-gray-900 text-yellow-400 hover:from-gray-700 hover:to-gray-800 transition-all duration-300 shadow-2xl hover:shadow-yellow-500/30 transform hover:scale-110 border border-yellow-500/30 shrink-0"
          >
            <ChevronRightIcon className="w-6 h-6 md:w-8 md:h-8"/>
          </button>
        </div>
        
        {/* Progress and Instructions */}
        <div className="text-center mt-6 md:mt-10 shrink-0">
          <div className="bg-gradient-to-r from-gray-900/80 to-gray-800/80 backdrop-blur-lg rounded-2xl p-4 md:p-6 border border-yellow-500/20">
            <p className="text-yellow-300 font-semibold text-base md:text-lg mb-2">
              Card {currentIndex + 1} of {shuffledVocabulary.length}
            </p>
            <p className="text-gray-400 text-sm">
              Click the card to flip • Use arrow buttons to navigate
            </p>
            
            {/* Progress bar */}
            <div className="w-full bg-gray-700/50 rounded-full h-2 mt-4 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-2 rounded-full transition-all duration-500 shadow-lg"
                style={{ width: `${((currentIndex + 1) / shuffledVocabulary.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlashcardView;
