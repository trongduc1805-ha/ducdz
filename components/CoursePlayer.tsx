import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Course, Lesson, TranscriptLine, VocabularyItem, WordLookupResult } from '../types';
import { parseSrt } from '../services/srtParser';
import { lookupWord, generateVocabularyFromText } from '../services/geminiService';
import Spinner from './Spinner';
import { ArrowLeftIcon, ChevronRightIcon, ChevronLeftIcon, CheckCircleIcon, FileIcon, FileTextIcon } from './icons';

interface CoursePlayerProps {
  course: Course;
  onBack: () => void;
  onAddVocabularyItem: (item: VocabularyItem) => void;
  onAddMultipleVocabularyItems: (items: VocabularyItem[]) => void;
  onUpdateProgress: (lessonId: string, progress: { position?: number; completed?: boolean }) => void;
  onSetVocabGenerated: (lessonId: string) => void;
}

type LessonView = 'video' | 'pdf' | 'html' | 'txt';
type SidebarTab = 'lessons' | 'transcript';

const isRateLimitError = (e: any): boolean => {
    if (!e) return false;
  
    if (e?.error?.code === 429 || (typeof e?.error?.status === 'string' && e.error.status.includes('RESOURCE_EXHAUSTED'))) {
      return true;
    }
  
    try {
      const fullErrorString = (e.toString() + JSON.stringify(e)).toLowerCase();
      if (fullErrorString.includes('429') || fullErrorString.includes('resource_exhausted') || fullErrorString.includes('rate limit')) {
        return true;
      }
    } catch {
      // Ignore stringification errors
    }
  
    return false;
};

const SegmentedControl = ({ children }: { children: React.ReactNode }) => (
    <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-1 rounded-full flex items-center border border-yellow-500/30 shadow-lg backdrop-blur-lg">{children}</div>
);

const SegmentedControlButton = ({ children, isActive, ...props }: { children: React.ReactNode, isActive: boolean } & React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button 
        {...props}
        className={`flex-1 text-center px-4 py-2 text-sm font-semibold rounded-full transition-all duration-300 ${
          isActive 
            ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-black shadow-lg transform scale-105' 
            : 'text-yellow-300 hover:text-yellow-200 hover:bg-gray-700/50'
        }`}
    >
        {children}
    </button>
);

