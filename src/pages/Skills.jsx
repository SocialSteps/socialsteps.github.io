import React, { useState } from 'react';
import { socialSkills } from '../utils/data';

export default function Skills() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredSkills = socialSkills.filter(s => s.skill.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '40px', minHeight: '100%' }}>
      <h2 style={{ marginBottom: '20px' }}>🌟 Social Skills</h2>
      <input 
        type="text" 
        className="input-glass"
        placeholder="Search skills..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        style={{ width: '100%', marginBottom: '30px' }}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
        {filteredSkills.map((item, idx) => (
          <div key={idx} className="glass-panel" style={{ padding: '30px', background: 'rgba(255,255,255,0.7)' }}>
            <h3 style={{ color: 'var(--primary)', marginBottom: '15px', fontSize: '1.8rem' }}>{item.skill}</h3>
            <p style={{ fontSize: '1.2rem', marginBottom: '25px', fontStyle: 'italic', color: 'var(--text-muted)' }}>{item.definition}</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '25px', marginBottom: '25px' }}>
              <div className="glass-panel" style={{ background: 'rgba(255,255,255,0.9)', padding: '20px' }}>
                <h4 style={{ color: 'var(--secondary)', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>✨ Examples</h4>
                <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {item.examples.map((ex, i) => <li key={i} style={{ fontSize: '1.1rem' }}>{ex}</li>)}
                </ul>
              </div>
              <div className="glass-panel" style={{ background: 'rgba(255,255,255,0.9)', padding: '20px' }}>
                <h4 style={{ color: 'var(--secondary)', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>💡 Why it matters</h4>
                <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {item.why_it_matters.map((reason, i) => <li key={i} style={{ fontSize: '1.1rem' }}>{reason}</li>)}
                </ul>
              </div>
            </div>

            {item.youtube_url && (
              <div style={{ marginTop: '20px', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
                <iframe 
                  width="100%" 
                  height="400" 
                  src={item.youtube_url} 
                  title={item.skill} 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                  loading="lazy"
                ></iframe>
              </div>
            )}
          </div>
        ))}
        {filteredSkills.length === 0 && <p>No skills found.</p>}
      </div>
    </div>
  );
}
