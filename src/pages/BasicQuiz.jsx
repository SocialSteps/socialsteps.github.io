import React from 'react';
import Quiz from './Quiz';
import { basicQuiz } from '../utils/data';

export default function BasicQuiz({ profile }) {
  return <Quiz title="🟢 Basic Social Skills Quiz" questions={basicQuiz} profile={profile} />;
}
