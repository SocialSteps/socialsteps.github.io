import React, { useState } from 'react';
import { faq } from '../utils/data';

export default function FAQ() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredFaq = faq.filter(item => 
    item.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '40px', minHeight: '100%' }}>
      <h2 style={{ marginBottom: '20px' }}>❓ Commonly Asked Questions</h2>
      
      <input 
        type="text" 
        className="input-glass"
        placeholder="Search questions..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        style={{ width: '100%', marginBottom: '30px' }}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {filteredFaq.map((item) => (
          <div key={item.id} className="glass-panel hover-effect" style={{ padding: '24px', background: 'rgba(255,255,255,0.6)' }}>
            <h4 style={{ color: 'var(--primary)', marginBottom: '10px', fontSize: '1.3rem' }}>{item.question}</h4>
            <p style={{ color: 'var(--text)', lineHeight: '1.6', fontSize: '1.1rem' }}>{item.answer}</p>
            <span style={{ display: 'inline-block', marginTop: '15px', fontSize: '0.85rem', padding: '6px 12px', background: 'var(--secondary)', color: 'white', borderRadius: '20px', fontWeight: 'bold' }}>
              {item.category}
            </span>
          </div>
        ))}
        {filteredFaq.length === 0 && <p>No questions found.</p>}
      </div>
    </div>
  );
}
