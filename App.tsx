import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Course, StoredCourse, Part, View, VocabularyItem } from './types';
import useLocalStorage from './hooks/useLocalStorage';
import { storeDirectoryHandle, getDirectoryHandle } from './services/db';
import Header from './components/Header';
import CourseCard from './components/CourseCard';
import CoursePlayer from './components/CoursePlayer';
import VocabularyView from './components/VocabularyView';
import FlashcardView from './components/FlashcardView';
import Spinner from './components/Spinner';

// For browsers that don't support File System Access API
const parseFileList = (files: FileList): Course => {
    if (files.length === 0) throw new Error("No files selected");

    const rootDirName = (files[0] as any).webkitRelativePath.split('/')[0];
    const course: Course = {
        id: rootDirName,
        name: rootDirName,
        parts: [],
    };
    
    const lessonFilesMap = new Map<string, { id: string; title: string; part: string; files: Record<string, File> }>();
    const partsSet = new Set<string>();

    for (const file of Array.from(files)) {
        const pathParts = (file as any).webkitRelativePath.split('/');
        if (pathParts.length < 3 || pathParts[0] !== rootDirName) continue;

        const [, partName, fileName] = pathParts;
        const match = fileName.match(/^(\d+)\s*(.*?)\.(mp4|srt|pdf|html|txt)$/i);
        if (match) {
            partsSet.add(partName);
            const [, id, title, ext] = match;
            const lessonKey = `${partName}-${id}`;
            if (!lessonFilesMap.has(lessonKey)) {
                lessonFilesMap.set(lessonKey, { id, title: title.trim(), part: partName, files: {} });
            }
            lessonFilesMap.get(lessonKey)!.files[ext.toLowerCase()] = file;
        }
    }
    
    const sortedParts = Array.from(partsSet).sort();

    sortedParts.forEach(partName => {
        const part: Part = { id: partName, title: partName, lessons: [] };
        const partLessons = Array.from(lessonFilesMap.values())
            .filter(lf => lf.part === partName)
            .sort((a,b) => a.id.localeCompare(b.id, undefined, { numeric: true }));

        part.lessons = partLessons.map(l => ({
            id: `${l.part}-${l.id}`,
            title: l.title,
            part: l.part,
            files: {
                video: l.files.mp4 || null,
                srt: l.files.srt || null,
                pdf: l.files.pdf || null,
                html: l.files.html || null,
                txt: l.files.txt || null,
            },
            learningProgress: { completed: false, position: 0 },
            vocabGenerated: false
        }));
        
        if (part.lessons.length > 0) {
            course.parts.push(part);
        }
    });

    return course;
};

// For modern browsers with File System Access API
const parseDirectoryHandle = async (handle: FileSystemDirectoryHandle): Promise<Course> => {
  const course: Course = {
    id: handle.name,
    name: handle.name,
    parts: [],
  };
  const lessonFilesMap = new Map<string, { id: string; title: string; part: string; files: Record<string, File> }>();
  const partsSet = new Set<string>();

  for await (const partHandle of handle.values()) {
    if (partHandle.kind === 'directory') {
      const partName = partHandle.name;
      partsSet.add(partName);
      for await (const fileHandle of partHandle.values()) {
        if (fileHandle.kind === 'file') {
          const fileName = fileHandle.name;
          const match = fileName.match(/^(\d+)\s*(.*?)\.(mp4|srt|pdf|html|txt)$/i);
          if (match) {
            const [, id, title, ext] = match;
            const lessonKey = `${partName}-${id}`;
            if (!lessonFilesMap.has(lessonKey)) {
              lessonFilesMap.set(lessonKey, { id, title: title.trim(), part: partName, files: {} });
            }
            const file = await fileHandle.getFile();
            lessonFilesMap.get(lessonKey)!.files[ext.toLowerCase()] = file;
          }
        }
      }
    }
  }

  const sortedParts = Array.from(partsSet).sort();
  sortedParts.forEach(partName => {
    const part: Part = { id: partName, title: partName, lessons: [] };
    const partLessons = Array.from(lessonFilesMap.values())
      .filter(lf => lf.part === partName)
      .sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
    part.lessons = partLessons.map(l => ({
      id: `${l.part}-${l.id}`,
      title: l.title,
      part: l.part,
      files: { video: l.files.mp4 || null, srt: l.files.srt || null, pdf: l.files.pdf || null, html: l.files.html || null, txt: l.files.txt || null },
      learningProgress: { completed: false, position: 0 },
      vocabGenerated: false,
    }));
    if (part.lessons.length > 0) course.parts.push(part);
  });
  return course;
};


