import React, { useState } from 'react';
import { Settings, Check, ExternalLink, AlertTriangle, Key, Shield } from 'lucide-react';
import { getFirebaseConfig, saveFirebaseConfig, clearFirebaseConfig } from '../firebase';

export default function FirebaseConfigModal({ isOpen, onClose }) {
  const currentConfig = getFirebaseConfig();

  const [apiKey, setApiKey] = useState(currentConfig.apiKey || '');
  const [projectId, setProjectId] = useState(currentConfig.projectId || 'englishtest');
  const [authDomain, setAuthDomain] = useState(currentConfig.authDomain || 'englishtest.firebaseapp.com');
  const [appId, setAppId] = useState(currentConfig.appId || '');
  const [storageBucket, setStorageBucket] = useState(currentConfig.storageBucket || 'englishtest.firebasestorage.app');
  const [messagingSenderId, setMessagingSenderId] = useState(currentConfig.messagingSenderId || '');

  const [pasteSnippet, setPasteSnippet] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handlePasteSnippet = (text) => {
    setPasteSnippet(text);
    try {
      // Handle firebaseConfig = { ... } format
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        // Evaluate or parse loose object format
        const clean = jsonMatch[0]
          .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":')
          .replace(/'/g, '"')
          .replace(/,\s*}/g, '}');
        const parsed = JSON.parse(clean);
        if (parsed.apiKey) setApiKey(parsed.apiKey);
        if (parsed.projectId) setProjectId(parsed.projectId);
        if (parsed.authDomain) setAuthDomain(parsed.authDomain);
        if (parsed.appId) setAppId(parsed.appId);
        if (parsed.storageBucket) setStorageBucket(parsed.storageBucket);
        if (parsed.messagingSenderId) setMessagingSenderId(parsed.messagingSenderId);
        setError('');
      }
    } catch {
      // Regex individual matches fallback
      const apiKeyMatch = text.match(/apiKey:\s*["']([^"']+)["']/);
      const projectIdMatch = text.match(/projectId:\s*["']([^"']+)["']/);
      const authDomainMatch = text.match(/authDomain:\s*["']([^"']+)["']/);
      const appIdMatch = text.match(/appId:\s*["']([^"']+)["']/);

      if (apiKeyMatch) setApiKey(apiKeyMatch[1]);
      if (projectIdMatch) setProjectId(projectIdMatch[1]);
      if (authDomainMatch) setAuthDomain(authDomainMatch[1]);
      if (appIdMatch) setAppId(appIdMatch[1]);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!apiKey.trim()) {
      setError('apiKey는 필수입니다.');
      return;
    }
    if (!projectId.trim()) {
      setError('projectId는 필수입니다.');
      return;
    }

    saveFirebaseConfig({
      apiKey: apiKey.trim(),
      projectId: projectId.trim(),
      authDomain: authDomain.trim(),
      appId: appId.trim(),
      storageBucket: storageBucket.trim(),
      messagingSenderId: messagingSenderId.trim(),
    });
  };

  const handleReset = () => {
    if (confirm('설정을 초기화하시겠습니까? (로컬스토리지에 저장된 설정이 삭제됩니다)')) {
      clearFirebaseConfig();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-white/10 rounded-lg">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Firebase 설정 (프로젝트: englishtest)</h3>
              <p className="text-xs text-indigo-100">프로젝트 API 키 및 설정 정보를 입력하세요</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition"
          >
            ✕
          </button>
        </div>

        <div className="p-6 max-h-[80vh] overflow-y-auto space-y-5">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold mb-0.5">Firebase 콘솔에서 설정을 확인하는 방법:</p>
              <ol className="list-decimal ml-4 space-y-0.5">
                <li><a href="https://console.firebase.google.com/" target="_blank" rel="noreferrer" className="underline font-bold inline-flex items-center gap-1">Firebase 콘솔 <ExternalLink className="w-3 h-3" /></a> 접속</li>
                <li><strong>englishtest</strong> 프로젝트 선택 → 프로젝트 설정(톱니바퀴) → [일반] 하단 '내 앱'</li>
                <li>'웹 앱(/&gt;)' 추가 또는 기존 SDK 설정 코드를 복사해서 아래에 붙여넣기</li>
              </ol>
            </div>
          </div>

          {/* Quick paste helper */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Firebase SDK 코드 전체 붙여넣기 (자동 추출)
            </label>
            <textarea
              rows="2"
              value={pasteSnippet}
              onChange={(e) => handlePasteSnippet(e.target.value)}
              placeholder="const firebaseConfig = { apiKey: '...', ... } 코드를 여기에 붙여넣으면 아래 필드가 자동 완성됩니다."
              className="w-full text-xs font-mono p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <form onSubmit={handleSave} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                API Key <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Project ID</label>
                <input
                  type="text"
                  required
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Auth Domain</label>
                <input
                  type="text"
                  value={authDomain}
                  onChange={(e) => setAuthDomain(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">App ID</label>
                <input
                  type="text"
                  value={appId}
                  onChange={(e) => setAppId(e.target.value)}
                  placeholder="1:123456789:web:..."
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Messaging Sender ID</label>
                <input
                  type="text"
                  value={messagingSenderId}
                  onChange={(e) => setMessagingSenderId(e.target.value)}
                  placeholder="123456789"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                />
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200">{error}</p>
            )}

            <div className="pt-3 flex items-center justify-between border-t border-slate-100">
              <button
                type="button"
                onClick={handleReset}
                className="text-xs text-slate-500 hover:text-red-600 underline"
              >
                초기화
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  닫기
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" /> 설정 저장 및 적용
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
