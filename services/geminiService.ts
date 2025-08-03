import { GoogleGenAI, Type } from '@google/genai';
import { VocabularyItem, WordLookupResult } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY environment variable not set. Gemini API features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

const vocabularySchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      word: {
        type: Type.STRING,
        description: 'The vocabulary word or phrase.',
      },
      ipa: {
        type: Type.STRING,
        description: 'The International Phonetic Alphabet (IPA) transcription of the word.',
      },
      meaning: {
        type: Type.STRING,
        description: 'A clear and concise definition of the word.',
      },
      example: {
        type: Type.STRING,
        description: 'An example sentence using the word in context.',
      },
      translation: {
        type: Type.STRING,
        description: 'The Vietnamese translation of the word.',
      },
    },
    required: ["word", "ipa", "meaning", "example", "translation"],
  },
};

const wordLookupSchema = {
    type: Type.OBJECT,
    properties: {
      word: { type: Type.STRING, description: 'The vocabulary word or phrase.' },
      ipa: { type: Type.STRING, description: 'The International Phonetic Alphabet (IPA) transcription of the word.' },
      meaning: { type: Type.STRING, description: 'A clear and concise definition of the word.' },
      example: { type: Type.STRING, description: 'An example sentence using the word in context.' },
      translation: { type: Type.STRING, description: 'The Vietnamese translation of the word.' },
    },
    required: ["word", "ipa", "meaning", "example", "translation"],
};


export const generateVocabularyFromText = async (text: string): Promise<VocabularyItem[]> => {
  if (!API_KEY) {
    throw new Error("Gemini API key is not configured.");
  }
  
  const prompt = `From the following text, extract key vocabulary words or phrases that a language learner should know. For each item, provide its IPA transcription, a clear meaning, an example sentence, and its Vietnamese translation. Focus on less common but useful terms.\n\nTEXT:\n${text}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: vocabularySchema,
      },
    });

    const jsonString = response.text;
    const vocabularyList = JSON.parse(jsonString);
    return vocabularyList as VocabularyItem[];
  } catch (error) {
    console.error('Error generating vocabulary from Gemini:', error);
    throw error;
  }
};


export const lookupWord = async (selection: string): Promise<WordLookupResult> => {
    if (!API_KEY) throw new Error("Gemini API key is not configured.");
    const prompt = `Analyze the following English word or phrase: "${selection}". Provide its IPA transcription, a clear meaning, a relevant example sentence, and its Vietnamese translation.`;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: wordLookupSchema,
            },
        });
        const jsonString = response.text;
        return JSON.parse(jsonString) as WordLookupResult;
    } catch (error) {
        console.error('Error looking up word:', error);
        throw error;
    }
};