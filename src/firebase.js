import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';

// Default project id from user requirement
const DEFAULT_PROJECT_ID = 'englishtest';

// Check if config exists in env or localStorage
export function getFirebaseConfig() {
  const localConfigStr = localStorage.getItem('voca_firebase_custom_config');
  if (localConfigStr) {
    try {
      const parsed = JSON.parse(localConfigStr);
      if (parsed.apiKey && parsed.projectId) {
        return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse local custom config', e);
    }
  }

  return {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || `${DEFAULT_PROJECT_ID}.firebaseapp.com`,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || DEFAULT_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || `${DEFAULT_PROJECT_ID}.firebasestorage.app`,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
  };
}

export function saveFirebaseConfig(config) {
  localStorage.setItem('voca_firebase_custom_config', JSON.stringify(config));
  window.location.reload();
}

export function clearFirebaseConfig() {
  localStorage.removeItem('voca_firebase_custom_config');
  window.location.reload();
}

// Initialize Firebase App
const config = getFirebaseConfig();
export const isConfigured = Boolean(config.apiKey && config.projectId);

let app;
let auth;
let db;
let googleProvider;

if (isConfigured) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(config);
    auth = getAuth(app);
    db = getFirestore(app);
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({ prompt: 'select_account' });
  } catch (error) {
    console.error('Firebase initialization error:', error);
  }
}

export { app, auth, db, googleProvider };

// ----------------- Auth Functions -----------------

// Google Login
export async function loginWithGoogle() {
  if (!auth || !googleProvider) throw new Error('Firebase가 올바르게 설정되지 않았습니다.');
  return await signInWithPopup(auth, googleProvider);
}

// Email/Password Sign Up
export async function registerWithEmail(email, password, displayName) {
  if (!auth) throw new Error('Firebase가 올바르게 설정되지 않았습니다.');
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  if (displayName && userCredential.user) {
    await updateProfile(userCredential.user, { displayName });
  }
  return userCredential;
}

// Email/Password Sign In
export async function loginWithEmail(email, password) {
  if (!auth) throw new Error('Firebase가 올바르게 설정되지 않았습니다.');
  return await signInWithEmailAndPassword(auth, email, password);
}

// Sign Out
export async function logoutUser() {
  if (!auth) throw new Error('Firebase가 올바르게 설정되지 않았습니다.');
  return await signOut(auth);
}

// Auth State Listener
export function subscribeToAuthState(callback) {
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

// ----------------- Firestore CRUD (users/{userId}/words) -----------------

// 단어 목록 실시간 구독 (users/{userId}/words)
export function subscribeToWords(userId, onUpdate, onError) {
  if (!db || !userId) {
    onUpdate([]);
    return () => {};
  }

  // users/{userId}/words 컬렉션 경로
  const wordsRef = collection(db, 'users', userId, 'words');
  const q = query(wordsRef, orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const words = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
        // Firestore timestamp 변환
        createdAt: docSnap.data().createdAt?.toDate ? docSnap.data().createdAt.toDate() : new Date(),
        updatedAt: docSnap.data().updatedAt?.toDate ? docSnap.data().updatedAt.toDate() : new Date(),
      }));
      onUpdate(words);
    },
    (err) => {
      console.error('Firestore words subscription error:', err);
      if (onError) onError(err);
    }
  );
}

// 단어 추가: users/{userId}/words
export async function addWord(userId, wordData) {
  if (!db || !userId) throw new Error('로그인이 필요하거나 Firebase가 설정되지 않았습니다.');
  const wordsRef = collection(db, 'users', userId, 'words');
  const docRef = await addDoc(wordsRef, {
    word: wordData.word.trim(),
    meaning: wordData.meaning.trim(),
    partOfSpeech: wordData.partOfSpeech || '기타',
    example: wordData.example ? wordData.example.trim() : '',
    exampleTranslation: wordData.exampleTranslation ? wordData.exampleTranslation.trim() : '',
    category: wordData.category || '기본',
    memorized: false,
    reviewCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

// 단어 수정: users/{userId}/words/{wordId}
export async function updateWord(userId, wordId, updatedFields) {
  if (!db || !userId) throw new Error('권한이 없거나 Firebase가 설정되지 않았습니다.');
  const wordDocRef = doc(db, 'users', userId, 'words', wordId);
  await updateDoc(wordDocRef, {
    ...updatedFields,
    updatedAt: serverTimestamp(),
  });
}

// 단어 삭제: users/{userId}/words/{wordId}
export async function deleteWord(userId, wordId) {
  if (!db || !userId) throw new Error('권한이 없거나 Firebase가 설정되지 않았습니다.');
  const wordDocRef = doc(db, 'users', userId, 'words', wordId);
  await deleteDoc(wordDocRef);
}

// 암기 완료 토글
export async function toggleWordMemorized(userId, wordId, currentMemorized) {
  if (!db || !userId) throw new Error('권한이 없거나 Firebase가 설정되지 않았습니다.');
  const wordDocRef = doc(db, 'users', userId, 'words', wordId);
  await updateDoc(wordDocRef, {
    memorized: !currentMemorized,
    updatedAt: serverTimestamp(),
  });
}

// 샘플 단어 일괄 추가 (테스트 편의를 위한 헬퍼)
export async function addSampleWords(userId) {
  if (!db || !userId) throw new Error('권한이 없습니다.');
  const sampleWords = [
    {
      word: 'perseverance',
      meaning: '인내(심), 끈기',
      partOfSpeech: '명사',
      example: 'Success requires patience and perseverance.',
      exampleTranslation: '성공은 인내와 끈기를 필요로 한다.',
      category: '고급단어',
      memorized: false,
    },
    {
      word: 'articulate',
      meaning: '생각을 분명히 표현하다; 또렷한',
      partOfSpeech: '동사/형용사',
      example: 'She is an articulate speaker.',
      exampleTranslation: '그녀는 말을 조리 있게 잘하는 연설가이다.',
      category: '토익/비즈니스',
      memorized: false,
    },
    {
      word: 'meticulous',
      meaning: '꼼꼼한, 세심한',
      partOfSpeech: '형용사',
      example: 'He is meticulous about his work.',
      exampleTranslation: '그는 자신의 일에 대해 매우 꼼꼼하다.',
      category: '토익/비즈니스',
      memorized: true,
    },
    {
      word: 'ubiquitous',
      meaning: '어디에나 존재하는, 아주 흔한',
      partOfSpeech: '형용사',
      example: 'Smartphones have become ubiquitous in daily life.',
      exampleTranslation: '스마트폰은 일상생활에서 어디에나 있는 것이 되었다.',
      category: '고급단어',
      memorized: false,
    },
    {
      word: 'innovate',
      meaning: '혁신하다, 쇄신하다',
      partOfSpeech: '동사',
      example: 'Companies must constantly innovate to survive.',
      exampleTranslation: '기업은 살아남기 위해 끊임없이 혁신해야 한다.',
      category: '기초/일상',
      memorized: true,
    }
  ];

  const batch = writeBatch(db);
  const wordsRef = collection(db, 'users', userId, 'words');

  for (const item of sampleWords) {
    const newDoc = doc(wordsRef);
    batch.set(newDoc, {
      ...item,
      reviewCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  await batch.commit();
}
