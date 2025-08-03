import React from 'react';
import { Course } from '../types';
import { PlayIcon } from './icons';
import GeneratedThumbnail from './GeneratedThumbnail';

const CourseCard = ({ course, onSelectCourse }: { course: Course; onSelectCourse: (course: Course) => void; }) => {
  return (
    <div 
      className="group relative bg-gradient-to-br from-gray-900/90 to-black/95 p-6 rounded-2xl transition-all duration-500 cursor-pointer border border-yellow-500/20 backdrop-blur-lg shadow-2xl hover:shadow-yellow-500/25 hover:border-yellow-400/40 hover:scale-105 transform-gpu perspective-1000 overflow-hidden"
      onClick={() => onSelectCourse(course)}
      style={{
        transformStyle: 'preserve-3d',
        boxShadow: '0 20px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)'
      }}
    >
      {/* 3D Floating Triangles - Only appear on hover */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Triangle 1 - Top Left */}
        <div className="absolute top-8 left-8 opacity-0 group-hover:opacity-100 transition-all duration-700 transform group-hover:translate-x-3 group-hover:-translate-y-2 group-hover:rotate-12">
          <div 
            className="w-0 h-0 border-l-6 border-r-6 border-b-10 border-l-transparent border-r-transparent border-b-yellow-400/60 animate-bounce"
            style={{ 
              filter: 'drop-shadow(2px 4px 8px rgba(251, 191, 36, 0.3)) drop-shadow(0 0 10px rgba(251, 191, 36, 0.2))',
              animationDelay: '0.2s',
              animationDuration: '2s',
              transformStyle: 'preserve-3d',
              transform: 'translateZ(15px) rotateX(10deg)'
            }}
          />
        </div>
        
        {/* Triangle 2 - Top Right */}
        <div className="absolute top-12 right-10 opacity-0 group-hover:opacity-100 transition-all duration-800 delay-150 transform group-hover:-translate-x-4 group-hover:translate-y-1 group-hover:-rotate-20">
          <div 
            className="w-0 h-0 border-l-8 border-r-8 border-b-12 border-l-transparent border-r-transparent border-b-yellow-300/50 animate-pulse transform rotate-180"
            style={{ 
              filter: 'drop-shadow(-2px -4px 10px rgba(252, 211, 77, 0.4)) drop-shadow(0 0 15px rgba(252, 211, 77, 0.2))',
              animationDelay: '0.8s',
              animationDuration: '2.5s',
              transformStyle: 'preserve-3d',
              transform: 'translateZ(20px) rotateY(-15deg)'
            }}
          />
        </div>
        
        {/* Triangle 3 - Middle Left */}
        <div className="absolute top-1/2 left-6 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-900 delay-300 group-hover:translate-x-5 group-hover:-translate-y-3 group-hover:rotate-45">
          <div 
            className="w-0 h-0 border-l-5 border-r-5 border-b-8 border-l-transparent border-r-transparent border-b-yellow-500/70 animate-bounce transform rotate-45"
            style={{ 
              filter: 'drop-shadow(3px 3px 12px rgba(245, 158, 11, 0.4)) drop-shadow(0 0 8px rgba(245, 158, 11, 0.3))',
              animationDelay: '0.4s',
              animationDuration: '2.2s',
              transformStyle: 'preserve-3d',
              transform: 'translateZ(25px) rotateX(-10deg) rotateZ(45deg)'
            }}
          />
        </div>
        
        {/* Triangle 4 - Bottom Right */}
        <div className="absolute bottom-16 right-8 opacity-0 group-hover:opacity-100 transition-all duration-700 delay-400 transform group-hover:-translate-x-2 group-hover:translate-y-2 group-hover:-rotate-30">
          <div 
            className="w-0 h-0 border-l-7 border-r-7 border-b-11 border-l-transparent border-r-transparent border-b-yellow-400/55 animate-pulse transform -rotate-30"
            style={{ 
              filter: 'drop-shadow(-1px 5px 10px rgba(251, 191, 36, 0.3)) drop-shadow(0 0 12px rgba(251, 191, 36, 0.2))',
              animationDelay: '1.2s',
              animationDuration: '2.8s',
              transformStyle: 'preserve-3d',
              transform: 'translateZ(18px) rotateY(20deg)'
            }}
          />
        </div>
        
        {/* Triangle 5 - Center Bottom */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-600 delay-200 group-hover:translate-y-3 group-hover:rotate-90">
          <div 
            className="w-0 h-0 border-l-4 border-r-4 border-b-7 border-l-transparent border-r-transparent border-b-yellow-300/65 animate-bounce transform rotate-90"
            style={{ 
              filter: 'drop-shadow(4px 2px 8px rgba(252, 211, 77, 0.4)) drop-shadow(0 0 6px rgba(252, 211, 77, 0.3))',
              animationDelay: '0.6s',
              animationDuration: '2.4s',
              transformStyle: 'preserve-3d',
              transform: 'translateZ(22px) rotateX(15deg) rotateZ(90deg)'
            }}
          />
        </div>
        
        {/* Triangle 6 - Top Center */}
        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-800 delay-100 group-hover:-translate-y-4 group-hover:rotate-180">
          <div 
            className="w-0 h-0 border-l-6 border-r-6 border-b-9 border-l-transparent border-r-transparent border-b-yellow-500/60 animate-pulse"
            style={{ 
              filter: 'drop-shadow(0 -3px 10px rgba(245, 158, 11, 0.4)) drop-shadow(0 0 8px rgba(245, 158, 11, 0.2))',
              animationDelay: '1s',
              animationDuration: '2.6s',
              transformStyle: 'preserve-3d',
              transform: 'translateZ(16px) rotateX(-20deg)'
            }}
          />
        </div>
        
        {/* Small floating triangular particles */}
        <div className="absolute top-20 right-16 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-500 transform group-hover:translate-x-2 group-hover:-translate-y-1">
          <div 
            className="w-0 h-0 border-l-3 border-r-3 border-b-5 border-l-transparent border-r-transparent border-b-yellow-400/40 animate-bounce"
            style={{ 
              filter: 'drop-shadow(1px 2px 4px rgba(251, 191, 36, 0.3))',
              animationDelay: '0.3s',
              animationDuration: '1.8s',
              transformStyle: 'preserve-3d',
              transform: 'translateZ(12px)'
            }}
          />
        </div>
        
        <div className="absolute bottom-20 left-12 opacity-0 group-hover:opacity-100 transition-all duration-600 delay-350 transform group-hover:-translate-x-1 group-hover:translate-y-2">
          <div 
            className="w-0 h-0 border-l-2 border-r-2 border-b-4 border-l-transparent border-r-transparent border-b-yellow-300/50 animate-pulse"
            style={{ 
              filter: 'drop-shadow(-1px 1px 3px rgba(252, 211, 77, 0.3))',
              animationDelay: '0.7s',
              animationDuration: '2.1s',
              transformStyle: 'preserve-3d',
              transform: 'translateZ(8px) rotateZ(30deg)'
            }}
          />
        </div>
      </div>

      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/0 via-yellow-400/20 to-yellow-400/0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
      
      <div className="relative mb-6 transform-gpu transition-transform duration-500 group-hover:rotateX-2">
        {course.coverImage ? (
          <img
            src={course.coverImage}
            alt={`${course.name} cover`}
            className="w-full h-48 object-cover rounded-xl transition-all duration-500 shadow-2xl group-hover:shadow-yellow-500/30"
            style={{
              filter: 'brightness(0.9) contrast(1.1)',
              boxShadow: '0 15px 35px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)'
            }}
          />
        ) : (
          <GeneratedThumbnail name={course.name} />
        )}
        
        {/* 3D Play Button with 360° Rotation */}
        <div className="absolute right-4 bottom-4 w-14 h-14 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full text-black flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:bottom-6 transition-all duration-500 shadow-2xl transform-gpu hover:scale-110"
             style={{
               transformStyle: 'preserve-3d',
               transform: 'translateZ(20px)',
               boxShadow: '0 10px 25px rgba(251, 191, 36, 0.4), inset 0 1px 0 rgba(255,255,255,0.3)'
             }}>
          <PlayIcon 
            className="w-7 h-7 ml-1 drop-shadow-lg transition-transform duration-700 group-hover:rotate-[360deg]"
          />
        </div>
      </div>
      
      <div className="relative z-10">
        <h3 className="font-bold text-xl text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-400 truncate mb-2 drop-shadow-lg">
          {course.name}
        </h3>
        <p className="text-sm font-semibold text-gray-300 flex items-center">
          <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2 animate-pulse"></span>
          {course.parts.length} Parts
        </p>
      </div>
      
      {/* Subtle inner glow */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-yellow-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      {/* 3D depth overlay */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-700"
           style={{
             background: 'radial-gradient(circle at 40% 40%, rgba(251, 191, 36, 0.1) 0%, transparent 70%)',
             filter: 'blur(30px)'
           }}></div>
    </div>
  );
};

export default CourseCard;