import React from 'react';
import { Award, CheckCircle, Clock, Plus, Sparkles, BookOpen } from 'lucide-react';
import { addSampleWords } from '../firebase';
import { useAuth } from '../context/AuthContext';

export default function StatsBanner({ words, onAddWord }) {
  const { user } = useAuth();
  const total = words.length;
  const memorized = words.filter((w) => w.memorized).length;
  const learning = total - memorized;
  const percent = total > 0 ? Math.round((memorized / total) * 100) : 0;

  const [addingSample, setAddingSample] = React.useState(false);

  const handleAddSample = async () => {
    if (!user) return;
    setAddingSample(true);
    try {
      await addSampleWords(user.uid);
    } catch (err) {
      console.error(err);
      alert('샘플 단어 추가 실패: ' + err.message);
    } finally {
      setAddingSample(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden mb-8">
      {/* Background glow decor */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-16 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left summary & progress */}
        <div className="space-y-3 max-w-lg">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/30 text-indigo-200 text-xs font-semibold backdrop-blur-sm border border-indigo-400/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>나만의 맞춤 단어장</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            안녕하세요, {user?.displayName || '학습자'}님!
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            {total === 0
              ? '단어를 추가하여 매일 복습하고 어휘력을 키워보세요!'
              : percent === 100
              ? '🎉 축하합니다! 저장된 모든 단어를 완벽히 암기하셨습니다!'
              : `현재 ${percent}%의 단어를 암기 완료했습니다. 꾸준함이 실력입니다!`}
          </p>

          {/* Progress Bar */}
          {total > 0 && (
            <div className="pt-2 space-y-1.5">
              <div className="flex items-center justify-between text-xs text-indigo-200">
                <span>암기 달성률</span>
                <span className="font-bold">{percent}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-800/80 rounded-full overflow-hidden p-0.5 border border-indigo-500/20">
                <div
                  className="h-full bg-gradient-to-r from-indigo-400 to-emerald-400 rounded-full transition-all duration-500 shadow-sm"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Right metrics & CTA */}
        <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0">
          <div className="grid grid-cols-3 gap-3 w-full sm:w-auto">
            <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-3.5 text-center min-w-[80px]">
              <div className="text-slate-300 text-[11px] mb-1">전체</div>
              <div className="text-xl font-black text-white">{total}</div>
            </div>
            <div className="bg-emerald-500/20 backdrop-blur-sm border border-emerald-400/20 rounded-2xl p-3.5 text-center min-w-[80px]">
              <div className="text-emerald-300 text-[11px] mb-1">암기완료</div>
              <div className="text-xl font-black text-emerald-400">{memorized}</div>
            </div>
            <div className="bg-amber-500/20 backdrop-blur-sm border border-amber-400/20 rounded-2xl p-3.5 text-center min-w-[80px]">
              <div className="text-amber-300 text-[11px] mb-1">학습중</div>
              <div className="text-xl font-black text-amber-400">{learning}</div>
            </div>
          </div>

          <div className="flex flex-col gap-2 w-full sm:w-auto">
            <button
              onClick={onAddWord}
              className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" /> 단어 추가
            </button>

            {total === 0 && (
              <button
                onClick={handleAddSample}
                disabled={addingSample}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-indigo-100 font-medium text-xs transition border border-white/10 flex items-center justify-center gap-1.5"
              >
                <BookOpen className="w-3.5 h-3.5" />
                {addingSample ? '추가 중...' : '샘플 단어 5개 불러오기'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

