import React, { useState, useMemo } from 'react';
import { VocabularyItem } from '../types';
import { ArrowLeftIcon, SearchIcon, BookOpenIcon } from './icons';

interface VocabularyViewProps {
  vocabulary: VocabularyItem[];
  onBack: () => void;
}

const VocabularyView = ({ vocabulary, onBack }: VocabularyViewProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredVocabulary = useMemo(() => {
    if (!searchTerm) {
      return vocabulary;
    }
    const lowercasedTerm = searchTerm.toLowerCase();
    return vocabulary.filter(item =>
      item.word.toLowerCase().includes(lowercasedTerm) ||
      item.meaning.toLowerCase().includes(lowercasedTerm) ||
      (item.translation && item.translation.toLowerCase().includes(lowercasedTerm)) ||
      item.example.toLowerCase().includes(lowercasedTerm)
    );
  }, [vocabulary, searchTerm]);

  const stats = useMemo(() => {
    return {
      total: vocabulary.length,
      filtered: filteredVocabulary.length
    };
  }, [vocabulary.length, filteredVocabulary.length]);

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-black via-gray-900 to-black text-gray-300 relative">
      {/* Fixed Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-20 left-10 w-64 h-64 bg-yellow-400/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-yellow-400/3 rounded-full blur-3xl animate-pulse delay-500"></div>
        
        {/* Additional background pattern for long scrolling */}
        <div className="absolute top-[150%] left-20 w-80 h-80 bg-yellow-400/4 rounded-full blur-3xl animate-pulse delay-700"></div>
        <div className="absolute top-[200%] right-20 w-64 h-64 bg-yellow-500/4 rounded-full blur-3xl animate-pulse delay-1500"></div>
        <div className="absolute top-[300%] left-1/3 w-96 h-96 bg-yellow-400/3 rounded-full blur-3xl animate-pulse delay-2000"></div>
        <div className="absolute top-[400%] right-1/3 w-72 h-72 bg-yellow-500/4 rounded-full blur-3xl animate-pulse delay-2500"></div>
      </div>

      {/* Gradient overlay to ensure consistent background */}
      <div className="fixed inset-0 bg-gradient-to-br from-black/80 via-gray-900/80 to-black/80 pointer-events-none z-0"></div>

      <header className="bg-black/90 backdrop-blur-lg p-4 px-8 flex items-center justify-between z-20 shrink-0 border-b border-yellow-500/30 shadow-lg relative">
        <div className="flex items-center gap-6">
          <button onClick={onBack} className="flex items-center gap-3 font-semibold text-yellow-300 hover:text-yellow-200 transition-colors duration-300">
            <ArrowLeftIcon className="w-6 h-6"/>
            <span>Back</span>
          </button>
          <div className="w-px h-6 bg-yellow-500/30"></div>
          <div className="flex items-center gap-3">
            <BookOpenIcon className="w-6 h-6 text-yellow-400" />
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-400 drop-shadow-lg">
              Vocabulary
            </h1>
          </div>
        </div>
        
        <div className="text-right">
          <p className="text-yellow-300 font-semibold">
            {searchTerm ? `${stats.filtered} of ${stats.total}` : `${stats.total} words`}
          </p>
        </div>
      </header>

      <div className="flex-1 flex flex-col p-6 md:p-8 relative z-10 min-h-0">
        {/* Search Bar */}
        <div className="mb-8 shrink-0">
          <div className="relative max-w-2xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <SearchIcon className="w-6 h-6 text-yellow-400" />
            </div>
            <input
              type="text"
              placeholder="Search vocabulary..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-gradient-to-r from-gray-900/80 to-gray-800/80 backdrop-blur-lg border border-yellow-500/30 rounded-2xl text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/50 transition-all duration-300 text-lg shadow-2xl"
            />
          </div>
        </div>

        {/* Vocabulary List */}
        <div className="flex-1 min-h-0 relative">
          {filteredVocabulary.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-md">
                {vocabulary.length === 0 ? (
                  <>
                    <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl flex items-center justify-center border border-yellow-500/30">
                      <BookOpenIcon className="w-16 h-16 text-yellow-400/50" />
                    </div>
                    <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-400 mb-4 drop-shadow-lg">
                      No Vocabulary Yet
                    </h2>
                    <p className="text-gray-400 text-lg leading-relaxed">
                      Start learning from your courses to build your vocabulary collection.
                    </p>
                  </>
                ) : (
                  <>
                    <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl flex items-center justify-center border border-yellow-500/30">
                      <SearchIcon className="w-16 h-16 text-yellow-400/50" />
                    </div>
                    <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-400 mb-4 drop-shadow-lg">
                      No Results Found
                    </h2>
                    <p className="text-gray-400 text-lg leading-relaxed">
                      No vocabulary matches your search term "{searchTerm}".
                    </p>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full overflow-y-auto scrollbar-thin scrollbar-track-gray-800 scrollbar-thumb-yellow-500/50 hover:scrollbar-thumb-yellow-500/70">
              <div className="grid gap-6 max-w-6xl mx-auto pb-8">
                {filteredVocabulary.map((item, index) => (
                  <div
                    key={`${item.word}-${index}`}
                    className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-lg rounded-2xl p-8 border border-yellow-500/20 shadow-2xl hover:shadow-yellow-500/10 transition-all duration-300 hover:scale-[1.02] hover:border-yellow-500/40 relative"
                  >
                    {/* Card background overlay for consistency */}
                    <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-gray-900/20 to-black/20 rounded-2xl pointer-events-none"></div>
                    
                    <div className="flex flex-col lg:flex-row lg:items-start gap-6 relative z-10">
                      {/* Word and Pronunciation */}
                      <div className="lg:w-1/3">
                        <div className="text-center lg:text-left">
                          <h3 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-400 mb-3 drop-shadow-lg">
                            {item.word}
                          </h3>
                          <div className="flex items-center justify-center lg:justify-start gap-3 mb-4">
                            <div className="w-2 h-2 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full"></div>
                            <span className="font-mono text-yellow-200 text-lg">
                              {item.ipa}
                            </span>
                          </div>
                          {item.translation && (
                            <p className="text-2xl font-semibold text-yellow-100 drop-shadow-lg">
                              {item.translation}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Meaning and Example */}
                      <div className="lg:w-2/3 space-y-6">
                        <div className="bg-gradient-to-r from-yellow-400/10 to-transparent p-6 rounded-xl border-l-4 border-yellow-400/50">
                          <h4 className="font-semibold text-yellow-300 text-lg mb-3">Meaning</h4>
                          <p className="text-gray-200 text-lg leading-relaxed">
                            {item.meaning}
                          </p>
                        </div>

                        <div className="bg-gradient-to-r from-yellow-400/10 to-transparent p-6 rounded-xl border-l-4 border-yellow-400/50">
                          <h4 className="font-semibold text-yellow-300 text-lg mb-3">Example</h4>
                          <p className="text-gray-200 text-lg leading-relaxed italic">
                            "{item.example}"
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Spacer for better scrolling experience */}
                <div className="h-20"></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VocabularyView;
