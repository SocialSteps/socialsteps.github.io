import React, { useState, useEffect } from 'react';

export default function Quiz({ title, questions }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState([]);

  useEffect(() => {
    const shuffled = [...questions].sort(() => 0.5 - Math.random());
    setQuizQuestions(shuffled.slice(0, 10));
    setCurrentIdx(0);
    setScore(0);
    setIsFinished(false);
    setSelectedAnswer(null);
    setShowResult(false);
  }, [questions]);

  if (quizQuestions.length === 0) return <div>Loading...</div>;

  const currentQ = quizQuestions[currentIdx];

  const handleAnswer = (choice) => {
    if (showResult) return;
    setSelectedAnswer(choice);
    setShowResult(true);
    if (choice === currentQ.answer) {
      setScore(s => s + 1);
    }
  };

  const nextQuestion = () => {
    if (currentIdx + 1 < quizQuestions.length) {
      setCurrentIdx(i => i + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setIsFinished(true);
    }
  };

  const restart = () => {
    const shuffled = [...questions].sort(() => 0.5 - Math.random());
    setQuizQuestions(shuffled.slice(0, 10));
    setCurrentIdx(0);
    setScore(0);
    setIsFinished(false);
    setSelectedAnswer(null);
    setShowResult(false);
  };

  if (isFinished) {
    const pct = (score / quizQuestions.length) * 100.0;
    let guidance = "";
    if (pct >= 80) { // 8-10 correct
        guidance = "🌟 Outstanding! You have an excellent understanding of these social situations. You're ready to tackle more complex scenarios—try out the Advanced Quiz or test your skills in the Open-Ended Quiz!";
    } else if (pct >= 60) { // 6-7 correct
        guidance = "👍 Great job! You have a solid grasp on how to handle these interactions. If you're unsure about the questions you missed, reviewing the 'Social Skills' section or reading 'Social Stories' could help clarify things.";
    } else if (pct >= 40) { // 4-5 correct
        guidance = "🙂 Good effort! Navigating social rules can be tricky. Try reviewing the 'Social Skills' section or reading some of the 'Social Stories' to build up your confidence, then try again!";
    } else { // 0-3 correct
        guidance = "⚠️ Don't get discouraged! Learning social cues takes time and practice. I recommend checking out the 'Commonly Asked Social Skills Questions' or chatting with 'Someone To Talk To' for some pressure-free practice.";
    }

    return (
      <div className="glass-panel animate-fade-in" style={{ padding: '60px', minHeight: '100%', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <h2 style={{ fontSize: '3.5rem', marginBottom: '20px', color: 'var(--primary)' }}>Quiz Complete! 🎉</h2>
        <h3 style={{ fontSize: '2.5rem', marginBottom: '20px', color: 'var(--text-main)' }}>You scored {score} out of {quizQuestions.length}</h3>
        <p style={{ fontSize: '1.5rem', marginBottom: '50px', color: 'var(--text-main)', maxWidth: '800px', lineHeight: '1.6' }}>{guidance}</p>
        <button className="btn btn-primary" onClick={restart} style={{ fontSize: '1.2rem', padding: '15px 40px' }}>Play Again 🔄</button>
      </div>
    );
  }

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '40px', minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      <h2 style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '2rem' }}>{title}</span>
        <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.5)', padding: '10px 20px', borderRadius: '20px' }}>Question {currentIdx + 1} of {quizQuestions.length}</span>
      </h2>

      <div className="glass-panel" style={{ padding: '40px', background: 'rgba(255,255,255,0.9)', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ marginBottom: '20px', color: 'var(--secondary)', fontSize: '1.4rem' }}>Scenario:</h3>
        <p style={{ marginBottom: '40px', fontSize: '1.5rem', fontWeight: 'bold' }}>{currentQ.context}</p>
        
        <h4 style={{ marginBottom: '20px', fontSize: '1.3rem', color: 'var(--primary)' }}>{currentQ.question}</h4>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
          {currentQ.choices.map((choice, i) => {
            let bgColor = 'rgba(255,255,255,0.9)';
            let borderColor = 'transparent';
            if (showResult) {
              if (choice === currentQ.answer) {
                bgColor = 'rgba(72, 187, 120, 0.2)';
                borderColor = 'var(--success)';
              } else if (choice === selectedAnswer) {
                bgColor = 'rgba(245, 101, 101, 0.2)';
                borderColor = 'red';
              }
            }

            return (
              <button 
                key={i} 
                className="btn hover-effect" 
                style={{ 
                  background: bgColor, 
                  border: `2px solid ${borderColor}`,
                  textAlign: 'left',
                  padding: '20px 25px',
                  fontSize: '1.3rem',
                  color: 'var(--text)',
                  transition: 'all 0.3s ease',
                  cursor: showResult ? 'default' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '20px'
                }}
                onClick={() => handleAnswer(choice)}
              >
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: showResult ? (choice === currentQ.answer ? 'var(--success)' : (choice === selectedAnswer ? '#f56565' : 'rgba(155, 93, 229, 0.2)')) : 'var(--primary)',
                  color: showResult && choice !== currentQ.answer && choice !== selectedAnswer ? 'var(--primary)' : 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '800',
                  fontSize: '1.4rem',
                  flexShrink: 0,
                  boxShadow: showResult ? 'none' : '0 4px 10px rgba(155, 93, 229, 0.3)'
                }}>
                  {String.fromCharCode(65 + i)}
                </div>
                <span style={{ flex: 1, lineHeight: '1.4' }}>{choice}</span>
              </button>
            );
          })}
        </div>

        {showResult && (
          <div className="animate-fade-in glass-panel" style={{ marginTop: '40px', padding: '30px', background: 'rgba(255,255,255,0.9)', border: `2px solid ${selectedAnswer === currentQ.answer ? 'var(--success)' : 'red'}` }}>
            <h4 style={{ color: selectedAnswer === currentQ.answer ? 'var(--success)' : 'red', marginBottom: '15px', fontSize: '1.5rem' }}>
              {selectedAnswer === currentQ.answer ? '🎉 Correct!' : '❌ Incorrect'}
            </h4>
            <p style={{ fontSize: '1.2rem', lineHeight: '1.6', marginBottom: '25px' }}>{currentQ.explanation}</p>
            <button className="btn btn-primary" onClick={nextQuestion} style={{ fontSize: '1.1rem', padding: '12px 30px' }}>
              {currentIdx + 1 < quizQuestions.length ? 'Next Question →' : 'Finish Quiz'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
