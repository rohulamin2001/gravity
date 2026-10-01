import React, { useState, useEffect } from 'react';
import { X, Trophy, Sparkles, CheckCircle2, XCircle, ArrowRight, RotateCcw, HelpCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function MapQuiz({
  isOpen,
  onClose,
  districts = [],
  heritageData = {},
  onHighlightDistrict,
  onClearHighlight
}) {
  const [currentRound, setCurrentRound] = useState(1);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [targetDistrict, setTargetDistrict] = useState(null);
  const [questionType, setQuestionType] = useState('name'); // 'name' | 'food' | 'spot'
  const [feedback, setFeedback] = useState(null); // { isCorrect: boolean, clickedName: string }
  const [totalQuestions, setTotalQuestions] = useState(5);
  const [isGameOver, setIsGameOver] = useState(false);

  // Generate a new random question
  const pickNewQuestion = () => {
    if (districts.length === 0) return;
    setFeedback(null);
    onClearHighlight();

    // Random district
    const randDist = districts[Math.floor(Math.random() * districts.length)];
    const heritage = heritageData[randDist.id] || {};

    // Determine question type depending on data availability
    const types = ['name'];
    if (heritage.famous_food) types.push('food');
    if (heritage.tourist_spots && heritage.tourist_spots.length > 0) types.push('spot');

    const chosenType = types[Math.floor(Math.random() * types.length)];
    setTargetDistrict(randDist);
    setQuestionType(chosenType);
  };

  // Start / Reset Quiz
  const startQuiz = () => {
    setScore(0);
    setStreak(0);
    setCurrentRound(1);
    setIsGameOver(false);
    pickNewQuestion();
  };

  useEffect(() => {
    if (isOpen) {
      startQuiz();
    } else {
      onClearHighlight();
      setFeedback(null);
    }
  }, [isOpen]);

  // Method called from App.jsx when user clicks a district on the map
  // We expose this through a custom handler or useEffect
  // We can attach a global quiz click handler
  useEffect(() => {
    window.__handleQuizMapClick = (clickedDistrict) => {
      if (!isOpen || isGameOver || feedback !== null || !targetDistrict) return;

      const isCorrect = clickedDistrict.id === targetDistrict.id;

      if (isCorrect) {
        // Confetti burst 🎉
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
        setScore(prev => prev + 10 + streak * 2);
        setStreak(prev => prev + 1);
        onHighlightDistrict(targetDistrict.id, 'correct');
        setFeedback({
          isCorrect: true,
          message: `অসাধারণ! সঠিক উত্তর: ${targetDistrict.bn_name} জেলা। (+${10 + streak * 2} পয়েন্ট)`
        });
      } else {
        setStreak(0);
        onHighlightDistrict(targetDistrict.id, 'reveal');
        setFeedback({
          isCorrect: false,
          message: `ভুল হয়েছে! আপনি ক্লিক করেছেন "${clickedDistrict.bn_name}", সঠিক উত্তর হলো "${targetDistrict.bn_name}" জেলা।`
        });
      }
    };

    return () => {
      delete window.__handleQuizMapClick;
    };
  }, [isOpen, isGameOver, feedback, targetDistrict, streak]);

  const handleNext = () => {
    if (currentRound >= totalQuestions) {
      setIsGameOver(true);
      onClearHighlight();
    } else {
      setCurrentRound(prev => prev + 1);
      pickNewQuestion();
    }
  };

  if (!isOpen) return null;

  const targetHeritage = targetDistrict ? (heritageData[targetDistrict.id] || {}) : {};

  // Construct Bengali question text
  let questionPrompt = '';
  if (questionType === 'food' && targetHeritage.famous_food) {
    questionPrompt = `বিখ্যাত "${targetHeritage.famous_food}" কোন জেলার ঐতিহ্য? ম্যাপে সেই জেলাটি খুঁজে ক্লিক করুন!`;
  } else if (questionType === 'spot' && targetHeritage.tourist_spots?.[0]) {
    questionPrompt = `বিখ্যাত দর্শনীয় স্থান "${targetHeritage.tourist_spots[0]}" কোন জেলায় অবস্থিত? ম্যাপে ক্লিক করুন!`;
  } else if (targetDistrict) {
    questionPrompt = `মানচিত্রে "${targetDistrict.bn_name}" (${targetDistrict.name}) জেলাটি কোথায়? খুঁজে ক্লিক করুন!`;
  }

  return (
    <div className="quiz-hud-container" id="quiz-hud-panel">
      {/* Quiz Top Bar */}
      <div className="quiz-hud-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Trophy size={18} color="#f59e0b" />
          <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>বাংলাদেশ চিনুন কুইজ</span>
          <span className="quiz-round-tag">রাউন্ড {currentRound}/{totalQuestions}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="quiz-score-pill">
            <Sparkles size={14} color="#facc15" />
            <span>স্কোর: {score}</span>
          </div>

          {streak > 1 && (
            <span className="quiz-streak-tag">🔥 {streak}x স্ট্রিক!</span>
          )}

          <button className="sidebar-close-btn" onClick={onClose} title="কুইজ বন্ধ করুন">
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Quiz Body */}
      <div className="quiz-hud-body">
        {!isGameOver ? (
          <>
            <div className="quiz-question-box">
              <HelpCircle size={20} color="var(--accent-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <p className="quiz-prompt-text">{questionPrompt}</p>
            </div>

            {/* Answer Feedback Alert */}
            {feedback && (
              <div className={`quiz-feedback-box ${feedback.isCorrect ? 'correct' : 'wrong'}`}>
                {feedback.isCorrect ? (
                  <CheckCircle2 size={18} color="#10b981" />
                ) : (
                  <XCircle size={18} color="#ef4444" />
                )}
                <span style={{ flex: 1 }}>{feedback.message}</span>
                <button
                  className="action-btn primary-glow-btn"
                  onClick={handleNext}
                  style={{ padding: '4px 12px', fontSize: '0.8rem' }}
                >
                  <span>{currentRound >= totalQuestions ? 'ফলাফল দেখুন' : 'পরবর্তী প্রশ্ন'}</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            )}
          </>
        ) : (
          /* Game Over Summary Card */
          <div className="quiz-gameover-card">
            <Trophy size={42} color="#f59e0b" />
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700 }}>কুইজ সমাপ্ত!</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              আপনি {totalQuestions}টি প্রশ্নের মধ্যে অর্জন করেছেন <strong>{score}</strong> পয়েন্ট!
            </p>
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button className="action-btn primary-glow-btn" onClick={startQuiz}>
                <RotateCcw size={15} />
                <span>আবার খেলুন</span>
              </button>
              <button className="action-btn" onClick={onClose}>
                বন্ধ করুন
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
