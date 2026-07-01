import React, { useState } from 'react';
import { socialStories } from '../utils/data';

export default function Stories() {
  const [selectedStory, setSelectedStory] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);

  if (selectedStory) {
    return (
      <div className="glass-panel animate-fade-in" style={{ padding: '40px', minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
        <button className="btn btn-secondary" onClick={() => setSelectedStory(null)} style={{ alignSelf: 'flex-start', marginBottom: '20px' }}>
          ← Back to Stories
        </button>
        <h2 style={{ textAlign: 'center', marginBottom: '40px', color: 'var(--primary)', fontSize: '2.5rem' }}>{selectedStory.title}</h2>
        
        <div className="glass-panel" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.9)', padding: '60px', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.05)' }}>
          <p style={{ fontSize: '2rem', textAlign: 'center', lineHeight: '1.6', color: 'var(--text)' }}>
            {selectedStory.pages[currentPage]}
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '40px' }}>
          <button 
            className="btn btn-primary" 
            disabled={currentPage === 0} 
            onClick={() => setCurrentPage(p => p - 1)}
            style={{ width: '150px' }}
          >
            Previous
          </button>
          <span style={{ fontSize: '1.3rem', fontWeight: 'bold', color: 'var(--text-muted)' }}>Page {currentPage + 1} of {selectedStory.pages.length}</span>
          <button 
            className="btn btn-primary" 
            disabled={currentPage === selectedStory.pages.length - 1} 
            onClick={() => setCurrentPage(p => p + 1)}
            style={{ width: '150px' }}
          >
            Next
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '40px', minHeight: '100%' }}>
      <h2 style={{ marginBottom: '40px', textAlign: 'center', fontSize: '2.5rem' }}>📚 Social Stories</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '30px' }}>
        {socialStories.map((story, idx) => (
          <div 
            key={idx} 
            className="glass-panel hover-effect" 
            style={{ padding: '30px', cursor: 'pointer', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '180px', background: 'rgba(255,255,255,0.7)' }}
            onClick={() => {
              setSelectedStory(story);
              setCurrentPage(0);
            }}
          >
            <h3 style={{ color: 'var(--primary)', fontSize: '1.5rem', lineHeight: '1.4' }}>{story.title}</h3>
          </div>
        ))}
      </div>
    </div>
  );
}
