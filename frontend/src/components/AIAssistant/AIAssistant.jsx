import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMic, FiX, FiVolume2, FiMessageCircle, FiGlobe, FiLoader } from 'react-icons/fi';
import api from '../../api/axios';
import './AIAssistant.css';

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [lang, setLang] = useState('te-IN'); // Default Telugu
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [messages, setMessages] = useState([]);
  const [processing, setProcessing] = useState(false);
  
  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = true;
      
      rec.onstart = () => setIsListening(true);
      
      rec.onresult = (event) => {
        let finalTrans = '';
        let interimTrans = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTrans += event.results[i][0].transcript;
          } else {
            interimTrans += event.results[i][0].transcript;
          }
        }
        
        if (finalTrans) {
          setTranscript(finalTrans);
          sendToAI(finalTrans);
        } else {
          setTranscript(interimTrans);
        }
      };

      rec.onerror = (e) => {
        console.error('Speech recognition error', e);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    } else {
      console.warn('Speech Recognition API not supported in this browser.');
    }
  }, [lang]);

  const toggleMic = () => {
    if (!recognitionRef.current) return alert("Speech Recognition not supported on this browser.");
    
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.lang = lang;
      setTranscript('');
      recognitionRef.current.start();
    }
  };

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      // Find suitable voice if possible
      const voices = window.speechSynthesis.getVoices();
      const match = voices.find(v => v.lang.includes(lang.split('-')[0]));
      if (match) utterance.voice = match;
      window.speechSynthesis.speak(utterance);
    }
  };

  const sendToAI = async (text) => {
    if (!text.trim()) return;
    
    // Add user message
    const newMsgs = [...messages, { role: 'user', text }];
    setMessages(newMsgs);
    setTranscript('');
    setProcessing(true);

    try {
      const res = await api.post('/api/ai/ask', {
        query: text,
        language: lang.startsWith('te') ? 'te' : 'en'
      });
      
      const answer = res.data.data || "I'm sorry, I couldn't understand that.";
      setMessages([...newMsgs, { role: 'assistant', text: answer }]);
      speakText(answer);
      
    } catch (err) {
      const errorMsg = lang.startsWith('te') 
        ? "క్షమించండి, నెట్‌వర్క్ ఎర్రర్ ఏర్పడింది." 
        : "Sorry, I am facing a network error.";
      setMessages([...newMsgs, { role: 'assistant', text: errorMsg }]);
    } finally {
      setProcessing(false);
    }
  };

  const [textInput, setTextInput] = useState('');

  const submitTextQuery = (e) => {
    if (e) e.preventDefault();
    if (!textInput.trim()) return;
    sendToAI(textInput);
    setTextInput('');
  };

  return (
    <div className="ai-fab-container">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="ai-chat-window"
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
          >
            <div className="ai-chat-header">
              <div className="ach-info">
                <h3>Voice Assistant</h3>
                <div className="ach-lang-toggle">
                  <FiGlobe />
                  <select value={lang} onChange={e => setLang(e.target.value)}>
                    <option value="en-IN">English</option>
                    <option value="te-IN">తెలుగు (Telugu)</option>
                  </select>
                </div>
              </div>
              <button className="btn-close-chat" onClick={() => setIsOpen(false)}><FiX size={20}/></button>
            </div>

            <div className="ai-chat-body">
              {messages.length === 0 ? (
                <div className="ach-empty">
                  <span>✨</span>
                  <p>{lang === 'te-IN' ? 'నమస్కారం! నేను మీకు ఎలా సహాయపడగలను?' : 'Hello! How can I help you today?'}</p>
                </div>
              ) : (
                messages.map((m, i) => (
                  <div key={i} className={`ai-msg-bubble ${m.role}`}>
                    <div className="msg-content">{m.text}</div>
                    {m.role === 'assistant' && (
                      <button className="msg-speak-btn" onClick={() => speakText(m.text)}>
                        <FiVolume2 />
                      </button>
                    )}
                  </div>
                ))
              )}

              {transcript && (
                <div className="ai-msg-bubble user interim">
                  <div className="msg-content">{transcript}</div>
                </div>
              )}

              {processing && (
                <div className="ai-msg-bubble assistant processing">
                  <FiLoader className="spin" />
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="ai-chat-footer">
               <form onSubmit={submitTextQuery} className="ai-chat-input-form">
                 <input 
                   type="text" 
                   value={textInput} 
                   onChange={(e) => setTextInput(e.target.value)} 
                   placeholder={lang === 'te-IN' ? 'టైప్ చేయండి...' : 'Type your message...'} 
                   className="ai-text-input"
                 />
                 <button type="submit" className="btn-send-text">
                   <FiMessageCircle />
                 </button>
               </form>
               <div className="ai-mic-divider">or</div>
               <button 
                 className={`btn-mic-main ${isListening ? 'listening' : ''}`}
                 onClick={toggleMic}
               >
                 <FiMic size={24} />
                 {isListening && <span className="ring-anim"></span>}
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isOpen && (
        <motion.button 
          className="ai-fab-btn"
          onClick={() => setIsOpen(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FiMic size={28} />
        </motion.button>
      )}
    </div>
  );
}
