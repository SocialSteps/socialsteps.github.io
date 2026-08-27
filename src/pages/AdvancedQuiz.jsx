import React from 'react';
import Quiz from './Quiz';
import { advancedQuiz } from '../utils/data';

export default function AdvancedQuiz({ profile, gamification }) {
  return <Quiz title="🔴 Advanced Social Skills Quiz" questions={advancedQuiz} profile={profile} gamification={gamification} />;
}
