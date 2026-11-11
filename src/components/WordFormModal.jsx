import React, { useState, useEffect } from 'react';
import { Volume2, Plus, Edit3, X, Sparkles } from 'lucide-react';
import { addWord, updateWord } from '../firebase';
import { useAuth } from '../context/AuthContext';

const PARTS_OF_SPEECH = [
  '명사',
  '동사',
  '형용사',
  '부사',
  '숙어/이디엄',
  '전치사',
  '접속사',
  '기타',
];

const COMMON_CATEGORIES = [
  '기초/일상',
  '토익/비즈니스',
  '수능/내신',
  '토플/아이엘츠',
  '고급단어',
  '뉴스/시사',
];

export default function WordFormModal({ isOpen, onClose, editingWord = null }) {
  const { user } = useAuth();

  const [word, setWord] = useState('');
  const [meaning, setMeaning] = useState('');
  const [partOfSpeech, setPartOfSpeech] = useState('명사');
  const [category, setCategory] = useState('기초/일상');
  const [customCategory, setCustomCategory] = useState('');
  const [example, setExample] = useState('');
  const [exampleTranslation, setExampleTranslation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingWord) {
      setWord(editingWord.word || '');
      setMeaning(editingWord.meaning || '');
      setPartOfSpeech(editingWord.partOfSpeech || '명사');
      if (COMMON_CATEGORIES.includes(editingWord.category)) {
        setCategory(editingWord.category);
        setCustomCategory('');
      } else {
        setCategory('직접입력');
        setCustomCategory(editingWord.category || '');
      }
      setExample(editingWord.example || '');
      setExampleTranslation(editingWord.exampleTranslation || '');
    } else {
      setWord('');
      setMeaning('');
      setPartOfSpeech('명사');
      setCategory('기초/일상');
      setCustomCategory('');
      setExample('');
      setExampleTranslation('');
    }
    setError('');
  }, [editingWord, isOpen]);

  if (!isOpen) return null;

  const handleSpeak = (text) => {
    if (!text) return;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    if (!word.trim()) {
      setError('영어 단어를 입력해주세요.');
      return;
    }
    if (!meaning.trim()) {
      setError('단어 뜻을 입력해주세요.');
      return;
    }

    const finalCategory = category === '직접입력' ? customCategory.trim() || '기본' : category;

    setLoading(true);
    setError('');

    try {
      if (editingWord) {
        await updateWord(user.uid, editingWord.id, {
          word: word.trim(),
          meaning: meaning.trim(),
          partOfSpeech,
          category: finalCategory,
          example: example.trim(),
          exampleTranslation: exampleTranslation.trim(),
        });
      } else {
        await addWord(user.uid, {
          word: word.trim(),
          meaning: meaning.trim(),
          partOfSpeech,
          category: finalCategory,
          example: example.trim(),
          exampleTranslation: exampleTranslation.trim(),
        });
      }
      onClose();
    } catch (err) {
      console.error(err);
      setError('단어 저장 중 오류가 발생했습니다: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg">
              {editingWord ? <Edit3 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-bold text-base">
                {editingWord ? '단어 수정하기' : '새로운 영어 단어 추가'}
              </h3>
              <p className="text-xs text-slate-400">
                Firestore <code className="text-indigo-300">users/{'{userId}'}/words</code> 경로에 저장됩니다
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
              {error}
            </div>
          )}

          {/* Word & Pronunciation */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              영어 단어 <span className="text-red-500">*</span>
            </label>
            <div className="relative flex items-center">
              <input
                type="text"
                required
                autoFocus
                value={word}
                onChange={(e) => setWord(e.target.value)}
                placeholder="예: serendipity"
                className="w-full px-4 py-2.5 text-base font-semibold border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none pr-12 text-slate-800"
              />
              {word.trim() && (
                <button
                  type="button"
                  onClick={() => handleSpeak(word)}
                  title="발음 듣기 (TTS)"
                  className="absolute right-2 p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Meaning */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              한국어 뜻 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={meaning}
              onChange={(e) => setMeaning(e.target.value)}
              placeholder="예: 뜻밖의 행운, 우연한 발견"
              className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {/* Part of Speech & Category */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">품사</label>
              <select
                value={partOfSpeech}
                onChange={(e) => setPartOfSpeech(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                {PARTS_OF_SPEECH.map((pos) => (
                  <option key={pos} value={pos}>
                    {pos}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">학습 카테고리</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                {COMMON_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
                <option value="직접입력">직접 입력...</option>
              </select>
            </div>
          </div>

          {category === '직접입력' && (
            <div>
              <input
                type="text"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="카테고리 이름을 입력하세요 (예: 회화 30일 완성)"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          )}

          {/* Example Sentence */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700">예문 (선택)</label>
              {example.trim() && (
                <button
                  type="button"
                  onClick={() => handleSpeak(example)}
                  className="text-[11px] text-indigo-600 hover:underline flex items-center gap-1"
                >
                  <Volume2 className="w-3.5 h-3.5" /> 예문 발음 듣기
                </button>
              )}
            </div>
            <textarea
              rows="2"
              value={example}
              onChange={(e) => setExample(e.target.value)}
              placeholder="예: It was pure serendipity that we met."
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none font-sans"
            />
          </div>

          {/* Example Translation */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">예문 해석 (선택)</label>
            <input
              type="text"
              value={exampleTranslation}
              onChange={(e) => setExampleTranslation(e.target.value)}
              placeholder="예: 우리가 만난 것은 순전한 뜻밖의 행운이었다."
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md hover:shadow-indigo-200 transition disabled:opacity-60 flex items-center gap-1.5"
            >
              {loading ? '저장 중...' : editingWord ? '단어 수정 완료' : '단어 추가하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

