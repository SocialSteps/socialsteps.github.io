import React from 'react';
import { Star, MessageCircle, Puzzle, HelpCircle, BookOpen, Brain, PenTool, Trophy, Zap, Flame, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Home({ profile }) {
  const navigate = useNavigate();

  let badges = [];
  try { badges = JSON.parse(profile?.badges || '[]'); } catch(e) {}

  const badgeDefinitions = [
    { id: 'Perfect Score', icon: <Award size={32} />, desc: 'Score 100% on a quiz' },
    { id: 'Curious Learner', icon: <Brain size={32} />, desc: 'Use Explain More 5 times' }
  ];

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: '30px', minHeight: '100%', height: 'max-content' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>Welcome to SocialSteps, {profile?.name || 'Friend'}! 🌟</h1>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>
            Learn important social skills through guided lessons, practice, and friendly conversation.
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '15px' }}>
          <div className="glass-panel" style={{ padding: '15px 25px', display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.9)' }}>
            <Flame color="#f56565" size={28} />
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-main)' }}>{profile?.streak || 0} Days</div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Current Streak</div>
            </div>
          </div>
          
          <div className="glass-panel" style={{ padding: '15px 25px', display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.9)' }}>
            <Zap color="#ecc94b" size={28} />
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-main)' }}>{profile?.xp || 0} XP</div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Total Experience</div>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '30px', background: 'rgba(155, 93, 229, 0.05)', border: '2px solid rgba(155, 93, 229, 0.2)' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', color: 'var(--primary)' }}>
          <Trophy size={28} /> Trophy Case
        </h3>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          {badgeDefinitions.map(b => {
            const isUnlocked = badges.includes(b.id);
            return (
              <div key={b.id} style={{ 
                padding: '15px', 
                background: isUnlocked ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.4)',
                opacity: isUnlocked ? 1 : 0.6,
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
                minWidth: '250px',
                border: isUnlocked ? '2px solid var(--accent)' : '2px dashed #cbd5e0'
              }}>
                <div style={{ color: isUnlocked ? 'var(--accent)' : '#a0aec0' }}>
                  {b.icon}
                </div>
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: isUnlocked ? 'var(--text-main)' : '#718096' }}>{b.id}</div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{b.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
        
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
