import React, { useState, useEffect, useRef } from 'react';
import { Cat, Dog, Rabbit, Bird, Turtle, Snail, Fish, Bug, UserCircle2 } from 'lucide-react';

const animals = [
  { id: 'cat', icon: Cat, label: 'Cat' },
  { id: 'dog', icon: Dog, label: 'Dog' },
  { id: 'rabbit', icon: Rabbit, label: 'Rabbit' },
  { id: 'bird', icon: Bird, label: 'Bird' },
  { id: 'turtle', icon: Turtle, label: 'Turtle' },
  { id: 'snail', icon: Snail, label: 'Snail' },
  { id: 'fish', icon: Fish, label: 'Fish' },
  { id: 'bug', icon: Bug, label: 'Bug' },
];

const colors = [
  { id: 'red', color: '#ff595e' },
  { id: 'orange', color: '#ffca3a' },
  { id: 'green', color: '#8ac926' },
  { id: 'blue', color: '#1982c4' },
  { id: 'purple', color: '#6a4c93' },
  { id: 'pink', color: '#ffb5a7' },
];

const commonLikes = ['Playing video games', 'Reading books', 'Drawing', 'Listening to music', 'Playing sports', 'Watching movies', 'Building with legos', 'Playing with animals'];
const commonStrengths = ['Being a good friend', 'Following rules', 'Listening to others', 'Being creative', 'Solving puzzles', 'Being honest', 'Sharing', 'Being kind'];
const commonWeaknesses = ['Talking too loud', 'Getting frustrated easily', 'Waiting for my turn', 'Making eye contact', 'Trying new things', 'Focusing for a long time', 'Sitting still'];

