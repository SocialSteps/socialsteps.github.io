import React, { useState, useEffect, useRef } from 'react';
import { faq } from '../utils/data';
import { subscribeToSemanticManager, searchSemantic } from '../utils/semanticManager';

export default function FAQ() {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState(faq); // Default to showing all
  const [isReady, setIsReady] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("Initializing AI...");
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  
  const categories = Array.from(new Set(faq.map(item => item.category)));
  
  const debounceRef = useRef(null);

  useEffect(() => {
    const unsubscribe = subscribeToSemanticManager((data) => {
      const { status, results: searchResults, progress, current, total } = data;
      
      switch (status) {
        case 'initializing':
          setLoadingMsg("Loading AI model...");
          break;
        case 'progress':
          if (progress) {
            setLoadingMsg(`Downloading AI model: ${~~(progress.progress)}%`);
          }
          break;
        case 'embedding_corpus':
          setLoadingMsg(`Precomputing knowledge base (0/${total})...`);
          break;
        case 'embedding_progress':
          setLoadingMsg(`Precomputing knowledge base (${current}/${total})...`);
          break;
        case 'ready':
          setIsReady(true);
          setLoadingMsg("");
          break;
        case 'search_result':
          setResults(searchResults.map(r => r.item));
          setIsSearching(false);
          break;
        case 'error':
          console.error("AI Error:", data.error);
          setIsSearching(false);
          break;
        default:
          break;
      }
    });

    return unsubscribe;
  }, []);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchTerm(val);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!val.trim()) {
      setResults(faq);
      setIsSearching(false);
      return;
    }

    if (!isReady) {
      // Fallback to literal search if model is still loading
      setResults(
        faq.filter(item => 
          item.question.toLowerCase().includes(val.toLowerCase()) || 
          item.answer.toLowerCase().includes(val.toLowerCase())
        )
      );
      return;
    }

    setIsSearching(true);
    debounceRef.current = setTimeout(() => {
      searchSemantic(val);
    }, 400); // 400ms debounce
  };

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '40px', minHeight: '100%' }}>
      <h2 style={{ marginBottom: '20px' }}>❓ Commonly Asked Questions</h2>
      
      <div style={{ position: 'relative', marginBottom: '30px' }}>
        <input 
          type="text" 
          className="input-glass"
          placeholder="Search semantically (e.g., 'inclusion')..."
          value={searchTerm}
          onChange={handleSearchChange}
          style={{ width: '100%' }}
        />
        {!isReady && (
          <div style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {loadingMsg}
          </div>
        )}
        {isSearching && isReady && (
          <div style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Searching...
          </div>
        )}
      </div>

      <div className="mobile-nav" style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '30px' }}>
        <button 
          className={`btn ${selectedCategory === 'All' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setSelectedCategory('All')}
          style={{ fontSize: '1rem', borderRadius: '20px', padding: '8px 16px' }}
        >
          All
        </button>
        {categories.map(cat => (
          <button 
            key={cat} 
            className={`btn ${selectedCategory === cat ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setSelectedCategory(cat)}
            style={{ fontSize: '1rem', borderRadius: '20px', padding: '8px 16px' }}
          >
            {cat}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {(selectedCategory === "All" ? results : results.filter(item => item.category === selectedCategory)).map((item) => (
          <div key={item.id} className="glass-panel hover-effect" style={{ padding: '24px', background: 'rgba(255,255,255,0.6)' }}>
            <h4 style={{ color: 'var(--primary)', marginBottom: '10px', fontSize: '1.3rem' }}>{item.question}</h4>
            <p style={{ color: 'var(--text)', lineHeight: '1.6', fontSize: '1.1rem' }}>{item.answer}</p>
            <span style={{ display: 'inline-block', marginTop: '15px', fontSize: '0.85rem', padding: '6px 12px', background: 'var(--secondary)', color: 'white', borderRadius: '20px', fontWeight: 'bold' }}>
              {item.category}
            </span>
          </div>
        ))}
        {(selectedCategory === "All" ? results : results.filter(item => item.category === selectedCategory)).length === 0 && <p>No questions found.</p>}
      </div>
    </div>
  );
}
