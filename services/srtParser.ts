
import { TranscriptLine } from '../types';

const timeToSeconds = (time: string): number => {
  const parts = time.replace(',', '.').split(':');
  return (
    parseInt(parts[0], 10) * 3600 +
    parseInt(parts[1], 10) * 60 +
    parseFloat(parts[2])
  );
};

export const parseSrt = (srtContent: string): TranscriptLine[] => {
  const lines = srtContent.trim().split(/\r?\n\r?\n/);
  const transcript: TranscriptLine[] = [];

  for (const line of lines) {
    const parts = line.split('\n');
    if (parts.length >= 3) {
      try {
        const id = parseInt(parts[0], 10);
        const timeMatch = parts[1].match(/(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})/);

        if (timeMatch) {
          const startTime = timeToSeconds(timeMatch[1]);
          const endTime = timeToSeconds(timeMatch[2]);
          const text = parts.slice(2).join(' ');
          
          transcript.push({ id, startTime, endTime, text });
        }
      } catch(e) {
        console.error("Error parsing SRT line:", line, e);
      }
    }
  }

  return transcript;
};