export default function ProfileLogin({ onLogin }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [likes, setLikes] = useState('');
  const [strengths, setStrengths] = useState('');
  const [weaknesses, setWeaknesses] = useState('');
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [error, setError] = useState('');
  const [activeInput, setActiveInput] = useState(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const migrateProfiles = async () => {
      const stored = localStorage.getItem('socialsteps_profiles');
      if (stored) {
        try {
          const profiles = JSON.parse(stored);
          for (const key in profiles) {
            const p = profiles[key];
            const passwordKey = `${p.name.toLowerCase().trim()}-${p.animal}-${p.color}`;
            await fetch('/api/profiles/register', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ...p, passwordKey })
            });
            if (p.notes) {
              await fetch(`/api/profiles/${passwordKey}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ notes: p.notes })
              });
            }
          }
          localStorage.removeItem('socialsteps_profiles');
          console.log("Migration complete");
        } catch (e) {
          console.error("Failed to migrate profiles", e);
        }
      }
    };
    migrateProfiles();

    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setActiveInput(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getFilteredOptions = (options, value) => {
    if (!value) return options;
    return options.filter(opt => opt.toLowerCase().includes(value.toLowerCase()));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter your name!');
      return;
    }

    if (!selectedAnimal || !selectedColor) {
      setError('Please select both a secret animal and a secret color!');
      return;
    }

    const passwordKey = `${name.toLowerCase().trim()}-${selectedAnimal}-${selectedColor}`;

    try {
      if (isRegistering) {
        const res = await fetch('/api/profiles/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            passwordKey,
            name,
            age,
            likes,
            strengths,
            weaknesses,
            animal: selectedAnimal,
            color: selectedColor
          })
        });
        if (!res.ok) throw new Error("Failed to register");
        const newProfile = await res.json();
        onLogin(newProfile);
      } else {
        const res = await fetch('/api/profiles/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ passwordKey })
        });
        
        if (res.ok) {
          const profile = await res.json();
          onLogin(profile);
        } else if (res.status === 404) {
          setError("We couldn't find a profile with that animal and color. Try again or create a new profile.");
        } else {
          throw new Error("Failed to login");
        }
      }
    } catch (err) {
      setError("Server error: " + err.message);
    }
  };

  return (
    <div className="glass-panel" style={{ maxWidth: '600px', margin: '100px auto', padding: '40px', textAlign: 'center' }}>
      <h1>{isRegistering ? 'Create a Profile' : 'Welcome Back!'}</h1>
      <p style={{ marginBottom: '30px' }}>
        {isRegistering 
          ? "Let's set up your secret animal and color. You will use these to log in!" 
          : "Choose your secret animal and color to log in."}
      </p>

      {error && <div style={{ color: 'var(--secondary)', marginBottom: '20px', fontWeight: 'bold' }}>{error}</div>}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ color: 'var(--primary)' }}>What is your name?</h3>
          <input 
            type="text" 
            className="input-glass"
            placeholder="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ width: '100%', maxWidth: '400px', textAlign: 'center', display: 'block', margin: '0 auto' }}
          />
        </div>

        {isRegistering && (
          <div ref={wrapperRef} style={{ marginBottom: '30px', display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'center' }}>
            <h3 style={{ color: 'var(--primary)' }}>Tell us more about yourself!</h3>
            <input 
              type="text" 
              className="input-glass"
              placeholder="Your Age"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}
            />
            <div style={{ width: '100%', maxWidth: '400px', position: 'relative' }}>
              <input 
                type="text" 
                className="input-glass"
                placeholder="What do you like to do? (Likes)"
                value={likes}
                onChange={(e) => setLikes(e.target.value)}
                onFocus={() => setActiveInput('likes')}
                style={{ width: '100%', textAlign: 'center', marginBottom: activeInput === 'likes' ? '15px' : '0' }}
              />
              {activeInput === 'likes' && (
                <div className="suggestions-container animate-fade-in">
                  {getFilteredOptions(commonLikes, likes).map((item, idx) => (
                    <button key={idx} type="button" className="suggestion-pill" onClick={() => setLikes(item)}>{item}</button>
                  ))}
                </div>
              )}
            </div>

            <div style={{ width: '100%', maxWidth: '400px', position: 'relative' }}>
              <input 
                type="text" 
                className="input-glass"
                placeholder="Your Strengths"
                value={strengths}
                onChange={(e) => setStrengths(e.target.value)}
                onFocus={() => setActiveInput('strengths')}
                style={{ width: '100%', textAlign: 'center', marginBottom: activeInput === 'strengths' ? '15px' : '0' }}
              />
              {activeInput === 'strengths' && (
                <div className="suggestions-container animate-fade-in">
                  {getFilteredOptions(commonStrengths, strengths).map((item, idx) => (
                    <button key={idx} type="button" className="suggestion-pill" onClick={() => setStrengths(item)}>{item}</button>
                  ))}
                </div>
              )}
            </div>

            <div style={{ width: '100%', maxWidth: '400px', position: 'relative' }}>
              <input 
                type="text" 
                className="input-glass"
                placeholder="Things to improve on (Weaknesses)"
                value={weaknesses}
                onChange={(e) => setWeaknesses(e.target.value)}
                onFocus={() => setActiveInput('weaknesses')}
                style={{ width: '100%', textAlign: 'center', marginBottom: activeInput === 'weaknesses' ? '15px' : '0' }}
              />
              {activeInput === 'weaknesses' && (
                <div className="suggestions-container animate-fade-in">
                  {getFilteredOptions(commonWeaknesses, weaknesses).map((item, idx) => (
                    <button key={idx} type="button" className="suggestion-pill" onClick={() => setWeaknesses(item)}>{item}</button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ color: 'var(--primary)' }}>1. Pick an Animal</h3>
          <div className="selection-grid">
            {animals.map((animal) => {
              const Icon = animal.icon;
              const isSelected = selectedAnimal === animal.id;
              return (
                <div 
                  key={animal.id}
                  className={`selection-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => setSelectedAnimal(animal.id)}
                  style={{ color: isSelected ? 'var(--primary)' : 'var(--text-main)' }}
                >
                  <Icon size={48} strokeWidth={isSelected ? 2.5 : 1.5} />
                  <span>{animal.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ marginBottom: '40px' }}>
          <h3 style={{ color: 'var(--primary)' }}>2. Pick a Color</h3>
          <div className="selection-grid" style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
            {colors.map((color) => {
              const isSelected = selectedColor === color.id;
              return (
                <div 
                  key={color.id}
                  onClick={() => setSelectedColor(color.id)}
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    backgroundColor: color.color,
                    cursor: 'pointer',
                    border: isSelected ? '4px solid white' : '4px solid transparent',
                    boxShadow: isSelected ? `0 0 0 4px ${color.color}, 0 8px 16px rgba(0,0,0,0.2)` : '0 4px 8px rgba(0,0,0,0.1)',
                    transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                    transition: 'all 0.2s ease'
                  }}
                />
              );
            })}
          </div>
        </div>

        <button type="submit" className="btn btn-primary" style={{ fontSize: '1.2rem', padding: '16px 40px' }}>
          {isRegistering ? 'Create Profile & Login' : 'Login'}
        </button>
      </form>

      <div style={{ marginTop: '30px' }}>
        <button 
          type="button" 
          className="btn btn-secondary" 
          onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
        >
          {isRegistering ? 'I already have a profile' : 'I need to create a new profile'}
        </button>
      </div>
    </div>
  );
}
