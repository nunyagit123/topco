import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCpSlChXW19bppw4AxT2NeMZzSxVQT4SPM",
  authDomain: "gen-lang-client-0386162456.firebaseapp.com",
  projectId: "gen-lang-client-0386162456",
  storageBucket: "gen-lang-client-0386162456.firebasestorage.app",
  messagingSenderId: "424167251967",
  appId: "1:424167251967:web:b664dc0d99d27034c991ca",
  measurementId: "G-WVHFBZG8ZE"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
