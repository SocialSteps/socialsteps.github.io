import React from 'react';
import { Star, MessageCircle, Puzzle, HelpCircle, BookOpen, Brain, PenTool } from 'lucide-react';
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginTop: '20px' }}>
        
        <div className="glass-panel hover-effect" style={{ padding: '24px', border: 'none', background: 'rgba(255,255,255,0.8)', cursor: 'pointer' }} onClick={() => navigate('/chatbot')}>
          <MessageCircle size={40} color="var(--primary)" style={{ marginBottom: '16px' }} />
          <h3>Someone To Talk To</h3>
          <p>Talk to someone who listens, explains social concepts, and offers emotional support whenever you need it.</p>
        </div>

        <div className="glass-panel hover-effect" style={{ padding: '24px', border: 'none', background: 'rgba(255,255,255,0.8)', cursor: 'pointer' }} onClick={() => navigate('/faq')}>
          <HelpCircle size={40} color="var(--secondary)" style={{ marginBottom: '16px' }} />
          <h3>FAQ</h3>
          <p>Search and read through commonly asked questions about social interactions.</p>
        </div>

        <div className="glass-panel hover-effect" style={{ padding: '24px', border: 'none', background: 'rgba(255,255,255,0.8)', cursor: 'pointer' }} onClick={() => navigate('/skills')}>
          <Star size={40} color="var(--accent)" style={{ marginBottom: '16px' }} />
          <h3>Social Skills</h3>
          <p>Learn core skills like empathy, active listening, and teamwork with real-life examples.</p>
        </div>

        <div className="glass-panel hover-effect" style={{ padding: '24px', border: 'none', background: 'rgba(255,255,255,0.8)', cursor: 'pointer' }} onClick={() => navigate('/stories')}>
          <BookOpen size={40} color="var(--primary)" style={{ marginBottom: '16px' }} />
          <h3>Social Stories</h3>
          <p>Read through helpful social stories that guide you through everyday situations.</p>
        </div>

        <div className="glass-panel hover-effect" style={{ padding: '24px', border: 'none', background: 'rgba(255,255,255,0.8)', cursor: 'pointer' }} onClick={() => navigate('/quiz/basic')}>
          <Puzzle size={40} color="var(--secondary)" style={{ marginBottom: '16px' }} />
          <h3>Basic Quiz</h3>
          <p>Test your fundamental knowledge of social skills with multiple-choice questions.</p>
        </div>

        <div className="glass-panel hover-effect" style={{ padding: '24px', border: 'none', background: 'rgba(255,255,255,0.8)', cursor: 'pointer' }} onClick={() => navigate('/quiz/advanced')}>
          <Brain size={40} color="var(--accent)" style={{ marginBottom: '16px' }} />
          <h3>Advanced Quiz</h3>
          <p>Challenge yourself with complex, multi-step social scenarios.</p>
        </div>

        <div className="glass-panel hover-effect" style={{ padding: '24px', border: 'none', background: 'rgba(255,255,255,0.8)', cursor: 'pointer' }} onClick={() => navigate('/quiz/open-ended')}>
          <PenTool size={40} color="var(--primary)" style={{ marginBottom: '16px' }} />
          <h3>Open-Ended Quiz</h3>
          <p>Practice responding to social scenarios using your own words.</p>
        </div>

      </div>
    </div>
  );
}
