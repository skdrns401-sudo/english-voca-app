import React, { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal({ isOpen, onClose }) {
  const { signInGoogle, signInEmail, signUpEmail } = useAuth();

  const [mode, setMode] = useState('login'); // 'login' or 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const getKoreanErrorMessage = (code) => {
    switch (code) {
      case 'auth/invalid-email':
        return '유효하지 않은 이메일 형식입니다.';
      case 'auth/user-disabled':
        return '해당 계정은 비활성화되었습니다.';
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return '이메일 또는 비밀번호가 일치하지 않습니다.';
      case 'auth/email-already-in-use':
        return '이미 등록된 이메일 주소입니다. 로그인해주세요.';
      case 'auth/weak-password':
        return '비밀번호는 최소 6자 이상이어야 합니다.';
      case 'auth/popup-closed-by-user':
        return '로그인 팝업이 닫혔습니다.';
      case 'auth/operation-not-allowed':
        return 'Firebase 콘솔에서 해당 로그인 방식(이메일/구글)이 활성화되어 있는지 확인해주세요.';
      default:
        return '로그인 처리 중 오류가 발생했습니다. 다시 시도해주세요.';
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await signInGoogle();
      onClose();
    } catch (err) {
      console.error(err);
      setError(getKoreanErrorMessage(err.code || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        if (!displayName.trim()) {
          setError('닉네임을 입력해주세요.');
          setLoading(false);
          return;
        }
        await signUpEmail(email, password, displayName);
      } else {
        await signInEmail(email, password);
      }
      onClose();
    } catch (err) {
      console.error(err);
      setError(getKoreanErrorMessage(err.code || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header decoration */}
        <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 p-8 text-white text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white p-1 rounded-full hover:bg-white/10 transition"
          >
            ✕
          </button>
          <div className="inline-flex p-3 bg-white/10 rounded-2xl mb-3 backdrop-blur-md">
            <Sparkles className="w-6 h-6 text-indigo-200" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">
            {mode === 'login' ? '단어장에 로그인' : '새 계정 만들기'}
          </h2>
          <p className="text-xs text-indigo-100 mt-1">
            {mode === 'login'
              ? '언제 어디서나 나만의 단어장을 동기화하세요'
              : '영어 단어 학습을 바로 시작해보세요'}
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex border-b border-slate-200 bg-slate-50">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError('');
            }}
            className={`flex-1 py-3 text-sm font-semibold text-center transition ${
              mode === 'login'
                ? 'text-indigo-600 border-b-2 border-indigo-600 bg-white'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            로그인
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setError('');
            }}
            className={`flex-1 py-3 text-sm font-semibold text-center transition ${
              mode === 'signup'
                ? 'text-indigo-600 border-b-2 border-indigo-600 bg-white'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            회원가입
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Google Sign In Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl font-medium text-sm shadow-sm transition active:scale-[0.99] disabled:opacity-60"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Google 계정으로 계속하기
          </button>

          <div className="relative flex items-center justify-center my-4">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-xs text-slate-400 absolute uppercase">또는 이메일로 계속하기</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">이름 / 닉네임</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="홍길동"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">이메일 주소</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">비밀번호</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="최소 6자 이상"
                  className="w-full pl-9 pr-10 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm shadow-md hover:shadow-indigo-200 transition active:scale-[0.99] disabled:opacity-60 mt-2"
            >
              {loading ? '처리 중...' : mode === 'login' ? '이메일로 로그인' : '가입하기'}
            </button>
          </form>

          <p className="text-center text-xs text-slate-500 pt-2">
            {mode === 'login' ? '계정이 없으신가요? ' : '이미 계정이 있으신가요? '}
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'login' ? 'signup' : 'login');
                setError('');
              }}
              className="text-indigo-600 font-semibold underline hover:text-indigo-800"
            >
              {mode === 'login' ? '회원가입하기' : '로그인하기'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

