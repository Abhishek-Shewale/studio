'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

type UseSpeechProps = {
  onListenResult?: (text: string) => void;
};

export const useSpeech = ({ onListenResult }: UseSpeechProps) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const indianVoiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const onListenResultRef = useRef(onListenResult);

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
        voices.find((voice) => voice.lang.startsWith('en-')); // Fallback to any English voice
      if (indianVoice) {
        indianVoiceRef.current = indianVoice;
      }
    };

    loadVoices();
    speechSynthesis.onvoiceschanged = loadVoices;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onListenResultRef.current?.(transcript);
    };

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  }, [hasSpeechSupport]);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error('Could not start recognition', e);
        setIsListening(false); // Ensure state is correct on failure
      }
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
      } catch (e)
      {
        console.error('Could not stop recognition', e);
      }
    }
  }, [isListening]);

  const speak = useCallback(
    (text: string, onEnd?: () => void) => {
      if (!hasSpeechSupport || isSpeaking) return;

      const utterance = new SpeechSynthesisUtterance(text);
      if (indianVoiceRef.current) {
        utterance.voice = indianVoiceRef.current;
      }
      utterance.pitch = 1;
      utterance.rate = 1;
      utterance.volume = 1;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
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
