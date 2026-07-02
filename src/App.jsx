import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProfileLogin from './components/ProfileLogin';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Chatbot from './pages/Chatbot';
import OpenEndedQuiz from './pages/OpenEndedQuiz';
import FAQ from './pages/FAQ';
import Skills from './pages/Skills';
import Stories from './pages/Stories';
import BasicQuiz from './pages/BasicQuiz';
import AdvancedQuiz from './pages/AdvancedQuiz';
import './index.css';

function AppContent({ profile, setProfile }) {
  if (!profile) {
    return <ProfileLogin onLogin={setProfile} />;
  }

  return (
    <div className="app-container">
      <Sidebar profile={profile} onSignOut={() => setProfile(null)} />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home profile={profile} />} />
          <Route path="/chatbot" element={<Chatbot profile={profile} setProfile={setProfile} />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/skills" element={<Skills />} />
          <Route path="/stories" element={<Stories />} />
          <Route path="/quiz/basic" element={<BasicQuiz profile={profile} />} />
          <Route path="/quiz/advanced" element={<AdvancedQuiz profile={profile} />} />
          <Route path="/quiz/open-ended" element={<OpenEndedQuiz profile={profile} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  const [profile, setProfile] = useState(null);

  return (
    <BrowserRouter>
      <AppContent profile={profile} setProfile={setProfile} />
    </BrowserRouter>
  );
}

export default App;
