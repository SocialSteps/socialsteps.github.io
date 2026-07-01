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
  const [score, setScore] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [timerActive, setTimerActive] = useState(false);
  
  useEffect(() => {
    startQuiz();
  }, []);

  const startQuiz = () => {
    const shuffled = [...openEndedQuiz].sort(() => 0.5 - Math.random());
    setQuizQuestions(shuffled.slice(0, 5));
    setCurrentIdx(0);
    setIsFinished(false);
    setScore(0);
    resetQuestionState();
  };

  const resetQuestionState = () => {
    setAnswer("");
    setFeedback("");
    setTimeLeft(60);
    setTimerActive(true);
  };

  const nextQuestion = () => {
    if (currentIdx + 1 < quizQuestions.length) {
      setCurrentIdx(i => i + 1);
      resetQuestionState();
    } else {
      setIsFinished(true);
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
    const pct = (score / 5.0) * 100.0;
    let guidance = "";
    if (pct >= 80) { // 4 or 5 correct
        guidance = "🌟 Outstanding! Expressing your own thoughts on the spot is tough, but you handled these social situations beautifully. Try putting these skills to use in real-world conversations!";
    } else if (pct >= 60) { // 3 correct
        guidance = "👍 Great job! You have a solid grasp on how to communicate in these situations. If you want to refine your answers or understand why you missed a point, be sure to read the feedback closely.";
    } else if (pct >= 40) { // 2 correct
        guidance = "🙂 Good effort! Finding the right words with a ticking timer can be stressful. Try reviewing the 'Social Skills' section or practicing with the 'Basic Quiz' to build up your confidence.";
    } else { // 0 or 1 correct
        guidance = "⚠️ Don't get discouraged! Social interactions are complicated, and answering on the spot takes practice. I recommend checking out the 'Commonly Asked Social Skills Questions' or chatting with 'Someone To Talk To' for some pressure-free practice.";
    }

    return (
      <div className="glass-panel animate-fade-in" style={{ padding: '60px', minHeight: '100%', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <h2 style={{ fontSize: '3.5rem', marginBottom: '20px', color: 'var(--primary)' }}>Quiz Complete! 🎉</h2>
        <h3 style={{ fontSize: '2.5rem', marginBottom: '20px', color: 'var(--text-main)' }}>Your score: {score} / 5</h3>
        <p style={{ fontSize: '1.5rem', marginBottom: '50px', color: 'var(--text-main)', maxWidth: '800px', lineHeight: '1.6' }}>{guidance}</p>
        <button className="btn btn-primary" onClick={startQuiz} style={{ fontSize: '1.2rem', padding: '15px 40px' }}>Restart Quiz 🔄</button>
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
    
    const systemPrompt = `Evaluate the user's answer for correctness AND politeness/social appropriateness. You are currently giving feedback to ${profile?.name || 'a user'}, who is ${profile?.age || 'unknown'} years old. They like to ${profile?.likes || 'nothing specified'}. Their strengths include ${profile?.strengths || 'nothing specified'}. They want to improve on ${profile?.improve || 'nothing specified'}.

Please acknowledge and incorporate this information about them into your responses to make them more personalized and relevant.

Your response MUST ALWAYS start with either the exact word 'Correct' or the exact word 'Incorrect'. If the user's answer is rude, uses profanity, demands something, or is impolite in any way, start your response with 'Incorrect'. Only start with 'Correct' if the answer is both factually correct AND polite. After stating Correct/Incorrect, explain why the answer is correct or incorrect. Be supportive, point out strengths, and gently suggest improvements. IMPORTANT: Always provide 1 or 2 specific, quoted examples of what a perfect, polite response would sound like for this scenario. Introduce them clearly (e.g., 'Here is a great way to respond:' or 'Another polite way to say this would be:'). This gives the user a concrete script to learn from. Do not ask follow-up questions, the user cannot interact with you. YOU MUST ALWAYS address the user as 'You' and use a friendly, encouraging tone. Also give a letter grade for the answer (A, B, C, D, or F). If the answer is correct and polite, give an A. If it is incorrect but polite, give a B or C depending on how close it was to being correct. If it is rude or impolite, give a D or F depending on how rude it was. If the answer was left blank, then mark the answer as 'Incorrect', but DO NOT suggest that the user try again or retry the question. There is a strict 60-second timer for each question to simulate real-world time pressure in conversations. Spelling or grammatical mistakes may occur because the timer can end before the user fully completes their response. Do not penalize the user for any kind of spelling or grammatical errors caused by this timer constraint. The user may choose to speak their answer out loud, which may lead to repetition or filler words in their response. Do not penalize the user for any repetition or filler words caused by this.`;

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
          const cleanFeedback = accumulatedFeedback.replace(/[*#_]/g, '').trim();
          if (cleanFeedback.startsWith("Correct") || cleanFeedback.startsWith("Grade: A") || cleanFeedback.startsWith("Grade A")) {
            setScore(prev => prev + 1);
          }
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
          style={{ width: '100%', height: '150px', resize: 'none', marginBottom: '20px' }}
          placeholder="Type what you would say or do here..."
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          disabled={!!feedback}
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
