import React, { useEffect, useRef, useState } from 'react';
import './chatbot.css';
import { useLanguage } from '../../context/LanguageContext';
import { API_URL } from '../../utils/config';

const PREDICTION_KEYWORDS = [
  'prediction',
  'diagnosis',
  'result',
  'detected',
  'last check',
  'last prediction',
  'scan',
  'report',
  'condition',
  'what do i have',
  'my skin problem',
  'my disease',
  'the disease'
];

const Chatbot = () => {
  const { t } = useLanguage();
  const [messages, setMessages] = useState([
    {
      text: t('chat_welcome'),
      sender: 'bot',
      type: 'welcome'
    }
  ]);
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const chatEndRef = useRef(null);
  const lastPrediction = localStorage.getItem('prediction');

  useEffect(() => {
    setMessages((prevMessages) => {
      if (prevMessages.length === 1 && prevMessages[0].type === 'welcome') {
        return [{ ...prevMessages[0], text: t('chat_welcome') }];
      }

      return prevMessages;
    });
  }, [t]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const shouldUsePredictionContext = (message) => {
    const normalized = message.toLowerCase();
    return PREDICTION_KEYWORDS.some((keyword) => normalized.includes(keyword));
  };

  const sendMessage = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || isTyping) {
      return;
    }

    setMessages((prev) => [...prev, { text: trimmedInput, sender: 'user' }]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: trimmedInput,
          disease:
            lastPrediction && shouldUsePredictionContext(trimmedInput)
              ? lastPrediction
              : null
        })
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || t('chat_error_unavailable'));
      }

      setMessages((prev) => [
        ...prev,
        {
          text: data.reply || t('chat_response_fallback'),
          sender: 'bot'
        }
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          text: error.message || t('chat_error_generic'),
          sender: 'bot'
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      <div className="chat-launcher">
        {!isOpen && <div className="chat-label">{t('chat_launcher')}</div>}

        <div
          className="chat-toggle"
          onClick={() => setIsOpen(!isOpen)}
          role="button"
          tabIndex={0}
          aria-label={t('chat_aria_label')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              setIsOpen(!isOpen);
            }
          }}
        >
          <span className="chat-toggle-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" focusable="false">
              <path d="M12 3C7.03 3 3 6.58 3 11c0 2.11.93 4.03 2.45 5.47V21l4.12-2.26c.46.08.94.12 1.43.12 4.97 0 9-3.58 9-8s-4.03-7.86-9-7.86Zm-3.5 8.5a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5Zm3.5 0A1.25 1.25 0 1 1 12 9a1.25 1.25 0 0 1 0 2.5Zm3.5 0a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5Z" />
            </svg>
          </span>
        </div>
      </div>

      {isOpen && (
        <div className="chatbot">
          <div className="chat-header">
            <span>{t('chat_header')}</span>
            <span className="close-btn" onClick={() => setIsOpen(false)}>
              x
            </span>
          </div>

          <div className="chat-window">
            {messages.map((msg, i) =>
              msg.type === 'welcome' ? (
                <div key={i} className="welcome">
                  {msg.text}
                </div>
              ) : (
                <div key={i} className={`message ${msg.sender}`}>
                  <div className="bubble">{msg.text}</div>
                </div>
              )
            )}

            {isTyping && <div className="typing-text">{t('chat_typing')}</div>}

            {!isTyping && messages.length === 1 && lastPrediction && (
              <div className="chat-hint">{t('chat_hint')}</div>
            )}

            <div ref={chatEndRef} />
          </div>

          <div className="input-area">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('chat_placeholder')}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            />
            <button onClick={sendMessage} disabled={isTyping}>
              {t('chat_send')}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
