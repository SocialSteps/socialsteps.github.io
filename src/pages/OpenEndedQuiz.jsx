import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { streamChatCompletion } from '../utils/api';
import { openEndedQuiz } from '../utils/data';
import { Play, RefreshCw, Mic, Volume2, Timer } from 'lucide-react';
import { playTTS } from '../utils/tts';

export default function OpenEndedQuiz({ profile }) {
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [timerActive, setTimerActive] = useState(false);
  
  const [history, setHistory] = useState([]);
  const [finalSummary, setFinalSummary] = useState("");
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  
  useEffect(() => {
    startQuiz();
  }, []);

  const startQuiz = () => {
    const shuffled = [...openEndedQuiz].sort(() => 0.5 - Math.random());
    setQuizQuestions(shuffled.slice(0, 5));
    setCurrentIdx(0);
    setIsFinished(false);
    setHistory([]);
    setFinalSummary("");
    setIsGeneratingSummary(false);
    resetQuestionState();
  };

  const resetQuestionState = () => {
    setAnswer("");
    setFeedback("");
    setTimeLeft(60);
    setTimerActive(true);
  };

  const nextQuestion = () => {
    const newHistory = [...history, { question, answer, feedback }];
    setHistory(newHistory);
    
    if (currentIdx + 1 < quizQuestions.length) {
      setCurrentIdx(i => i + 1);
      resetQuestionState();
    } else {
      setIsFinished(true);
      generateFinalSummary(newHistory);
    }
  };

  const generateFinalSummary = async (quizHistory) => {
    setIsGeneratingSummary(true);
    
    const systemPrompt = `You are an encouraging and supportive social skills coach giving final feedback to ${profile?.name || 'a user'} on their performance in a 5-question open-ended quiz.
Review the history of the questions they were asked, their answers, and the feedback they received.
Provide a comprehensive, highly encouraging 2-3 paragraph summary of how they did overall. Do not give a grade or score. Focus on their growth, highlight the common positive themes in their answers, and gently point out the main areas they can continue to practice. Speak directly to them using 'You'.`;

    let userPrompt = "Here is the quiz history:\n\n";
    quizHistory.forEach((h, i) => {
      userPrompt += `Question ${i + 1}: ${h.question}\nUser's Answer: ${h.answer}\nFeedback Received: ${h.feedback}\n\n`;
    });

    try {
      let accumulatedSummary = "";
      await streamChatCompletion(
        [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        (chunk) => {
          accumulatedSummary += chunk;
          setFinalSummary(accumulatedSummary);
        },
        () => {
          setIsGeneratingSummary(false);
        }
      );
    } catch (e) {
      setFinalSummary("Failed to generate summary. Please try again later.");
      setIsGeneratingSummary(false);
    }
  };

  useEffect(() => {
    let interval = null;
    if (timerActive && timeLeft > 0 && !isEvaluating && !feedback) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0 && timerActive) {
      setTimerActive(false);
      handleSubmit(); // Auto-submit when time is up
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft, isEvaluating, feedback]);

  const handleRecord = () => {
    alert("Whisper.cpp WASM STT will start listening here! You can speak your answer.");
  };

  if (quizQuestions.length === 0) return <div>Loading...</div>;

  if (isFinished) {
    return (
      <div className="glass-panel animate-fade-in" style={{ padding: '60px', minHeight: '100%', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <h2 style={{ fontSize: '3.5rem', marginBottom: '20px', color: 'var(--primary)' }}>Quiz Complete! 🎉</h2>
        
        {isGeneratingSummary && !finalSummary && (
          <div style={{ fontSize: '1.5rem', color: 'var(--text-main)', marginBottom: '50px' }}>Evaluating your overall performance...</div>
        )}
        
        {finalSummary && (
          <div className="chat-markdown" style={{ fontSize: '1.2rem', marginBottom: '50px', color: 'var(--text-main)', maxWidth: '800px', lineHeight: '1.6', textAlign: 'left', background: 'rgba(255,255,255,0.8)', padding: '30px', borderRadius: '20px' }}>
            <ReactMarkdown>{finalSummary}</ReactMarkdown>
          </div>
        )}
        
        <button className="btn btn-primary" onClick={startQuiz} style={{ fontSize: '1.2rem', padding: '15px 40px' }} disabled={isGeneratingSummary}>Restart Quiz 🔄</button>
      </div>
    );
  }

  const question = quizQuestions[currentIdx];

  const handleSpeakScenario = () => {
    playTTS(question);
  };
  
  const handleSubmit = async () => {
    if (!answer.trim()) return;
    setIsEvaluating(true);
    setTimerActive(false);
    setFeedback("");
    
    const systemPrompt = `Evaluate the user's answer for politeness and social appropriateness. You are currently giving feedback to ${profile?.name || 'a user'}, who is ${profile?.age || 'unknown'} years old. They like to ${profile?.likes || 'nothing specified'}. Their strengths include ${profile?.strengths || 'nothing specified'}. They want to improve on ${profile?.improve || 'nothing specified'}.

Please acknowledge and incorporate this information about them into your responses to make them more personalized and relevant.

DO NOT give a grade, score, or use the words 'Correct' or 'Incorrect'. Start by pointing out what worked well in their answer, and then gently suggest what they could improve. Be supportive, encouraging, and kind. YOU MUST ALWAYS address the user as 'You'.

IMPORTANT: Always provide 1 or 2 specific, quoted examples of what a perfect, polite response would sound like for this scenario. Introduce them clearly (e.g., 'Here is a great way to respond:' or 'Another polite way to say this would be:'). This gives the user a concrete script to learn from. Do not ask follow-up questions, the user cannot interact with you. 

There is a strict 60-second timer for each question to simulate real-world time pressure in conversations. Do not penalize the user for any kind of spelling or grammatical errors, repetition, or filler words caused by this timer constraint or from speaking their answer out loud.`;

    const userPrompt = `Question: ${question}\nMy Answer: ${answer}`;

    try {
      let accumulatedFeedback = "";
      await streamChatCompletion(
        [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        (chunk) => {
          accumulatedFeedback += chunk;
          setFeedback(accumulatedFeedback);
        },
        () => {
          setIsEvaluating(false);
        }
      );
    } catch (e) {
      setFeedback("Failed to evaluate. Please try again later.");
      setIsEvaluating(false);
    }
  };

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '40px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <h2 style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '2rem' }}>🗣️ Open-Ended Quiz</span>
        <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.5)', padding: '10px 20px', borderRadius: '20px' }}>
          Question {currentIdx + 1} of {quizQuestions.length}
        </span>
      </h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>Read the scenario and type your response. You'll get personalized feedback!</p>

      <div className="glass-panel" style={{ padding: '24px', background: 'rgba(255,255,255,0.9)', marginBottom: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
          <h3 style={{ color: 'var(--primary)', margin: 0 }}>Scenario:</h3>
          <button 
            onClick={handleSpeakScenario}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'bold' }}
          >
            <Volume2 size={20} /> Listen
          </button>
        </div>
        <p style={{ fontSize: '1.2rem', fontWeight: '600' }}>{question}</p>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {!feedback && (
          <div style={{ marginBottom: '20px', background: 'rgba(255,255,255,0.5)', borderRadius: '20px', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
            <Timer size={24} color="var(--primary)" />
            <div style={{ flex: 1, height: '12px', background: 'rgba(255,255,255,0.8)', borderRadius: '10px', overflow: 'hidden' }}>
              <div style={{ 
                height: '100%', 
                width: `${(timeLeft / 60) * 100}%`, 
                background: 'linear-gradient(90deg, var(--accent), var(--primary))',
                transition: 'width 1s linear',
                borderRadius: '10px'
              }} />
            </div>
            <span style={{ fontWeight: 'bold', color: 'var(--primary)', minWidth: '40px' }}>{timeLeft}s</span>
          </div>
        )}

        <textarea 
          className="input-glass"
          style={{ width: '100%', height: '150px', resize: 'none', marginBottom: '20px', opacity: (isEvaluating || !!feedback) ? 0.7 : 1 }}
          placeholder="Type what you would say or do here..."
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          readOnly={isEvaluating || !!feedback}
        />
        
        {!feedback && (
          <div style={{ display: 'flex', gap: '15px' }}>
            <button 
              className="btn btn-secondary" 
              onClick={handleRecord} 
              title="Speak your answer"
              style={{ padding: '12px', borderRadius: '50%' }}
            >
              <Mic size={24} />
            </button>

            <button 
              className="btn btn-primary" 
              onClick={handleSubmit} 
              disabled={isEvaluating || !answer.trim()}
              style={{ flex: 1, maxWidth: '250px' }}
            >
              {isEvaluating ? 'Evaluating...' : 'Submit Answer'}
            </button>
          </div>
        )}

        {feedback && (
          <div className="glass-panel animate-fade-in" style={{ padding: '24px', marginTop: '10px', border: '2px solid var(--success)', background: 'rgba(255,255,255,0.8)' }}>
            <h3 style={{ color: 'var(--success)', marginBottom: '10px' }}>Feedback</h3>
            <div className="chat-markdown" style={{ fontSize: '1.2rem', lineHeight: '1.6', marginBottom: '25px', color: 'var(--text-main)' }}>
              <ReactMarkdown>{feedback}</ReactMarkdown>
            </div>
            {!isEvaluating && (
              <button className="btn btn-primary" onClick={nextQuestion} style={{ fontSize: '1.1rem', padding: '12px 30px' }}>
                {currentIdx + 1 < quizQuestions.length ? 'Next Question →' : 'Finish Quiz'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