const App = () => {
  const [view, setView] = useState<View>(View.Home);
  const [courses, setCourses] = useState<Course[]>([]);
  const [storedCourses, setStoredCourses] = useLocalStorage<StoredCourse[]>('courses', []);
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);
  const [vocabulary, setVocabulary] = useLocalStorage<VocabularyItem[]>('vocabulary', []);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [action, setAction] = useState<'add' | 'load' | null>(null);
  const [targetCourseId, setTargetCourseId] = useState<string | null>(null);

  useEffect(() => {
    const initialCourses = storedCourses.map(sc => ({
      id: sc.id, name: sc.name, coverImage: sc.coverImage,
      parts: sc.parts.map(p => ({
        id: p.id, title: p.title,
        lessons: p.lessons.map(l => ({
          id: l.id, title: l.title, part: l.part,
          files: { video: null, srt: null, pdf: null, html: null, txt: null },
          learningProgress: l.learningProgress,
          vocabGenerated: l.vocabGenerated || false,
        })),
      }))
    }));
    setCourses(initialCourses);
    setIsLoading(false);
  }, [storedCourses]);

  const handleUpdateLessonProgress = useCallback((lessonId: string, progress: { position?: number; completed?: boolean }) => {
    const updateLogic = (lesson: any) => {
        if (lesson.id === lessonId) {
            const newProgress = { ...lesson.learningProgress, ...progress };
            if (progress.completed) {
              newProgress.position = 0;
            }
            return { ...lesson, learningProgress: newProgress };
        }
        return lesson;
    };
    setStoredCourses(prev => prev.map(sc => sc.id === activeCourse?.id ? {
      ...sc, parts: sc.parts.map(p => ({ ...p, lessons: p.lessons.map(updateLogic) }))
    } : sc));
    setActiveCourse(prev => prev ? {
      ...prev, parts: prev.parts.map(p => ({...p, lessons: p.lessons.map(updateLogic)}))
    } : null);
  }, [activeCourse?.id, setStoredCourses]);

  const handleSetVocabGenerated = useCallback((lessonId: string) => {
    const updateLogic = (lesson: any) => lesson.id === lessonId ? { ...lesson, vocabGenerated: true } : lesson;

    setStoredCourses(prev => prev.map(sc => sc.id === activeCourse?.id ? {
      ...sc, parts: sc.parts.map(p => ({ ...p, lessons: p.lessons.map(updateLogic) }))
    } : sc));
    setActiveCourse(prev => prev ? {
      ...prev, parts: prev.parts.map(p => ({...p, lessons: p.lessons.map(updateLogic)}))
    } : null);
  }, [activeCourse?.id, setStoredCourses]);

  const processNewCourse = (newCourseData: Course) => {
    if (storedCourses.some(c => c.name === newCourseData.name)) {
        alert("This course has already been added.");
        return;
    }
    const newStoredCourse: StoredCourse = {
        id: newCourseData.id, name: newCourseData.name, coverImage: newCourseData.coverImage,
        parts: newCourseData.parts.map(p => ({
            id: p.id, title: p.title,
            lessons: p.lessons.map(l => ({
                id: l.id, title: l.title, part: l.part,
                hasVideo: !!l.files.video, hasSrt: !!l.files.srt, hasPdf: !!l.files.pdf, hasHtml: !!l.files.html, hasTxt: !!l.files.txt,
                learningProgress: l.learningProgress, vocabGenerated: l.vocabGenerated,
            }))
        }))
    };
    setStoredCourses(prev => [...prev, newStoredCourse]);
    setActiveCourse(newCourseData);
    setView(View.CoursePlayer);
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsLoading(true);
    const files = e.target.files;
    try {
        if (!files || files.length === 0) {
            // This handles cancellation of the file input dialog
            setIsLoading(false);
            return;
        }
        const newCourseData = parseFileList(files);
        if (action === 'add') {
            processNewCourse(newCourseData);
        } else if (action === 'load' && targetCourseId) {
            const targetCourse = courses.find(c => c.id === targetCourseId);
            if (!targetCourse) { setError("Target course not found."); return; }
            if (targetCourse.name !== newCourseData.name) { alert(`Incorrect folder. Expected "${targetCourse.name}" but got "${newCourseData.name}".`); return; }
            const hydratedCourse: Course = { ...targetCourse,
              parts: targetCourse.parts.map(part => ({ ...part,
                lessons: part.lessons.map(lesson => {
                  const newLessonData = newCourseData.parts.find(p => p.id === part.id)?.lessons.find(l => l.id === lesson.id);
                  return { ...lesson, files: newLessonData ? newLessonData.files : { video: null, srt: null, pdf: null, html: null, txt: null } };
                })
              }))
            };
            setActiveCourse(hydratedCourse);
            setView(View.CoursePlayer);
        }
    } catch (err: any) {
        console.error(err);
        setError(`Failed to process folder: ${err.message}`);
    } finally {
        setAction(null);
        setTargetCourseId(null);
        setIsLoading(false);
    }
  };

  const handleAddCourse = async () => {
    setError(null);
    if ('showDirectoryPicker' in window) {
      try {
        setIsLoading(true);
        const handle = await window.showDirectoryPicker();
        const newCourseData = await parseDirectoryHandle(handle);
        await storeDirectoryHandle(newCourseData.id, handle);
        processNewCourse(newCourseData);
      } catch (err: any) {
        if (err.name === 'AbortError') {
          // User cancelled the picker
          setIsLoading(false);
        } else if (err.message && err.message.includes("Cross origin sub frames")) {
          // The environment blocks the picker. Fallback to the input method.
          console.warn("showDirectoryPicker is blocked by the environment. Falling back to the legacy input method.");
          setAction('add');
          fileInputRef.current?.click();
          // Let handleFileSelect manage the loading state, but set it false here
          // to prevent a stuck loader if the user cancels the fallback dialog.
          setIsLoading(false);
        } else {
          console.error(err);
          setError(`Failed to add course: ${err.message}`);
          setIsLoading(false);
        }
      }
    } else {
      // The API is not available at all. Use fallback.
      setAction('add');
      fileInputRef.current?.click();
    }
  };
  
  const handleSelectCourse = async (course: Course) => {
    setError(null);
    setIsLoading(true);

    const fallbackToFileInput = () => {
        alert(`For security, please re-select the course folder "${course.name}" to grant access to its files.`);
        setAction('load');
        setTargetCourseId(course.id);
        fileInputRef.current?.click();
        setIsLoading(false);
    };

    if ('showDirectoryPicker' in window) {
        const handle = await getDirectoryHandle(course.id);
        if (handle) {
            try {
                const verifyPermission = async (handle: FileSystemDirectoryHandle) => {
                    const options = { mode: 'read' as const };
                    if ((await handle.queryPermission(options)) === 'granted') return true;
                    if ((await handle.requestPermission(options)) === 'granted') return true;
                    return false;
                };

                if (await verifyPermission(handle)) {
                    const freshData = await parseDirectoryHandle(handle);
                    if (freshData.name !== course.name) {
                        setError(`Folder name mismatch. Expected "${course.name}", but selected folder is "${freshData.name}".`);
                        fallbackToFileInput();
                        return;
                    }
                    const hydratedCourse = { ...course,
                        parts: freshData.parts.map(newPart => ({ ...newPart,
                            lessons: newPart.lessons.map(newLesson => {
                                const oldLesson = course.parts.find(p => p.id === newPart.id)?.lessons.find(l => l.id === newLesson.id);
                                return { ...newLesson, learningProgress: oldLesson?.learningProgress || { completed: false, position: 0 }, vocabGenerated: oldLesson?.vocabGenerated || false, };
                            })
                        }))
                    };
                    setActiveCourse(hydratedCourse);
                    setView(View.CoursePlayer);
                } else {
                    throw new Error("Permission to access course folder was denied.");
                }
            } catch (err: any) {
                setError(`Error accessing course: ${err.message}. Please try re-selecting the folder.`);
                fallbackToFileInput();
            } finally {
               if(view !== View.CoursePlayer) setIsLoading(false);
            }
        } else {
            fallbackToFileInput();
        }
    } else {
        fallbackToFileInput();
    }
  };

  const handleAddMultipleVocabularyItems = useCallback((items: VocabularyItem[]) => {
      if (!items || items.length === 0) return;
      setVocabulary(prev => {
          const existingWords = new Set(prev.map(v => v.word.toLowerCase()));
          const uniqueNewItems = items.filter(item => !existingWords.has(item.word.toLowerCase()));
          return [...prev, ...uniqueNewItems];
      });
  }, [setVocabulary]);

  const handleAddVocabularyItem = useCallback((item: VocabularyItem) => {
    setVocabulary(prev => {
        const exists = prev.some(v => v.word.toLowerCase() === item.word.toLowerCase());
        if (exists) {
            alert(`"${item.word}" is already in your vocabulary list.`);
            return prev;
        }
        return [...prev, item];
    });
  }, [setVocabulary]);

  const renderView = () => {
    switch (view) {
      case View.CoursePlayer:
        return activeCourse ? (
            <CoursePlayer 
                course={activeCourse} 
                onBack={() => { setView(View.Home); setActiveCourse(null); setIsLoading(false); }} 
                onAddVocabularyItem={handleAddVocabularyItem}
                onAddMultipleVocabularyItems={handleAddMultipleVocabularyItems}
                onUpdateProgress={handleUpdateLessonProgress}
                onSetVocabGenerated={handleSetVocabGenerated}
            />
        ) : null;
      case View.Vocabulary:
        return <VocabularyView vocabulary={vocabulary} onBack={() => setView(View.Home)} />;
      case View.Flashcards:
        return <FlashcardView vocabulary={vocabulary} onBack={() => setView(View.Home)} />;
      case View.Home:
      default:
        return (
          <main className="p-4 sm:p-6 md:p-8">
            <div className="relative">
              <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-300 to-amber-400 mb-8 text-center drop-shadow-2xl">
                My Courses
              </h2>
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-transparent to-yellow-400/20 blur-3xl -z-10"></div>
            </div>
            {courses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {courses.map(course => (
                  <CourseCard key={course.id} course={course} onSelectCourse={() => handleSelectCourse(course)} />
                ))}
              </div>
            ) : (
                <div className="text-center py-20 px-8 bg-gradient-to-br from-gray-900/80 to-black/90 rounded-2xl border border-yellow-500/20 backdrop-blur-lg shadow-2xl">
                    <div className="relative">
                      <h3 className="text-2xl font-bold text-yellow-300 mb-4">Your course list is empty!</h3>
                      <p className="text-gray-300 text-lg">Click "Add Course" to get started with your learning journey.</p>
                      <div className="absolute inset-0 bg-yellow-400/10 blur-2xl rounded-full -z-10"></div>
                    </div>
                </div>
            )}
            {error && (
              <div className="mt-6 text-center font-bold text-red-300 bg-gradient-to-r from-red-900/30 to-red-800/30 p-4 rounded-xl border border-red-500/30 backdrop-blur-lg shadow-lg">
                {error}
              </div>
            )}
          </main>
        );
    }
  };

  return (
    <div className="min-h-screen text-gray-300 bg-gradient-to-br from-black via-gray-900 to-black">
      <input 
          type="file"
          webkitdirectory=""
          directory=""
          multiple 
          ref={fileInputRef} 
          onChange={handleFileSelect}
          onClick={(event) => { (event.target as HTMLInputElement).value = '' }}
          style={{ display: 'none' }}
      />
      {view !== View.CoursePlayer && view !== View.Flashcards && (
        <Header
          onNavigate={setView}
          onAddCourse={handleAddCourse}
          loading={isLoading && (action !== null || view !== View.Home)}
        />
      )}
      {isLoading && courses.length === 0 && (
          <div className="flex justify-center items-center py-20">
              <Spinner size="16"/>
          </div>
      )}
      {!isLoading && renderView()}
    </div>
  );
};

export default App;
