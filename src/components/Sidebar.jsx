import React from 'react';
import { NavLink } from 'react-router-dom';
import { MessageCircle, HelpCircle, Star, BookOpen, Puzzle, Brain, PenTool, LogOut, UserCircle2 } from 'lucide-react';

export default function Sidebar({ profile, onSignOut }) {
  const navItems = [
    { to: "/", icon: Star, label: "Welcome" },
    { to: "/chatbot", icon: MessageCircle, label: "Someone To Talk To" },
    { to: "/faq", icon: HelpCircle, label: "FAQ" },
    { to: "/skills", icon: Star, label: "Social Skills" },
    { to: "/stories", icon: BookOpen, label: "Social Stories" },
    { to: "/quiz/basic", icon: Puzzle, label: "Basic Quiz" },
    { to: "/quiz/advanced", icon: Brain, label: "Advanced Quiz" },
    { to: "/quiz/open-ended", icon: PenTool, label: "Open-Ended Quiz" },
  ];

  return (
    <div className="sidebar glass-panel">
      <div className="profile-header" style={{ textAlign: 'center', marginBottom: '30px' }}>
        <div style={{ 
          width: '80px', 
          height: '80px', 
          borderRadius: '50%', 
          background: 'linear-gradient(45deg, var(--primary), var(--secondary))',
          margin: '0 auto 10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white'
        }}>
          <UserCircle2 size={48} />
        </div>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '5px' }}>{profile?.name || 'Guest'}</h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Current Profile</p>
      </div>

      <nav className="mobile-nav" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <item.icon size={20} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
        <button 
          onClick={onSignOut} 
          className="btn btn-secondary" 
          style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '10px' }}
        >
          <LogOut size={20} />
          Sign Out
        </button>
      </div>
    </div>
  );
}
