import React from 'react';
import { Star, MessageCircle, Puzzle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Home({ profile }) {
  const navigate = useNavigate();

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
      <div>
        <h1>Welcome to SocialSteps, {profile?.name || 'Friend'}! 🌟</h1>
        <p style={{ fontSize: '1.2rem', marginTop: '10px' }}>
          SocialSteps is an app designed to help you learn important social skills through guided lessons, practice, and friendly conversation.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginTop: '20px' }}>
        
        <div className="glass-panel" style={{ padding: '24px', border: 'none', background: 'rgba(255,255,255,0.8)' }}>
          <MessageCircle size={40} color="var(--primary)" style={{ marginBottom: '16px' }} />
          <h3>Someone To Talk To</h3>
          <p>Talk to someone who listens, explains social concepts, and offers emotional support whenever you need it.</p>
          <button className="btn btn-primary" style={{ marginTop: '16px' }} onClick={() => navigate('/chatbot')}>
            Start Talking
          </button>
        </div>

        <div className="glass-panel" style={{ padding: '24px', border: 'none', background: 'rgba(255,255,255,0.8)' }}>
          <Star size={40} color="var(--secondary)" style={{ marginBottom: '16px' }} />
          <h3>Learn Skills</h3>
          <p>Learn core skills like empathy, active listening, and teamwork with real-life examples.</p>
          <button className="btn btn-primary" style={{ marginTop: '16px', background: 'var(--secondary)' }} onClick={() => navigate('/skills')}>
            View Skills
          </button>
        </div>

        <div className="glass-panel" style={{ padding: '24px', border: 'none', background: 'rgba(255,255,255,0.8)' }}>
          <Puzzle size={40} color="var(--accent)" style={{ marginBottom: '16px' }} />
          <h3>Practice & Quizzes</h3>
          <p>Test your knowledge with Basic, Advanced, and Open-Ended quizzes tailored to you.</p>
          <button className="btn btn-primary" style={{ marginTop: '16px', background: 'var(--accent)' }} onClick={() => navigate('/quiz/basic')}>
            Take a Quiz
          </button>
        </div>

      </div>
    </div>
  );
}