const CoursePlayer = ({ course, onBack, onAddVocabularyItem, onAddMultipleVocabularyItems, onUpdateProgress, onSetVocabGenerated }: CoursePlayerProps) => {
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(course.parts[0]?.lessons[0] || null);
  const [currentView, setCurrentView] = useState<LessonView>('video');
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>('transcript');
  const [transcript, setTranscript] = useState<TranscriptLine[]>([]);
  const [activeTranscriptLineId, setActiveTranscriptLineId] = useState<number | null>(null);
  
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [textualContent, setTextualContent] = useState<string>('');

  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [selectionPopup, setSelectionPopup] = useState<{
    visible: boolean; x: number; y: number; text: string; lookup?: WordLookupResult | null; error?: string; loading?: boolean;
  } | null>(null);
  
  const [vocabGenerationState, setVocabGenerationState] = useState<'idle' | 'prompt' | 'loading' | 'selection'>('idle');
  const [pendingVocab, setPendingVocab] = useState<VocabularyItem[]>([]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const transcriptContainerRef = useRef<HTMLDivElement>(null);
  const activeLineRef = useRef<HTMLLIElement>(null);
  const lessonsContainerRef = useRef<HTMLDivElement>(null);
  const activeLessonRef = useRef<HTMLLIElement>(null);
  const throttleTimeout = useRef<number | null>(null);
  const lookupCache = useRef<Map<string, WordLookupResult>>(new Map());

  const themedHtmlContent = useMemo(() => {
    if (!textualContent) return '';
    const styles = `
      <style>
        :root {
          color-scheme: dark;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          background: linear-gradient(135deg, #1a1a1a 0%, #000000 100%);
          color: #e5e5e5 !important;
          line-height: 1.6;
          margin: 2rem;
          font-size: 16px;
        }
        body * {
           color: #e5e5e5 !important;
        }
        a { color: #fbbf24 !important; }
        pre, code {
          background: linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%);
          border: 1px solid #fbbf24;
          padding: 0.2em 0.4em;
          border-radius: 6px;
          font-family: monospace;
        }
        pre { padding: 1em; overflow-x: auto; }
      </style>
    `;
    return `<!DOCTYPE html><html><head>${styles}</head><body>${textualContent}</body></html>`;
  }, [textualContent]);

  useEffect(() => {
    if (activeLesson) {
      setGeneralError(null);
      let defaultView: LessonView = 'video';
      if (!activeLesson.files.video) {
        if (activeLesson.files.pdf) defaultView = 'pdf';
        else if (activeLesson.files.html) defaultView = 'html';
        else if (activeLesson.files.txt) defaultView = 'txt';
      }
      setCurrentView(defaultView);
      setSidebarTab(defaultView === 'video' ? 'transcript' : 'lessons');
    }
  }, [activeLesson]);

  useEffect(() => {
    if (!activeLesson) return;

    let didCancel = false;
    let createdVideoUrl: string | null = null;
    let createdPdfUrl: string | null = null;
    
    const load = async () => {
      setIsLoading(true);
      setVideoUrl(null); setPdfUrl(null); setTextualContent(''); setTranscript([]);

      try {
        if (currentView === 'video' && activeLesson.files.video) {
          createdVideoUrl = URL.createObjectURL(activeLesson.files.video);
          if (didCancel) return;
          setVideoUrl(createdVideoUrl);
          
          if (activeLesson.files.srt) {
            const srtText = await activeLesson.files.srt.text();
            if (didCancel) return;
            setTranscript(parseSrt(srtText));
          }
        } else if (currentView === 'pdf' && activeLesson.files.pdf) {
          createdPdfUrl = URL.createObjectURL(activeLesson.files.pdf);
          if (didCancel) return;
          setPdfUrl(createdPdfUrl);
        } else if ((currentView === 'html' || currentView === 'txt') && (activeLesson.files.html || activeLesson.files.txt)) {
          const file = activeLesson.files.html || activeLesson.files.txt;
          if (file) {
            const textContent = await file.text();
            if (didCancel) return;
            setTextualContent(textContent);
          }
        }
      } catch (error) {
        console.error('Error loading lesson content:', error);
      } finally {
        if (!didCancel) setIsLoading(false);
      }
    };
    
    load();

    return () => {
      didCancel = true;
      if (createdVideoUrl) URL.revokeObjectURL(createdVideoUrl);
      if (createdPdfUrl) URL.revokeObjectURL(createdPdfUrl);
    };
  }, [activeLesson, currentView]);

  const handleEnded = useCallback(async () => {
    if (activeLesson) {
      onUpdateProgress(activeLesson.id, { completed: true, position: 0 });
      if (!activeLesson.vocabGenerated && activeLesson.files.srt) {
        setVocabGenerationState('prompt');
      }
    }
  }, [activeLesson, onUpdateProgress]);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement || !activeLesson || currentView !== 'video' || !videoUrl) return;
  
    const handleLoadedMetadata = () => { 
      if (activeLesson.learningProgress.position > 0 && !activeLesson.learningProgress.completed) 
        videoElement.currentTime = activeLesson.learningProgress.position; 
    };
    const handleTimeUpdate = () => {
      if (!videoElement) return;
      const activeLine = transcript.find(line => videoElement.currentTime >= line.startTime && videoElement.currentTime < line.endTime);
      if (activeLine) setActiveTranscriptLineId(activeLine.id);
      if (throttleTimeout.current || videoElement.paused || videoElement.ended) return;
      throttleTimeout.current = window.setTimeout(() => { 
        if (activeLesson) onUpdateProgress(activeLesson.id, { position: videoElement.currentTime }); 
        throttleTimeout.current = null; 
      }, 5000);
    };
  
    videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);
    videoElement.addEventListener('timeupdate', handleTimeUpdate);
    videoElement.addEventListener('ended', handleEnded);
  
    return () => {
      if (throttleTimeout.current) window.clearTimeout(throttleTimeout.current);
      videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
      videoElement.removeEventListener('timeupdate', handleTimeUpdate);
      videoElement.removeEventListener('ended', handleEnded);
    };
  }, [activeLesson, videoUrl, currentView, onUpdateProgress, transcript, handleEnded]);

  useEffect(() => { activeLineRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, [activeTranscriptLineId]);
  useEffect(() => { activeLessonRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, [activeLesson]);
  
  const { prevLesson, nextLesson } = useMemo(() => {
    if (!course || !activeLesson) return { prevLesson: null, nextLesson: null };
    const allLessons = course.parts.flatMap(p => p.lessons);
    const currentIndex = allLessons.findIndex(l => l.id === activeLesson.id);
    const prev = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
    const next = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;
    return { prevLesson: prev, nextLesson: next };
  }, [course, activeLesson]);

  const handleLessonSelect = (lesson: Lesson) => { setSelectionPopup(null); setActiveLesson(lesson); };
  const handleViewChange = (view: LessonView) => { if (activeLesson) setCurrentView(view); };
  
  const handleTranscriptSelection = useCallback((event: MouseEvent) => {
    const selection = window.getSelection();
    
    const popupElement = document.getElementById('translation-popup');
    if (popupElement && popupElement.contains(event.target as Node)) {
        return; 
    }
    
    const text = selection?.toString().trim();

    if (text && text.length > 2 && transcriptContainerRef.current?.contains(selection.anchorNode)) {
        const rect = selection!.getRangeAt(0).getBoundingClientRect();
        setSelectionPopup({ visible: true, x: event.clientX, y: event.clientY, text });
    } else if (selectionPopup?.visible) {
        setSelectionPopup(null);
        window.getSelection()?.removeAllRanges();
    }
  }, [selectionPopup]);

  useEffect(() => { 
    document.addEventListener('mouseup', handleTranscriptSelection); 
    return () => document.removeEventListener('mouseup', handleTranscriptSelection); 
  }, [handleTranscriptSelection]);

  const handleLookup = async () => {
    if (!selectionPopup) return;
    if (lookupCache.current.has(selectionPopup.text)) { 
        setSelectionPopup(prev => ({ ...prev!, lookup: lookupCache.current.get(selectionPopup.text)! })); 
        return; 
    }
    setSelectionPopup(prev => ({ ...prev!, loading: true, error: undefined, lookup: null }));
    try {
      const result = await lookupWord(selectionPopup.text);
      lookupCache.current.set(selectionPopup.text, result);
      setSelectionPopup(prev => ({ ...prev!, lookup: result, loading: false }));
    } catch (e: any) {
      let errorMessage = 'Lookup failed.';
      if (isRateLimitError(e)) errorMessage = "Usage limit reached. Please wait a bit before trying again.";
      else console.error('Error looking up word:', e);
      setSelectionPopup(prev => ({ ...prev!, loading: false, error: errorMessage }));
    }
  };

  const handleSaveSelectionAsVocab = () => {
    if (!selectionPopup?.lookup) return;
    onAddVocabularyItem(selectionPopup.lookup);
    setSelectionPopup(null);
  };

  const handleStartVocabGeneration = async () => {
    if (!activeLesson?.files.srt) return;
    onSetVocabGenerated(activeLesson.id);
    
    setVocabGenerationState('loading');
    setGeneralError(null);

    try {
        const srtText = await activeLesson.files.srt.text();
        const items = await generateVocabularyFromText(srtText);
        setPendingVocab(items);
        setVocabGenerationState('selection');
    } catch (e: any) {
        console.error("Failed to generate vocabulary:", e);
        let errorMessage = 'Failed to generate vocabulary for the lesson.';
        if (isRateLimitError(e)) errorMessage = "Usage limit reached. Could not generate vocabulary.";
        setGeneralError(errorMessage);
        setVocabGenerationState('idle'); 
        setTimeout(() => setGeneralError(null), 7000);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-black via-gray-900 to-black text-gray-300">
      {selectionPopup?.visible && (
        <div 
            id="translation-popup"
            style={{ top: `${selectionPopup.y + 15}px`, left: `${selectionPopup.x}px`, transform: 'translateX(-50%)' }}
            className="absolute z-50 bg-gradient-to-br from-gray-900 to-gray-800 border border-yellow-500/40 rounded-2xl shadow-2xl p-6 max-w-sm text-sm w-[340px] backdrop-blur-lg"
        >
          <div className="space-y-4">
              <p className="font-bold text-xl text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-400 text-center drop-shadow-lg">
                "{selectionPopup.text}"
              </p>
              
              {selectionPopup.loading ? (
                <div className="flex justify-center py-4"><Spinner color="yellow" /></div>
              ) : selectionPopup.lookup ? (
                <div className="space-y-3 text-gray-300">
                    <p><span className="font-semibold text-yellow-400">IPA:</span> <span className="font-mono text-yellow-200">{selectionPopup.lookup.ipa}</span></p>
                    <p><span className="font-semibold text-yellow-400">Meaning:</span> {selectionPopup.lookup.meaning}</p>
                    <p><span className="font-semibold text-yellow-400">Example:</span> <em className="text-gray-400">"{selectionPopup.lookup.example}"</em></p>
                    <p className="font-bold text-center text-lg text-yellow-300 pt-3 border-t border-yellow-500/30 mt-4">{selectionPopup.lookup.translation}</p>
                </div>
              ) : null}

              {selectionPopup.error && <p className="text-red-400 font-bold text-center">{selectionPopup.error}</p>}
          </div>

          <div className="flex items-center justify-between gap-3 mt-6 pt-4 border-t border-yellow-500/30">
                <button 
                    onClick={handleLookup} 
                    disabled={selectionPopup.loading}
                    className="flex-1 text-center px-4 py-2 text-sm font-semibold rounded-lg bg-gradient-to-r from-gray-700 to-gray-800 text-yellow-300 hover:from-gray-600 hover:to-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 border border-yellow-500/30"
                >
                    {selectionPopup.loading ? 'Looking up...' : 'Look up'}
                </button>
                <button 
                    onClick={handleSaveSelectionAsVocab} 
                    disabled={!selectionPopup.lookup}
                    className="flex-1 flex items-center justify-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg text-black bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed transition-all duration-300 shadow-lg"
                >
                    Save Vocab
                </button>
            </div>
        </div>
      )}
      
      {vocabGenerationState !== 'idle' && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-lg z-50 flex items-center justify-center p-4">
            {vocabGenerationState === 'prompt' && (
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-10 max-w-md text-center shadow-2xl animate-fade-in border border-yellow-500/30 backdrop-blur-lg">
                <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-400 mb-4 drop-shadow-lg">
                  Lesson Complete!
                </h2>
                <p className="text-gray-300 mb-8 text-lg leading-relaxed">Would you like to generate a vocabulary list from this lesson's transcript?</p>
                <div className="flex justify-center gap-4">
                <button 
                  onClick={() => { setVocabGenerationState('idle'); if(activeLesson) onSetVocabGenerated(activeLesson.id); }} 
                  className="px-8 py-3 rounded-full font-semibold bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 transition-all duration-300 border border-gray-600"
                >
                  No, thanks
                </button>
                <button 
                  onClick={handleStartVocabGeneration} 
                  className="px-8 py-3 rounded-full font-semibold text-black bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 transition-all duration-300 shadow-lg"
                >
                  Yes, generate
                </button>
                </div>
            </div>
            )}

            {vocabGenerationState === 'loading' && (
            <div className="flex flex-col items-center gap-6">
                <Spinner size="16" color="yellow" />
                <p className="text-xl font-semibold text-yellow-200">Generating vocabulary with AI...</p>
            </div>
            )}

            {vocabGenerationState === 'selection' && (
            <VocabSelectionModal 
                items={pendingVocab}
                onSave={(selectedItems) => {
                  onAddMultipleVocabularyItems(selectedItems);
                  setVocabGenerationState('idle');
                }}
                onClose={() => setVocabGenerationState('idle')}
            />
            )}
        </div>
      )}

      <header className="bg-black/90 backdrop-blur-lg p-4 px-8 flex justify-between items-center z-20 shrink-0 border-b border-yellow-500/30 shadow-lg">
        <div className="flex items-center space-x-6 min-w-0">
          <button onClick={onBack} className="flex items-center gap-3 font-semibold text-yellow-300 hover:text-yellow-200 shrink-0 transition-colors duration-300">
            <ArrowLeftIcon className="w-6 h-6"/>
            <span>Courses</span>
          </button>
          <div className="w-px h-6 bg-yellow-500/30 shrink-0"></div>
          <div className="flex items-center space-x-3 min-w-0">
            <h1 className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-400 shrink-0">
              {course.name}
            </h1>
            <ChevronRightIcon className="w-5 h-5 text-yellow-500 shrink-0"/>
            <p className="text-yellow-200 font-medium truncate">{activeLesson?.title}</p>
          </div>
        </div>
      </header>
      
      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 p-6 md:p-8 flex flex-col min-w-0">
            <div className="bg-gradient-to-br from-black to-gray-900 rounded-2xl flex-1 flex flex-col overflow-hidden min-h-0 border border-yellow-500/20 shadow-2xl">
              <div className="flex-1 relative flex items-center justify-center bg-gradient-to-br from-black to-gray-900">
                {isLoading && <Spinner size="16" color="yellow" />}
                {!isLoading && currentView === 'video' && videoUrl && (
                  <video 
                    ref={videoRef} 
                    src={videoUrl} 
                    controls 
                    className="w-full h-full object-contain rounded-xl shadow-2xl" 
                  />
                )}
                {!isLoading && currentView === 'pdf' && pdfUrl && (
                  <object data={pdfUrl} type="application/pdf" className="w-full h-full rounded-xl">
                    <div className="p-8 text-center text-gray-300 bg-gradient-to-br from-black to-gray-900 h-full flex flex-col justify-center items-center rounded-xl">
                      <p className="mb-4 font-bold text-yellow-300">Your browser cannot display the PDF here.</p>
                      <a 
                        href={pdfUrl} 
                        download={activeLesson?.files.pdf?.name || 'document.pdf'} 
                        className="font-semibold px-6 py-3 rounded-full text-black bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 transition-all duration-300 shadow-lg"
                      >
                        Download PDF
                      </a>
                    </div>
                  </object>
                )}
                {!isLoading && (currentView === 'html' || currentView === 'txt') && (
                  <iframe
                    srcDoc={themedHtmlContent}
                    title={activeLesson?.title || 'Document'}
                    className="w-full h-full border-0 bg-gradient-to-br from-gray-900 to-black rounded-xl"
                    sandbox=""
                  />
                )}
                {!isLoading && !videoUrl && !pdfUrl && !textualContent && (
                  <div className="text-gray-500">No content available for this view.</div>
                )}
              </div>
              {generalError && (
                <div className="p-3 bg-gradient-to-r from-red-900/30 to-red-800/30 border-t border-red-500/30 text-red-300 text-center text-sm font-bold backdrop-blur-lg" role="alert">
                  {generalError}
                </div>
              )}
              <div className="p-4 border-t border-yellow-500/30 bg-gradient-to-r from-gray-900/80 to-gray-800/80 backdrop-blur-lg flex justify-between items-center">
                <div className="flex items-center space-x-3">
                    {activeLesson?.files.pdf && (
                        <button 
                          onClick={() => handleViewChange('pdf')} 
                          title="PDF" 
                          className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-300 ${
                            currentView === 'pdf' 
                              ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-black shadow-lg transform scale-105' 
                              : 'bg-gradient-to-r from-gray-800 to-gray-700 text-yellow-300 hover:from-gray-700 hover:to-gray-600 border border-yellow-500/30'
                          }`}
                        >
                            <FileIcon className="w-7 h-7" />
                        </button>
                    )}
                    {(activeLesson?.files.html || activeLesson?.files.txt) && (
                        <button 
                          onClick={() => handleViewChange(activeLesson?.files.html ? 'html' : 'txt')} 
                          title="Document" 
                          className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-300 ${
                            currentView === 'html' || currentView === 'txt' 
                              ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-black shadow-lg transform scale-105' 
                              : 'bg-gradient-to-r from-gray-800 to-gray-700 text-yellow-300 hover:from-gray-700 hover:to-gray-600 border border-yellow-500/30'
                          }`}
                        >
                            <FileTextIcon className="w-7 h-7" />
                        </button>
                    )}
                </div>
                 <div className="flex items-center space-x-3">
                    <button 
                      onClick={() => prevLesson && handleLessonSelect(prevLesson)} 
                      disabled={!prevLesson} 
                      className="flex items-center gap-2 font-semibold text-sm px-6 py-3 rounded-full bg-gradient-to-r from-gray-800 to-gray-700 text-yellow-300 hover:from-gray-700 hover:to-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 border border-yellow-500/30"
                    >
                        <ChevronLeftIcon className="w-5 h-5"/> <span>Previous</span>
                    </button>
                    <button 
                      onClick={() => nextLesson && handleLessonSelect(nextLesson)} 
                      disabled={!nextLesson} 
                      className="flex items-center gap-2 font-semibold text-sm px-6 py-3 rounded-full text-black bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg"
                    >
                        <span>Next Lesson</span> <ChevronRightIcon className="w-5 h-5"/>
                    </button>
                </div>
              </div>
            </div>
        </main>
        
        <aside className="w-96 p-6 md:p-8 pl-0 flex flex-col space-y-6">
            <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 rounded-2xl flex-1 flex flex-col overflow-hidden border border-yellow-500/20 backdrop-blur-lg shadow-2xl">
                <div className="p-3">
                    <SegmentedControl>
                        <SegmentedControlButton onClick={() => setSidebarTab('lessons')} isActive={sidebarTab === 'lessons'}>
                          Content
                        </SegmentedControlButton>
                        <SegmentedControlButton onClick={() => setSidebarTab('transcript')} isActive={sidebarTab === 'transcript'} disabled={currentView !== 'video'}>
                          Transcript
                        </SegmentedControlButton>
                    </SegmentedControl>
                </div>
                {sidebarTab === 'lessons' && (
                    <div ref={lessonsContainerRef} className="overflow-y-auto flex-1">
                        {course.parts.map((part, partIndex) => (
                            <div key={part.id}>
                                <h3 className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-400 p-4 pb-2 text-lg drop-shadow-lg">
                                  {part.title}
                                </h3>
                                <ul>
                                    {part.lessons.map((lesson, lessonIndex) => (
                                        <li key={lesson.id} ref={activeLesson?.id === lesson.id ? activeLessonRef : null} className="px-3 pb-2">
                                            <button 
                                              onClick={() => handleLessonSelect(lesson)} 
                                              className={`w-full text-left p-4 rounded-xl flex items-center gap-4 transition-all duration-300 ${
                                                activeLesson?.id === lesson.id 
                                                  ? 'bg-gradient-to-r from-yellow-400/20 to-yellow-500/20 border border-yellow-400/40 shadow-lg' 
                                                  : 'hover:bg-gradient-to-r hover:from-gray-800/50 hover:to-gray-700/50 border border-transparent hover:border-yellow-500/20'
                                              }`}
                                            >
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                                                  activeLesson?.id === lesson.id 
                                                    ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-black' 
                                                    : 'bg-gray-700 text-yellow-300'
                                                }`}>
                                                  {part.lessons.findIndex(l => l.id === lesson.id) + 1}
                                                </div>
                                                <span className={`font-medium ${
                                                  activeLesson?.id === lesson.id 
                                                    ? 'text-yellow-300' 
                                                    : 'text-gray-300'
                                                }`}>
                                                    {lesson.title}
                                                </span>
                                                <div className="ml-auto">
                                                {lesson.learningProgress.completed && (
                                                  <CheckCircleIcon className="w-6 h-6 text-yellow-400 drop-shadow-lg"/>
                                                )}
                                                </div>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                )}
                {sidebarTab === 'transcript' && (
                    <div ref={transcriptContainerRef} className="overflow-y-auto flex-1 p-4">
                        {transcript.length > 0 ? (
                            <ul className="space-y-2 text-gray-400">
                            {transcript.map((line) => {
                                const isActive = activeTranscriptLineId === line.id;
                                return (
                                <li 
                                  key={line.id} 
                                  ref={isActive ? activeLineRef : null} 
                                  onClick={() => videoRef.current && (videoRef.current.currentTime = line.startTime)} 
                                  className={`cursor-pointer p-3 rounded-xl transition-all duration-300 ${
                                    isActive 
                                      ? 'bg-gradient-to-r from-yellow-400/20 to-yellow-500/20 text-yellow-100 font-semibold border border-yellow-400/40 shadow-lg' 
                                      : 'hover:bg-gradient-to-r hover:from-gray-800/50 hover:to-gray-700/50 hover:text-gray-200 border border-transparent hover:border-yellow-500/20'
                                  }`}
                                >
                                    {line.text}
                                </li>
                                );
                            })}
                            </ul>
                        ) : ( 
                          <p className="text-gray-500 text-sm p-4 text-center font-semibold">
                            No transcript available for this lesson.
                          </p> 
                        )}
                    </div>
                )}
            </div>
        </aside>
      </div>
    </div>
  );
};

interface VocabSelectionModalProps {
    items: VocabularyItem[];
    onSave: (selectedItems: VocabularyItem[]) => void;
    onClose: () => void;
}

const VocabSelectionModal = ({ items, onSave, onClose }: VocabSelectionModalProps) => {
    const [selectedWords, setSelectedWords] = useState<Set<string>>(() => new Set(items.map(item => item.word)));

    const handleToggleSelection = (word: string) => {
        setSelectedWords(prev => {
            const newSet = new Set(prev);
            if (newSet.has(word)) {
                newSet.delete(word);
            } else {
                newSet.add(word);
            }
            return newSet;
        });
    };

    const handleSelectAll = () => {
        if (selectedWords.size === items.length) {
            setSelectedWords(new Set());
        } else {
            setSelectedWords(new Set(items.map(item => item.word)));
        }
    };
    
    const handleSave = () => {
        const selectedItems = items.filter(item => selectedWords.has(item.word));
        onSave(selectedItems);
    };

    if (items.length === 0) {
        return (
             <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-10 max-w-md text-center shadow-2xl animate-fade-in border border-yellow-500/30 backdrop-blur-lg">
                <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-400 mb-4 drop-shadow-lg">
                  No New Vocabulary Found
                </h2>
                <p className="text-gray-300 mb-8 text-lg leading-relaxed">The AI could not identify any new vocabulary terms from this lesson.</p>
                <div className="flex justify-center">
                    <button 
                      onClick={onClose} 
                      className="px-10 py-3 rounded-full font-semibold bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 transition-all duration-300 border border-gray-600"
                    >
                      Close
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col p-8 animate-fade-in border border-yellow-500/30 backdrop-blur-lg">
            <div className="flex justify-between items-center mb-6 shrink-0">
                <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-400 drop-shadow-lg">
                  Generated Vocabulary
                </h2>
                <p className="text-yellow-200 font-semibold text-lg">{selectedWords.size} / {items.length} selected</p>
            </div>
            <div className="flex items-center gap-6 mb-6 shrink-0">
                <button 
                  onClick={handleSelectAll} 
                  className="text-sm font-semibold text-yellow-400 hover:text-yellow-300 transition-colors duration-300"
                >
                    {selectedWords.size === items.length ? 'Deselect All' : 'Select All'}
                </button>
            </div>
            <div className="overflow-y-auto flex-1 -mr-4 pr-4 space-y-3">
                {items.map(item => (
                    <div 
                        key={item.word}
                        onClick={() => handleToggleSelection(item.word)}
                        className={`p-6 rounded-2xl cursor-pointer flex items-start gap-5 transition-all duration-300 ${
                          selectedWords.has(item.word) 
                            ? 'bg-gradient-to-r from-yellow-400/20 to-yellow-500/20 border border-yellow-400/50 shadow-lg transform scale-[1.02]' 
                            : 'bg-gradient-to-r from-gray-800/50 to-gray-700/50 hover:from-gray-700/70 hover:to-gray-600/70 border border-gray-600/30 hover:border-yellow-500/30'
                        }`}
                    >
                        <div className="pt-1">
                           {selectedWords.has(item.word) ? (
                             <CheckCircleIcon className="w-6 h-6 text-yellow-400 drop-shadow-lg" />
                           ) : (
                             <div className="w-6 h-6 rounded-full border-2 border-gray-500 bg-gray-700/50"></div>
                           )}
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-xl text-yellow-200 mb-2">
                              {item.word} 
                              <span className="font-mono text-base text-yellow-400 ml-3">{item.ipa}</span>
                            </h3>
                            <p className="text-gray-200 mb-2 text-lg leading-relaxed">{item.meaning}</p>
                            {item.translation && (
                              <p className="text-yellow-300 font-semibold mb-2 text-lg">{item.translation}</p>
                            )}
                            <p className="text-gray-400 italic">"{item.example}"</p>
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-8 flex justify-end gap-4 shrink-0 pt-6 border-t border-yellow-500/30">
                <button 
                  onClick={onClose} 
                  className="px-8 py-3 rounded-full font-semibold bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 transition-all duration-300 border border-gray-600"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSave} 
                  disabled={selectedWords.size === 0} 
                  className="px-8 py-3 rounded-full font-semibold text-black bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:text-gray-400 transition-all duration-300 shadow-lg"
                >
                    Save Selected ({selectedWords.size})
                </button>
            </div>
        </div>
    );
};

export default CoursePlayer;