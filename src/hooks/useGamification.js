import { useCallback } from 'react';

const API_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export function useGamification(profile, setProfile) {
  const initGamification = useCallback(async () => {
    if (!profile) return;
    const today = new Date().toISOString().split('T')[0];
    let newStreak = profile.streak || 0;
    
    if (profile.lastActiveDate !== today) {
      if (profile.lastActiveDate) {
        const lastDate = new Date(profile.lastActiveDate);
        const currentDate = new Date(today);
        const diffTime = Math.abs(currentDate - lastDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        
        if (diffDays === 1) {
          newStreak += 1;
        } else {
          newStreak = 1;
        }
      } else {
        newStreak = 1; // First day
      }
      
      const updated = { ...profile, streak: newStreak, lastActiveDate: today };
      setProfile(updated);
      
      try {
        await fetch(`${API_URL}/profiles/${profile.passwordKey}/gamification`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ streak: newStreak, lastActiveDate: today })
        });
      } catch (e) {
        console.error("Failed to sync gamification", e);
      }
    }
  }, [profile, setProfile]);

  const addXP = useCallback(async (amount) => {
    if (!profile) return;
    const newXP = (profile.xp || 0) + amount;
    const updated = { ...profile, xp: newXP };
    setProfile(updated);
    
    try {
      await fetch(`${API_URL}/profiles/${profile.passwordKey}/gamification`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ xp: newXP })
      });
    } catch(e) {
       console.error(e);
    }
  }, [profile, setProfile]);

  const unlockBadge = useCallback(async (badgeName) => {
    if (!profile) return false;
    let badges = [];
    try {
      badges = JSON.parse(profile.badges || '[]');
    } catch(e) {}
    
    if (!badges.includes(badgeName)) {
      badges.push(badgeName);
      const newBadgesStr = JSON.stringify(badges);
      const updated = { ...profile, badges: newBadgesStr };
      setProfile(updated);
      
      try {
        await fetch(`${API_URL}/profiles/${profile.passwordKey}/gamification`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ badges: newBadgesStr })
        });
      } catch(e) {
        console.error(e);
      }
      return true; // Unlocked just now
    }
    return false; // Already had it
  }, [profile, setProfile]);

  const incrementStat = useCallback(async (statName) => {
    if (!profile) return 0;
    let stats = {};
    try {
      stats = JSON.parse(profile.stats || '{}');
    } catch(e) {}
    
    stats[statName] = (stats[statName] || 0) + 1;
    const newStatsStr = JSON.stringify(stats);
    const updated = { ...profile, stats: newStatsStr };
    setProfile(updated);
    
    try {
      await fetch(`${API_URL}/profiles/${profile.passwordKey}/gamification`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stats: newStatsStr })
      });
    } catch(e) {
      console.error(e);
    }
    return stats[statName];
  }, [profile, setProfile]);

  return { initGamification, addXP, unlockBadge, incrementStat };
}
