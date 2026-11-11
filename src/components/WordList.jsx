import React, { useState, useMemo } from 'react';
import { Search, Filter, SortAsc, BookOpen, Plus, CheckCircle, Clock } from 'lucide-react';
import WordCard from './WordCard';

export default function WordList({ words, loading, onAddWord, onEditWord }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'learning', 'memorized'
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'alphabetical'

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set();
    words.forEach((w) => {
      if (w.category) set.add(w.category);
    });
    return Array.from(set);
  }, [words]);

  // Filtered and sorted words
  const filteredWords = useMemo(() => {
    return words
      .filter((w) => {
        // Status filter
        if (statusFilter === 'learning' && w.memorized) return false;
        if (statusFilter === 'memorized' && !w.memorized) return false;

        // Category filter
        if (selectedCategory !== 'all' && w.category !== selectedCategory) return false;

        // Search filter
        if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase();
          const matchWord = w.word?.toLowerCase().includes(term);
          const matchMeaning = w.meaning?.toLowerCase().includes(term);
          const matchExample = w.example?.toLowerCase().includes(term);
          return matchWord || matchMeaning || matchExample;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'alphabetical') {
          return (a.word || '').localeCompare(b.word || '');
        }
        // newest default
        const timeA = a.createdAt?.getTime ? a.createdAt.getTime() : 0;
        const timeB = b.createdAt?.getTime ? b.createdAt.getTime() : 0;
        return timeB - timeA;
      });
  }, [words, statusFilter, selectedCategory, searchTerm, sortBy]);

  return (
    <div className="space-y-6">
      {/* Search and Filter Controls */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="단어, 뜻, 예문 검색..."
              className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-slate-50/50"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category dropdown */}
          <div className="flex items-center gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-700"
            >
              <option value="all">모든 카테고리 ({words.length})</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat} ({words.filter((w) => w.category === cat).length})
                </option>
              ))}
            </select>

            {/* Sort order */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-700"
            >
              <option value="newest">최신 등록순</option>
              <option value="alphabetical">알파벳순 (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 flex-wrap gap-2">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                statusFilter === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              전체 ({words.length})
            </button>
            <button
              onClick={() => setStatusFilter('learning')}
              className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                statusFilter === 'learning'
                  ? 'bg-amber-500 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              학습중 ({words.filter((w) => !w.memorized).length})
            </button>
            <button
              onClick={() => setStatusFilter('memorized')}
              className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                statusFilter === 'memorized'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <CheckCircle className="w-3.5 h-3.5" />
              암기완료 ({words.filter((w) => w.memorized).length})
            </button>
          </div>

          <div className="text-xs text-slate-400">
            총 <span className="font-bold text-slate-700">{filteredWords.length}</span>개 단어 표시 중
          </div>
        </div>
      </div>

      {/* Words Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-sm text-slate-500">Firestore에서 단어장을 불러오는 중...</p>
        </div>
      ) : filteredWords.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWords.map((word) => (
            <WordCard key={word.id} word={word} onEdit={onEditWord} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center">
          <div className="w-14 h-14 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800 mb-1">
            {searchTerm || statusFilter !== 'all' || selectedCategory !== 'all'
              ? '조건에 맞는 단어가 없습니다'
              : '아직 등록된 단어가 없습니다'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">
            {searchTerm || statusFilter !== 'all' || selectedCategory !== 'all'
              ? '검색어나 필터를 초기화하거나 새로운 단어를 등록해보세요.'
              : '새 단어를 추가하고 매일 반복 학습해보세요!'}
          </p>
          <button
            onClick={onAddWord}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-100 transition"
          >
            <Plus className="w-4 h-4" /> 첫 번째 단어 추가하기
          </button>
        </div>
      )}
    </div>
  );
}
