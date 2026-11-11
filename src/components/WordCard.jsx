import React, { useState } from 'react';
import { Volume2, CheckCircle2, Circle, Edit2, Trash2, Tag, Eye, EyeOff } from 'lucide-react';
import confetti from 'canvas-confetti';
import { toggleWordMemorized, deleteWord } from '../firebase';
import { useAuth } from '../context/AuthContext';

export default function WordCard({ word, onEdit }) {
  const { user } = useAuth();
  const [hideMeaning, setHideMeaning] = useState(false);
  const [deleting, setDeleting] = useState(false);

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

  const handleToggleMemorized = async (e) => {
    e.stopPropagation();
    if (!user) return;
    try {
      const nextStatus = !word.memorized;
      await toggleWordMemorized(user.uid, word.id, word.memorized);

      if (nextStatus) {
        // Confetti celebration effect!
        try {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.8 },
            colors: ['#6366f1', '#10b981', '#f59e0b', '#ec4899'],
          });
        } catch {
          // Ignore if canvas-confetti fails
        }
      }
    } catch (err) {
      console.error('Error toggling memorized:', err);
      alert('상태 변경 실패: ' + err.message);
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!user) return;
    if (!confirm(`'${word.word}' 단어를 정말 삭제하시겠습니까?`)) return;

    setDeleting(true);
    try {
      await deleteWord(user.uid, word.id);
    } catch (err) {
      console.error('Error deleting word:', err);
      alert('삭제 실패: ' + err.message);
      setDeleting(false);
    }
  };

  return (
    <div
      className={`group relative bg-white rounded-2xl border transition-all duration-200 p-5 shadow-sm hover:shadow-md ${
        word.memorized
          ? 'border-emerald-200/80 bg-emerald-50/20'
          : 'border-slate-200 hover:border-indigo-300'
      } ${deleting ? 'opacity-40 pointer-events-none' : ''}`}
    >
      {/* Top Header: Category, Part of speech, Memorized status */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700">
            <Tag className="w-3 h-3 text-slate-400" />
            {word.category || '기본'}
          </span>
          {word.partOfSpeech && (
            <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-100/60">
              {word.partOfSpeech}
            </span>
          )}
        </div>

        <button
          onClick={handleToggleMemorized}
          className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full transition ${
            word.memorized
              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
              : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700'
          }`}
          title={word.memorized ? '암기 완료됨 (클릭하여 취소)' : '미암기 (클릭하여 완료 표시)'}
        >
          {word.memorized ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>암기완료</span>
            </>
          ) : (
            <>
              <Circle className="w-3.5 h-3.5" />
              <span>학습중</span>
            </>
          )}
        </button>
      </div>

      {/* Word & Audio */}
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xl font-extrabold tracking-tight text-slate-900 group-hover:text-indigo-600 transition">
          {word.word}
        </h4>
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => handleSpeak(e, word.word)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition"
            title="발음 듣기"
          >
            <Volume2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setHideMeaning(!hideMeaning)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            title={hideMeaning ? '뜻 보기' : '뜻 가리기 (암기 테스트)'}
          >
            {hideMeaning ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Meaning */}
      <div className="mb-3">
        {hideMeaning ? (
          <div
            onClick={() => setHideMeaning(false)}
            className="cursor-pointer py-1 px-3 bg-slate-100 hover:bg-slate-200 text-slate-400 text-xs rounded-lg italic inline-block transition"
          >
            뜻이 숨겨져 있습니다 (클릭하여 보기)
          </div>
        ) : (
          <p className="text-sm font-medium text-slate-700 leading-snug">
            {word.meaning}
          </p>
        )}
      </div>

      {/* Example Sentence */}
      {word.example && (
        <div className="mt-3 pt-3 border-t border-slate-100 bg-slate-50/60 rounded-xl p-2.5 text-xs">
          <div className="flex items-start justify-between gap-1">
            <p className="text-slate-700 italic font-serif leading-relaxed">
              "{word.example}"
            </p>
            <button
              onClick={(e) => handleSpeak(e, word.example)}
              className="text-slate-400 hover:text-indigo-600 shrink-0 p-1"
              title="예문 발음 듣기"
            >
              <Volume2 className="w-3 h-3" />
            </button>
          </div>
          {word.exampleTranslation && (
            <p className="text-slate-500 mt-1 pl-1 border-l-2 border-indigo-200">
              {word.exampleTranslation}
            </p>
          )}
        </div>
      )}

      {/* Card Footer: Edit / Delete */}
      <div className="mt-4 pt-3 flex items-center justify-between border-t border-slate-100 text-xs text-slate-400">
        <span className="text-[10px]">
          {word.createdAt ? new Date(word.createdAt).toLocaleDateString() : ''}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(word)}
            className="flex items-center gap-1 px-2 py-1 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
            title="단어 수정"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>수정</span>
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center gap-1 px-2 py-1 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
            title="단어 삭제"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>삭제</span>
          </button>
        </div>
      </div>
    </div>
  );
}

