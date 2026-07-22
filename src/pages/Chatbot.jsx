import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Volume2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { chatCompletion, streamChatCompletion } from '../utils/api';
import { getSystemPrompt } from '../utils/data';
import { playTTS } from '../utils/tts';

export default function Chatbot({ profile, setProfile }) {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    { 
      role: 'system', 
      content: getSystemPrompt(profile)
    },
    { role: 'assistant', content: 'Hello! I am someone you can talk to about anything. How are you doing today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const messagesEndRef = useRef(null);
  const hasSavedRef = useRef(false);
  const messagesRef = useRef(messages);
  const profileRef = useRef(profile);

  useEffect(() => {
    messagesRef.current = messages;
    profileRef.current = profile;
  }, [messages, profile]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading || isSaving) return;

    hasSavedRef.current = false;

    const userMessage = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages([...newMessages, { role: 'assistant', content: '' }]);
    setInput('');
    setIsLoading(true);

    try {
      let accumulatedText = "";
      await streamChatCompletion(
        newMessages,
        (chunk) => {
          accumulatedText += chunk;
          setMessages([...newMessages, { role: 'assistant', content: accumulatedText }]);
        },
        () => {
          setIsLoading(false);
        }
      );
    } catch (e) {
      setMessages([...newMessages, { role: 'assistant', content: 'Sorry, I am having trouble connecting right now.' }]);
      setIsLoading(false);
    }
  };

  const performSave = async (currentMessages, currentProfile) => {
    const currentName = currentProfile?.name || 'the person';
    const memorySystemPrompt = `You are an expert Memory Manager and Social Coach Assistant.
Your goal is to update the saved notes based on the conversation history provided.

CRITICAL INSTRUCTIONS:
1. NO GENERIC TERMS: Do NOT use the word 'User', 'Client', or 'Player'.
2. USE THEIR NAME: Refer to the person strictly by their name: ${currentName}.
3. CAPTURE SPECIFICS: Record specific names of friends (e.g., 'Elvis'), locations, and activities.
4. RECORD PLANS: If ${currentName} mentioned a future plan (e.g., 'wants to ask Elvis to hang out'), record this intent.
5. TRACK PROGRESS: Briefly mention what social skill ${currentName} practiced or struggled with.
6. MERGE INTELLIGENTLY: Combine 'Current Notes' with new info. Do not delete old important context (like family details).

Example Output:
"${currentName} is interested in technology. ${currentName} wants to ask a friend named Elvis to the park but feels nervous about rejection."

Output ONLY the updated paragraph of notes. No intro, no outro.`;

    const chatHistoryStr = currentMessages.filter(m => m.role !== 'system').map(m => `Role: ${m.role}\n${m.content}\n\n`).join('');
    
    const summaryRequest = [
      { role: 'system', content: memorySystemPrompt },
      ...currentMessages.filter(m => m.role !== 'system' && m.content !== 'Saving your session notes... Please wait a moment.'),
      { 
        role: 'user', 
        content: `Current Notes: ${currentProfile?.notes || ''}\n\nCurrent Conversation:\n${chatHistoryStr}\nBased on the conversation above, update these notes to include specific names and plans. Remember to use the name ${currentName} instead of 'User':`
      }
    ];

    const newNotes = await chatCompletion(summaryRequest);
    
    const passwordKey = `${currentProfile.name.toLowerCase().trim()}-${currentProfile.animal}-${currentProfile.color}`;
    const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';
    
    const res = await fetch(`${API_BASE}/profiles/${passwordKey}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes: newNotes })
    });
    
    if (res.ok) {
      setProfile({ ...currentProfile, notes: newNotes });
    }
  };

  const handleSaveAndEnd = async () => {
    if (messages.length <= 2) {
      navigate('/');
      return;
    }

    setIsSaving(true);
    setMessages(prev => [...prev, { role: 'assistant', content: 'Saving your session notes... Please wait a moment.' }]);
    hasSavedRef.current = true;

    try {
      await performSave(messages, profile);
      navigate('/');
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { role: 'assistant', content: 'There was an error saving your notes. You can still leave, or try again.' }]);
      setIsSaving(false);
      hasSavedRef.current = false;
    }
  };

  const triggerBackgroundSave = () => {
    if (hasSavedRef.current || messagesRef.current.length <= 2) return;
    hasSavedRef.current = true;
    performSave(messagesRef.current, profileRef.current).catch((e) => {
      console.error("Background auto-save failed", e);
      hasSavedRef.current = false;
    });
  };

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        triggerBackgroundSave();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      triggerBackgroundSave();
    };
  }, []);

  // Mock function for WASM Whisper
  const handleRecord = () => {
    alert("Whisper.cpp WASM STT will start listening here!");
  };

  // Mock function for Piper TTS
  const handleSpeak = (text) => {
    playTTS(text);
  };

  return (
    <div className="glass-panel animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '0' }}>
      <div style={{ padding: '20px', borderBottom: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.4)', borderRadius: '24px 24px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0 }}>Someone To Talk To</h2>
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>Safe space for friendly conversations</p>
        </div>
        <button 
          onClick={handleSaveAndEnd} 
          disabled={isSaving}
          className="btn btn-primary"
          style={{ padding: '10px 20px', fontSize: '1rem', background: 'var(--success)' }}
        >
          {isSaving ? 'Saving Notes...' : 'Save & End Session'}
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {messages.filter(m => m.role !== 'system').map((msg, idx) => (
          <div key={idx} style={{
            alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
            maxWidth: '70%',
            background: msg.role === 'user' ? 'linear-gradient(45deg, var(--primary), var(--secondary))' : 'rgba(255, 255, 255, 0.8)',
            color: msg.role === 'user' ? 'white' : 'var(--text-main)',
            padding: '12px 20px',
            borderRadius: msg.role === 'user' ? '20px 20px 0 20px' : '20px 20px 20px 0',
            boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
            position: 'relative'
          }}>
            {msg.role === 'user' ? (
              msg.content
            ) : (
              <div className="chat-markdown">
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
            )}
            {msg.role === 'assistant' && !isLoading && (
              <button 
                onClick={() => handleSpeak(msg.content)}
                style={{ position: 'absolute', right: '-40px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)' }}
              >
                <Volume2 size={20} />
              </button>
            )}
          </div>
        ))}
        {isLoading && (
          <div style={{ alignSelf: 'flex-start', padding: '12px 20px', background: 'rgba(255,255,255,0.5)', borderRadius: '20px', color: 'var(--text-muted)' }}>
            Thinking...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div style={{ padding: '20px', borderTop: '1px solid var(--glass-border)', display: 'flex', gap: '12px', background: 'rgba(255,255,255,0.3)', borderRadius: '0 0 24px 24px' }}>
        <button className="btn btn-secondary" style={{ padding: '12px', borderRadius: '50%' }} onClick={handleRecord} title="Record Voice (Whisper)">
          <Mic size={20} />
        </button>
        <input 
          type="text" 
          className="input-glass"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          disabled={isLoading || isSaving}
        />
        <button className="btn btn-primary" style={{ padding: '12px 24px' }} onClick={handleSend} disabled={isLoading || isSaving}>
          <Send size={20} />
        </button>
      </div>
    </div>
  );
}
