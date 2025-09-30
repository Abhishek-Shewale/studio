'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

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
        voices.find((voice) => voice.lang.startsWith('en-')); // Fallback to any English voice
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

    recognition.onresult = (event) => {
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript.current += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      
      const transcript = finalTranscript.current + interimTranscript;
      const isFinal = event.results[event.results.length - 1].isFinal;

      onListenResultRef.current?.(transcript, isFinal);
      
      if(isFinal) {
        finalTranscript.current = '';
      }

    };

    recognition.onstart = () => {
      finalTranscript.current = '';
      setIsListening(true);
    };
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
