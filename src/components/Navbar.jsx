import React from 'react';
import { BookOpen, LogIn, LogOut, Settings, Award, Layers, HelpCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({
  onOpenAuth,
  onOpenConfig,
  onOpenFlashcard,
  onOpenQuiz,
  totalWords = 0,
}) {
  const { user, signOut, isConfigured } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-100">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                VocaEng
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600 border border-indigo-100">
                englishtest
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              개인 맞춤형 영어 단어 학습장 (Firestore 연동)
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {user && totalWords > 0 && (
            <div className="flex items-center gap-1.5 mr-1">
              <button
                onClick={onOpenFlashcard}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition"
                title="플래시카드 암기 모드"
              >
                <Layers className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">플래시카드</span>
              </button>
              <button
                onClick={onOpenQuiz}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 transition"
                title="4지선다 퀴즈 모드"
              >
                <Award className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">퀴즈 풀기</span>
              </button>
            </div>
          )}

          <button
            onClick={onOpenConfig}
            className={`p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition relative ${
              !isConfigured ? 'text-amber-600 animate-pulse bg-amber-50' : ''
            }`}
            title="Firebase 설정"
          >
            <Settings className="w-4 h-4" />
            {!isConfigured && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full border-2 border-white" />
            )}
          </button>

          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-bold text-slate-800">
                  {user.displayName || user.email?.split('@')[0] || '사용자'}
                </span>
                <span className="text-[10px] text-slate-400 truncate max-w-[140px]">
                  {user.email}
                </span>
              </div>
              <button
                onClick={signOut}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                title="로그아웃"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">로그아웃</span>
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-sm hover:shadow transition"
            >
              <LogIn className="w-4 h-4" />
              로그인 / 시작하기
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

