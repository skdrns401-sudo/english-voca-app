import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { subscribeToWords } from './firebase';
import Navbar from './components/Navbar';
import StatsBanner from './components/StatsBanner';
import WordList from './components/WordList';
import WordFormModal from './components/WordFormModal';
import FlashcardModal from './components/FlashcardModal';
import QuizModal from './components/QuizModal';
import AuthModal from './components/AuthModal';
import FirebaseConfigModal from './components/FirebaseConfigModal';
import {
  BookOpen,
  Sparkles,
  ShieldCheck,
  Zap,
  Globe,
  Layers,
  Award,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

export default function App() {
  const { user, loading: authLoading, isConfigured } = useAuth();

  const [words, setWords] = useState([]);
  const [wordsLoading, setWordsLoading] = useState(true);
  const [firestoreError, setFirestoreError] = useState(null);

  // Modals state
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isWordFormOpen, setIsWordFormOpen] = useState(false);
  const [editingWord, setEditingWord] = useState(null);
  const [isFlashcardOpen, setIsFlashcardOpen] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);

  // Subscribe to Firestore words when user is logged in
  useEffect(() => {
    if (!user) {
      setWords([]);
      setWordsLoading(false);
      setFirestoreError(null);
      return;
    }

    setWordsLoading(true);
    setFirestoreError(null);

    // users/{userId}/words
    const unsubscribe = subscribeToWords(
      user.uid,
      (updatedWords) => {
        setWords(updatedWords);
        setWordsLoading(false);
      },
      (error) => {
        console.error('Failed to subscribe words:', error);
        setFirestoreError(error.message);
        setWordsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const handleOpenAddWord = () => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }
    setEditingWord(null);
    setIsWordFormOpen(true);
  };

  const handleOpenEditWord = (word) => {
    setEditingWord(word);
    setIsWordFormOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 selection:bg-indigo-500 selection:text-white">
      {/* Navbar */}
      <Navbar
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenConfig={() => setIsConfigOpen(true)}
        onOpenFlashcard={() => setIsFlashcardOpen(true)}
        onOpenQuiz={() => setIsQuizOpen(true)}
        totalWords={words.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Firestore or Config warning if missing */}
        {!isConfigured && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-amber-900">
                  Firebase API 설정이 필요합니다
                </h4>
                <p className="text-xs text-amber-700 mt-0.5">
                  Firebase 콘솔에서 <strong>englishtest</strong> 프로젝트의 웹 앱 설정을 가져와
                  입력해주세요.
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsConfigOpen(true)}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shrink-0 transition"
            >
              설정 열기
            </button>
          </div>
        )}

        {firestoreError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-red-700 text-xs">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <div>
              <p className="font-bold">Firestore 데이터 조회 오류:</p>
              <p className="mt-0.5">{firestoreError}</p>
              <p className="mt-1 text-slate-600">
                Firebase 콘솔에서 Firestore 데이터베이스가 생성되어 있는지 및 보안 규칙(Security Rules)을
                확인해주세요.
              </p>
            </div>
          </div>
        )}

        {/* Content based on Auth State */}
        {authLoading ? (
          <div className="py-24 text-center">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-xs text-slate-500">인증 정보를 확인하는 중입니다...</p>
          </div>
        ) : user ? (
          /* LOGGED IN USER VIEW */
          <div className="space-y-6">
            <StatsBanner words={words} onAddWord={handleOpenAddWord} />
            <WordList
              words={words}
              loading={wordsLoading}
              onAddWord={handleOpenAddWord}
              onEditWord={handleOpenEditWord}
            />
          </div>
        ) : (
          /* LOGGED OUT GUEST VIEW */
          <div className="py-8 sm:py-12 space-y-12">
            {/* Hero Section */}
            <div className="text-center max-w-2xl mx-auto space-y-5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                Firebase englishtest 연동 영어 단어 학습 웹앱
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
                나만의 맞춤 단어로 완성하는 <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  스마트 영어 어휘 학습장
                </span>
              </h1>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Google 계정 또는 이메일로 간편하게 로그인하고 단어를 추가해보세요.
                추가된 데이터는 Firebase Firestore의 <code className="bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded font-mono text-xs font-bold">users/{'{userId}'}</code> 경로에 완벽히 격리되어 안전하게 영구 저장됩니다.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => setIsAuthOpen(true)}
                  className="w-full sm:w-auto px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-sm shadow-lg shadow-indigo-200 transition active:scale-[0.99] flex items-center justify-center gap-2"
                >
                  <BookOpen className="w-4 h-4" /> 지금 무료로 시작하기
                </button>
                <button
                  onClick={() => setIsConfigOpen(true)}
                  className="w-full sm:w-auto px-5 py-3.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-2xl font-semibold text-sm transition"
                >
                  Firebase 프로젝트 설정 확인
                </button>
              </div>
            </div>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">개인 데이터 완전 격리</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Firestore <code className="font-mono text-indigo-600">users/{'{userId}'}/words</code> 경로 및 보안 규칙으로 오직 로그인한 본인만의 단어만 열람, 수정, 삭제할 수 있습니다.
                </p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Layers className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">3D 플래시카드 & 퀴즈</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  스페이스바나 클릭으로 뒤집어보는 플래시카드와, 저장된 단어로 자동 생성되는 4지선다 퀴즈로 지루함 없이 복습할 수 있습니다.
                </p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">네이티브 발음 듣기 (TTS)</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  단어 및 예문 옆 스피커 버튼을 누르면 브라우저의 고품질 음성 합성(Web Speech)으로 즉시 현지 발음을 들을 수 있습니다.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">VocaEng</span>
            <span>&middot;</span>
            <span>Firebase 프로젝트: <strong>englishtest</strong></span>
            <span>&middot;</span>
            <span className="inline-flex items-center gap-1 text-slate-600">
              <Globe className="w-3 h-3" /> Vercel 배포 준비 완료
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsConfigOpen(true)}
              className="hover:text-indigo-600 transition"
            >
              Firebase 설정
            </button>
            <a
              href="https://console.firebase.google.com/"
              target="_blank"
              rel="noreferrer"
              className="hover:text-indigo-600 flex items-center gap-1"
            >
              Firebase 콘솔 <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <FirebaseConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
      />
      <WordFormModal
        isOpen={isWordFormOpen}
        onClose={() => setIsWordFormOpen(false)}
        editingWord={editingWord}
      />
      <FlashcardModal
        isOpen={isFlashcardOpen}
        onClose={() => setIsFlashcardOpen(false)}
        words={words}
      />
      <QuizModal
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
        words={words}
      />
    </div>
  );
}

