import type { HTMLAttributes } from 'react';

export interface VocabularyItem {
  word: string;
  ipa: string;
  meaning: string;
  example: string;
  translation?: string;
}

export interface WordLookupResult extends VocabularyItem {
  translation: string;
}

export interface TranscriptLine {
  id: number;
  startTime: number;
  endTime: number;
  text: string;
}

export interface Lesson {
  id: string;
  title: string;
  part: string;
  files: {
    video: File | null;
    srt: File | null;
    pdf: File | null;
    html: File | null;
    txt: File | null;
  };
  learningProgress: {
    completed: boolean;
    position: number; // For video playback
  };
  vocabGenerated: boolean;
}

export interface Part {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface Course {
  id:string;
  name: string;
  coverImage?: string;
  parts: Part[];
}

export interface StoredCourse {
  id: string;
  name: string;
  coverImage?: string;
  parts: {
    id: string;
    title: string;
    lessons: {
      id: string;
      title: string;
      part: string;
      hasVideo: boolean;
      hasSrt: boolean;
      hasPdf: boolean;
      hasHtml: boolean;
      hasTxt: boolean;
       learningProgress: {
        completed: boolean;
        position: number;
      };
      vocabGenerated: boolean;
    }[];
  }[];
}


export enum View {
  Home = 'HOME',
  CoursePlayer = 'COURSE_PLAYER',
  Vocabulary = 'VOCABULARY',
  Flashcards = 'FLASHCARDS',
}


// Augment React's HTMLAttributes to include non-standard directory attributes
declare module 'react' {
  interface InputHTMLAttributes<T> extends HTMLAttributes<T> {
    webkitdirectory?: string;
    directory?: string;
  }
}

// Augmentations for the File System Access API, which may not be in default TS libs.
declare global {
  interface Window {
    showDirectoryPicker(options?: any): Promise<FileSystemDirectoryHandle>;
  }

  interface FileSystemHandle {
    readonly kind: 'file' | 'directory';
    readonly name: string;
    queryPermission(descriptor?: { mode?: 'read' | 'readwrite' }): Promise<PermissionState>;
    requestPermission(descriptor?: { mode?: 'read' | 'readwrite' }): Promise<PermissionState>;
  }

  interface FileSystemFileHandle extends FileSystemHandle {
    readonly kind: 'file';
    getFile(): Promise<File>;
  }

  interface FileSystemDirectoryHandle extends FileSystemHandle {
    readonly kind: 'directory';
    values(): AsyncIterableIterator<FileSystemFileHandle | FileSystemDirectoryHandle>;
  }
}

// This is required to make this file a module, even if empty.
export {};