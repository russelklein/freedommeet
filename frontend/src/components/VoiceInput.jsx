import React, { useState, useEffect } from 'react';

// Check if browser supports speech recognition
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const isSupported = !!SpeechRecognition;

export function VoiceInput({ onTranscript, disabled = false }) {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    if (!isSupported) return;

    const recog = new SpeechRecognition();
    recog.continuous = false;
    recog.interimResults = true;
    recog.lang = 'en-US';

    recog.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join('');
      
      onTranscript(transcript);
    };

    recog.onend = () => {
      setIsListening(false);
    };

    recog.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    setRecognition(recog);

    return () => {
      if (recog) {
        recog.abort();
      }
    };
  }, []);

  const toggleListening = () => {
    if (!recognition) return;

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);
    }
  };

  // Don't render if not supported
  if (!isSupported) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={toggleListening}
      disabled={disabled}
      title={isListening ? 'Stop listening' : 'Voice input'}
      style={{
        width: '44px',
        height: '44px',
        borderRadius: '12px',
        background: isListening 
          ? 'linear-gradient(135deg, #e85d75, #d94a62)' 
          : '#f5f2ef',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Pulse animation when listening */}
      {isListening && (
        <div style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #e85d75, #d94a62)',
          animation: 'pulse 1.5s ease-in-out infinite'
        }} />
      )}
      
      <svg 
        width="20" 
        height="20" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke={isListening ? 'white' : '#8a8482'} 
        strokeWidth="2"
        style={{ position: 'relative', zIndex: 1 }}
      >
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" y1="19" x2="12" y2="23" />
        <line x1="8" y1="23" x2="16" y2="23" />
      </svg>
    </button>
  );
}

// Add pulse animation to global styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.8; transform: scale(1.05); }
    }
  `;
  document.head.appendChild(style);
}
