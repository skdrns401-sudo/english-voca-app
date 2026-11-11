import React, { useState, useEffect } from 'react';
import { Award, CheckCircle, XCircle, RotateCcw, X, Volume2, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function QuizModal({ isOpen, onClose, words = [] }) {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    if (isOpen && words.length >= 4) {
      setupQuiz();
    }
  }, [isOpen, words]);

  const setupQuiz = () => {
    // Pick up to 10 random words as questions
    const shuffled = [...words].sort(() => 0.5 - Math.random());
    const quizList = shuffled.slice(0, Math.min(10, shuffled.length)).map((targetWord) => {
      // Pick 3 wrong options from other words
      const wrongPool = words.filter((w) => w.id !== targetWord.id);
      const shuffledWrongs = wrongPool.sort(() => 0.5 - Math.random()).slice(0, 3);

      const options = [
        { text: targetWord.meaning, isCorrect: true },
        ...shuffledWrongs.map((w) => ({ text: w.meaning, isCorrect: false })),
      ].sort(() => 0.5 - Math.random());

      return {
        word: targetWord.word,
        correctMeaning: targetWord.meaning,
        partOfSpeech: targetWord.partOfSpeech,
        options,
      };
    });

    setQuestions(quizList);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setScore(0);
    setIsFinished(false);
  };

  if (!isOpen) return null;

  if (words.length < 4) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
        <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl border border-slate-100">
          <Award className="w-12 h-12 text-amber-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800 mb-2">단어가 부족합니다</h3>
          <p className="text-xs text-slate-500 mb-5">
            4지선다 퀴즈를 진행하려면 최소 4개 이상의 단어가 단어장에 등록되어 있어야 합니다.
          </p>
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition"
          >
            확인
          </button>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];

  const handleSelectOption = (index, isCorrect) => {
    if (isAnswered) return;
    setSelectedAnswer(index);
    setIsAnswered(true);

    if (isCorrect) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      setIsFinished(true);
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // Ignore
      }
    }
  };

  const handleSpeak = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-US';
      window.speechSynthesis.speak(u);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-purple-400" />
            <h3 className="font-bold text-sm sm:text-base">어휘력 퀴즈 모드</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isFinished ? (
          /* Finished Screen */
          <div className="p-8 text-center space-y-5">
            <div className="w-16 h-16 bg-gradient-to-tr from-purple-500 to-indigo-600 rounded-3xl text-white flex items-center justify-center mx-auto shadow-lg shadow-purple-200">
              <Sparkles className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h4 className="text-2xl font-black text-slate-900">퀴즈 완료!</h4>
              <p className="text-xs text-slate-500">
                총 {questions.length}문제 중 {score}문제를 맞히셨습니다.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-around">
              <div>
                <span className="text-xs text-slate-400 block mb-0.5">정답률</span>
                <span className="text-2xl font-black text-indigo-600">
                  {Math.round((score / questions.length) * 100)}%
                </span>
              </div>
              <div className="border-r border-slate-200 h-8" />
              <div>
                <span className="text-xs text-slate-400 block mb-0.5">획득 점수</span>
                <span className="text-2xl font-black text-purple-600">
                  {score} / {questions.length}
                </span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={setupQuiz}
                className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" /> 다시 풀기
              </button>
              <button
                onClick={onClose}
                className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
              >
                닫기
              </button>
            </div>
          </div>
        ) : (
          /* Quiz Question Screen */
          currentQ && (
            <div className="p-6 space-y-6">
              {/* Progress */}
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>
                  문제 <strong className="text-slate-800">{currentIndex + 1}</strong> / {questions.length}
                </span>
                <span>현재 정답: {score}개</span>
              </div>

              {/* Question Target Word */}
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-2xl p-6 text-center">
                <span className="text-[11px] font-semibold text-indigo-600 bg-white px-2.5 py-0.5 rounded-full border border-indigo-100 mb-2 inline-block">
                  {currentQ.partOfSpeech || '단어'}
                </span>
                <div className="flex items-center justify-center gap-2">
                  <h4 className="text-3xl font-black text-slate-900 tracking-tight">
                    {currentQ.word}
                  </h4>
                  <button
                    onClick={() => handleSpeak(currentQ.word)}
                    className="p-1.5 text-indigo-600 hover:bg-indigo-100 rounded-lg transition"
                    title="발음 듣기"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-2">이 단어의 알맞은 뜻을 고르세요.</p>
              </div>

              {/* 4 Choices */}
              <div className="space-y-2.5">
                {currentQ.options.map((opt, idx) => {
                  let btnStyle = 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800';

                  if (isAnswered) {
                    if (opt.isCorrect) {
                      btnStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold';
                    } else if (selectedAnswer === idx) {
                      btnStyle = 'border-red-500 bg-red-50 text-red-900';
                    } else {
                      btnStyle = 'border-slate-200 bg-slate-50 text-slate-400 opacity-60';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      disabled={isAnswered}
                      onClick={() => handleSelectOption(idx, opt.isCorrect)}
                      className={`w-full text-left p-3.5 rounded-2xl border transition-all text-xs sm:text-sm flex items-center justify-between ${btnStyle}`}
                    >
                      <span>{opt.text}</span>
                      {isAnswered && (
                        <span>
                          {opt.isCorrect ? (
                            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                          ) : selectedAnswer === idx ? (
                            <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                          ) : null}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Next Button */}
              {isAnswered && (
                <div className="pt-2 animate-fadeIn">
                  <button
                    onClick={handleNext}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-md shadow-indigo-100 transition"
                  >
                    {currentIndex + 1 < questions.length ? '다음 문제로 넘어가기' : '결과 확인하기'}
                  </button>
                </div>
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
}
