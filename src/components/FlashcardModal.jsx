import React, { useState, useEffect } from 'react';
import { Volume2, X, ChevronLeft, ChevronRight, RotateCw, CheckCircle2, Circle } from 'lucide-react';
import { toggleWordMemorized } from '../firebase';
import { useAuth } from '../context/AuthContext';

export default function FlashcardModal({ isOpen, onClose, words = [] }) {
  const { user } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(0);
      setIsFlipped(false);
    }
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.code === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, words]);

  if (!isOpen || words.length === 0) return null;

  const currentWord = words[currentIndex] || words[0];

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1 < words.length ? prev + 1 : 0));
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 >= 0 ? prev - 1 : words.length - 1));
  };

  const handleSpeak = (e, text) => {
    e.stopPropagation();
    if (!text) return;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleToggleCurrentWordMemorized = async (e) => {
    e.stopPropagation();
    if (!user || !currentWord) return;
    try {
      await toggleWordMemorized(user.uid, currentWord.id, currentWord.memorized);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl flex flex-col items-center">
        {/* Top Controls */}
        <div className="w-full flex items-center justify-between text-white mb-4 px-2">
          <div className="text-xs font-semibold tracking-wide bg-white/10 px-3 py-1 rounded-full border border-white/10">
            카드 {currentIndex + 1} / {words.length}
          </div>
          <div className="text-xs text-slate-300 hidden sm:block">
            <kbd className="px-1.5 py-0.5 bg-white/20 rounded">Space</kbd> 뒤집기 &middot;{' '}
            <kbd className="px-1.5 py-0.5 bg-white/20 rounded">←</kbd>{' '}
            <kbd className="px-1.5 py-0.5 bg-white/20 rounded">→</kbd> 이동
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/70 hover:text-white rounded-full hover:bg-white/10 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 3D Flip Card Container */}
        <div
          onClick={() => setIsFlipped(!isFlipped)}
          className="w-full h-80 sm:h-96 cursor-pointer select-none perspective-1000"
        >
          <div
            className={`relative w-full h-full duration-500 transform-style-preserve-3d transition-transform ${
              isFlipped ? 'rotate-y-180' : ''
            }`}
          >
            {/* FRONT OF CARD (Word) */}
            <div className="absolute inset-0 w-full h-full bg-white rounded-3xl shadow-2xl p-8 flex flex-col justify-between backface-hidden border border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600">
                  {currentWord.category || '기본'} &middot; {currentWord.partOfSpeech || '단어'}
                </span>
                <button
                  onClick={(e) => handleSpeak(e, currentWord.word)}
                  className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition"
                  title="발음 듣기"
                >
                  <Volume2 className="w-6 h-6" />
                </button>
              </div>

              <div className="text-center my-auto">
                <h3 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
                  {currentWord.word}
                </h3>
                <p className="text-xs text-slate-400 mt-4 flex items-center justify-center gap-1">
                  <RotateCw className="w-3.5 h-3.5" /> 클릭하거나 스페이스바로 뜻 확인
                </p>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-100">
                <span>앞면 (단어)</span>
                <span>{currentWord.memorized ? '암기 완료됨' : '학습 진행중'}</span>
              </div>
            </div>

            {/* BACK OF CARD (Meaning & Example) */}
            <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-3xl shadow-2xl p-8 flex flex-col justify-between backface-hidden rotate-y-180 border border-indigo-700/50">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                  {currentWord.partOfSpeech}
                </span>
                <button
                  onClick={(e) => handleSpeak(e, currentWord.word)}
                  className="p-2 text-indigo-200 hover:text-white hover:bg-white/10 rounded-xl transition"
                  title="발음 듣기"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
              </div>

              <div className="text-center my-auto space-y-4">
                <div className="text-xs font-mono text-indigo-300 uppercase tracking-widest">
                  {currentWord.word}
                </div>
                <h4 className="text-2xl sm:text-3xl font-extrabold text-white">
                  {currentWord.meaning}
                </h4>

                {currentWord.example && (
                  <div className="bg-white/10 rounded-2xl p-4 text-xs max-w-md mx-auto text-left border border-white/10">
                    <p className="italic text-indigo-100">"{currentWord.example}"</p>
                    {currentWord.exampleTranslation && (
                      <p className="text-slate-300 mt-1">{currentWord.exampleTranslation}</p>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-xs text-indigo-300 pt-3 border-t border-white/10">
                <span>뒷면 (뜻 & 예문)</span>
                <span>클릭하여 다시 단어 보기</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="w-full flex items-center justify-between mt-6 gap-3">
          <button
            onClick={handlePrev}
            className="flex items-center gap-1 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl backdrop-blur-sm transition active:scale-95"
          >
            <ChevronLeft className="w-4 h-4" /> 이전
          </button>

          <button
            onClick={handleToggleCurrentWordMemorized}
            className={`flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold rounded-xl transition active:scale-95 ${
              currentWord.memorized
                ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-900/40'
                : 'bg-white/20 hover:bg-white/30 text-white'
            }`}
          >
            {currentWord.memorized ? (
              <>
                <CheckCircle2 className="w-4 h-4" /> 암기 완료됨
              </>
            ) : (
              <>
                <Circle className="w-4 h-4" /> 암기 완료로 표시
              </>
            )}
          </button>

          <button
            onClick={handleNext}
            className="flex items-center gap-1 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl backdrop-blur-sm transition active:scale-95"
          >
            다음 <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

