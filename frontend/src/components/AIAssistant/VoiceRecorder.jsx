import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { FiMic, FiSquare } from 'react-icons/fi';

export default function VoiceRecorder({ onResult, isParsing }) {
  const { t } = useTranslation();
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'te-IN' || 'en-IN'; // Default to Telugu or English

      recognitionRef.current.onresult = (event) => {
        const currentTranscript = Array.from(event.results)
          .map((result) => result[0].transcript)
          .join('');
        setTranscript(currentTranscript);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }
  }, []);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current.stop();
      if (transcript) onResult(transcript);
    } else {
      setTranscript('');
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  return (
    <div className="voice-recorder-container text-center py-10">
      <div className="mic-container mb-6">
        <button
          className={`mic-btn ${isRecording ? 'recording' : ''}`}
          onClick={toggleRecording}
          disabled={isParsing}
        >
          {isRecording ? <FiSquare /> : <FiMic />}
        </button>
        <p className="mic-hint mt-4">
          {isRecording ? t('input.voice_hint_recording') : t('input.voice_hint')}
        </p>
      </div>

      <div className={`transcript-box ${transcript ? 'active' : ''}`}>
        {transcript || (isParsing ? t('input.parsing') : t('input.transcript_placeholder') || 'Transcript will appear here...')}
      </div>
      
      {isRecording && <div className="recording-animation mt-4"></div>}
    </div>
  );
}
