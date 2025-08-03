import React from 'react';
import { View } from '../types';
import Spinner from './Spinner';
import { CardStackIcon, BookOpenIcon, PlusIcon } from './icons';

interface HeaderProps {
  onNavigate: (view: View) => void;
  onAddCourse: () => void;
  loading: boolean;
}

const NavButton = ({ onClick, children, title }: { onClick: () => void, children: React.ReactNode, title: string }) => {
    return (
        <button 
          onClick={onClick} 
          title={title} 
          className="w-11 h-11 flex items-center justify-center rounded-xl text-yellow-400 hover:bg-gradient-to-r hover:from-yellow-400/20 hover:to-yellow-500/20 hover:text-yellow-300 transition-all duration-300 border border-transparent hover:border-yellow-500/30 shadow-lg hover:shadow-yellow-500/20 transform hover:scale-105"
        >
            {children}
        </button>
    )
}

const Header = ({ onNavigate, onAddCourse, loading }: HeaderProps) => {
  return (
    <header className="bg-black/90 backdrop-blur-lg p-4 px-6 flex justify-between items-center sticky top-0 z-40 border-b border-yellow-500/30 shadow-2xl relative overflow-hidden">
      {/* Animated background glow for header */}
      <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/3 via-transparent to-yellow-500/3 pointer-events-none animate-pulse"></div>
      
      <div className="flex items-center relative z-10">
        <div className="relative group cursor-pointer">
          {/* Multiple glow layers for enhanced effect */}
          <div className="absolute -inset-3 bg-yellow-400/25 blur-2xl rounded-full animate-pulse opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="absolute -inset-1 bg-yellow-300/15 blur-xl rounded-full animate-pulse delay-300"></div>
          
          {/* Main logo container */}
          <div className="relative flex items-center gap-2.5">
            {/* Logo icon - slightly smaller */}
            <div className="relative">
              {/* Icon glow effects */}
              <div className="absolute inset-0 bg-yellow-400/50 rounded-lg blur-md animate-pulse"></div>
              
              {/* Icon background */}
              <div className="relative w-12 h-12 bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-500 rounded-lg flex items-center justify-center shadow-xl transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 border border-yellow-300/50">
                {/* Inner highlight */}
                <div className="absolute inset-1 bg-gradient-to-br from-yellow-200/30 to-transparent rounded-md"></div>
                
                {/* Hash symbol */}
                <span className="text-2xl font-black text-black drop-shadow-lg relative z-10 transform group-hover:rotate-12 transition-transform duration-300">
                  #
                </span>
              </div>
            </div>
            
            {/* Text logo */}
            <div className="flex flex-col">
              {/* Main text - slightly smaller */}
              <div className="flex items-baseline">
                <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-amber-400 drop-shadow-xl transform group-hover:scale-105 transition-all duration-300 tracking-tight leading-none">
                  ducdz learn
                </h1>
              </div>
              
              {/* Enhanced subtitle */}
              <div className="flex items-center gap-1.5 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-8 h-0.5 bg-gradient-to-r from-yellow-400 to-transparent rounded-full"></div>
                <span className="text-xs font-semibold text-yellow-300/90 uppercase tracking-wider">
                  English
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <nav className="flex items-center space-x-3 relative z-10">
        <NavButton onClick={() => onNavigate(View.Flashcards)} title="Flash Cards">
            <CardStackIcon className="w-7 h-7" />
        </NavButton>
         <NavButton onClick={() => onNavigate(View.Vocabulary)} title="Vocabulary">
            <BookOpenIcon className="w-7 h-7" />
        </NavButton>

        <div className="w-px h-5 bg-yellow-500/30 mx-2"></div>

        {/* Optimized Add Course Button */}
        <button
          onClick={onAddCourse}
          disabled={loading}
          className="group relative flex items-center gap-2.5 font-semibold text-sm px-5 py-2.5 rounded-xl text-black bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-500 hover:from-yellow-300 hover:via-yellow-400 hover:to-amber-400 disabled:from-gray-400 disabled:via-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed transition-all duration-300 shadow-xl hover:shadow-yellow-500/30 transform hover:scale-105 hover:-translate-y-0.5 disabled:transform-none disabled:shadow-none border border-yellow-300/40 hover:border-yellow-200/60 overflow-hidden min-w-[120px]"
        >
          {/* Button glow effects */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-300/40 via-yellow-400/40 to-amber-400/40 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-200/15 via-yellow-300/15 to-amber-300/15 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          {/* Animated background shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -skew-x-12 transform -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"></div>
          
          <div className="relative z-10 flex items-center gap-2.5">
            {loading ? (
              <>
                <Spinner size="4" color="black" />
                <span className="font-semibold tracking-wide">Processing...</span>
              </>
            ) : (
              <>
                <PlusIcon className="w-5 h-5 transform group-hover:rotate-90 transition-transform duration-300" />
                <span className="font-semibold tracking-wide">Add Course</span>
              </>
            )}
          </div>
          
          {/* Subtle corner accents */}
          <div className="absolute top-0.5 left-0.5 w-2 h-2 border-l border-t border-yellow-200/50 rounded-tl-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="absolute bottom-0.5 right-0.5 w-2 h-2 border-r border-b border-yellow-200/50 rounded-br-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </button>
      </nav>
    </header>
  );
};

export default Header;
