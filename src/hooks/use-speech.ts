'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

// Extend Window interface to include speech recognition types
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

// Type definitions for speech recognition
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((event: any) => void) | null;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: any) => void) | null;
}

type UseSpeechProps = {
  onListenResult?: (text: string, isFinal: boolean) => void;
};

export const useSpeech = ({ onListenResult }: UseSpeechProps) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const indianVoiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const onListenResultRef = useRef(onListenResult);
  const finalTranscript = useRef('');

  // Keep the callback ref up to date
  useEffect(() => {
    onListenResultRef.current = onListenResult;
  }, [onListenResult]);

  const hasSpeechSupport =
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) &&
    'speechSynthesis' in window;

  useEffect(() => {
    if (!hasSpeechSupport) return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const speechSynthesis = window.speechSynthesis;

    const loadVoices = () => {
      const voices = speechSynthesis.getVoices();
      const indianVoice =
        voices.find((voice) => voice.lang.includes('en-IN')) ||
        voices.find((voice) => voice.name.includes('Indian')) ||
        voices.find((voice) => voice.lang.startsWith('en-US')); // Fallback to any English voice
      if (indianVoice) {
        indianVoiceRef.current = indianVoice;
      }
    };

    loadVoices();
    speechSynthesis.onvoiceschanged = loadVoices;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      console.log('=== SPEECH RECOGNITION RESULT ===');
      console.log('Event results length:', event.results.length);
      console.log('Result index:', event.resultIndex);
      
      let interimTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const result = event.results[i];
        const transcriptPart = result[0].transcript;
        
        console.log(`Result ${i} - isFinal:`, result.isFinal, 'transcript:', transcriptPart);
        
        if (result.isFinal) {
          finalTranscript.current += transcriptPart + ' ';
        } else {
          interimTranscript += transcriptPart;
        }
      }
      
      const fullTranscript = finalTranscript.current + interimTranscript;
      const lastResult = event.results[event.results.length - 1];
      
      console.log('Final transcript so far:', finalTranscript.current);
      console.log('Interim transcript:', interimTranscript);
      console.log('Full transcript:', fullTranscript);
      console.log('Last result is final:', lastResult.isFinal);

      onListenResultRef.current?.(fullTranscript.trim(), lastResult.isFinal);
    };

    recognition.onstart = () => {
      console.log('=== SPEECH RECOGNITION STARTED ===');
      finalTranscript.current = '';
      setIsListening(true);
    };
    
    recognition.onend = () => {
      console.log('=== SPEECH RECOGNITION ENDED ===');
      console.log('Final transcript on end:', finalTranscript.current);
      setIsListening(false);
    };
    
    recognition.onerror = (event: any) => {
      console.error('=== SPEECH RECOGNITION ERROR ===');
      console.error('Error:', event.error);
      console.error('Message:', event.message);
      setIsListening(false);
      
      // Handle specific error types
      if (event.error === 'no-speech') {
        console.log('No speech detected, restarting recognition...');
        // Auto-restart if no speech detected
        setTimeout(() => {
          if (recognitionRef.current) {
            try {
              recognitionRef.current.start();
            } catch (e) {
              console.log('Could not restart recognition:', e);
            }
          }
        }, 1000);
      }
    };

    recognitionRef.current = recognition;
  }, [hasSpeechSupport]);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      try {
        console.log('=== STARTING LISTENING ===');
        finalTranscript.current = '';
        recognitionRef.current.start();
      } catch (e) {
        console.error('Could not start recognition', e);
        setIsListening(false);
      }
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      try {
        console.log('=== STOPPING LISTENING ===');
        console.log('Final transcript before stop:', finalTranscript.current);
        recognitionRef.current.stop();
      } catch (e) {
        console.error('Could not stop recognition', e);
      }
    }
  }, [isListening]);

  const speak = useCallback(
    (text: string, onEnd?: () => void) => {
      if (!hasSpeechSupport || isSpeaking) return;

      console.log('=== SPEAKING ===');
      console.log('Text:', text);

      const utterance = new SpeechSynthesisUtterance(text);
      if (indianVoiceRef.current) {
        utterance.voice = indianVoiceRef.current;
      }
      utterance.pitch = 1;
      utterance.rate = 1;
      utterance.volume = 1;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        console.log('=== SPEAKING ENDED ===');
        setIsSpeaking(false);
        onEnd?.();
      };
      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event.error);
        setIsSpeaking(false);
      };

      window.speechSynthesis.speak(utterance);
    },
    [isSpeaking, hasSpeechSupport]
  );

  const cancelSpeaking = useCallback(() => {
    if (hasSpeechSupport) {
      console.log('=== CANCELING SPEAKING ===');
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [hasSpeechSupport]);

  return {
    isListening,
    isSpeaking,
    startListening,
    stopListening,
    speak,
    cancelSpeaking,
    hasSpeechSupport,
  };
};