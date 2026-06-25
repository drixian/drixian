import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../../config/firebase';
import { doc, setDoc } from 'firebase/firestore';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        
        await setDoc(doc(db, "users", credential.user.uid), {
          uid: credential.user.uid,
          username: username.trim(),
          metsBalance: username.trim().toLowerCase() === 'bluz' ? 1000000 : 50, // Massive balance allocation if you register as Bluz
          createdAt: Date.now()
        });
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: `url('/branding/drixianbackround.png')` }}>
      <div className="bg-[#2f3136] p-8 rounded-lg shadow-2xl w-full max-w-md border border-[#202225]/50">
        <div className="flex flex-col items-center mb-6">
          <img src="/branding/drixianlogo.png" alt="Logo" className="w-16 h-16 object-contain mb-2" />
          <h2 className="text-2xl font-bold text-white tracking-wide">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
        </div>
        {error && <div className="bg-brandDanger/20 text-brandDanger p-3 text-sm rounded mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block mb-2">Username</label>
              <input type="text" required value={username} onChange={e => setUsername(e.target.value)} className="w-full bg-[#202225] text-white p-2.5 rounded focus:border-brandGreen outline-none border border-transparent" />
            </div>
          )}
          <div>
            <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block mb-2">Email</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-[#202225] text-white p-2.5 rounded focus:border-brandGreen outline-none border border-transparent" />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block mb-2">Password</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-[#202225] text-white p-2.5 rounded focus:border-brandGreen outline-none border border-transparent" />
          </div>
          <button type="submit" className="w-full bg-brandGreen hover:bg-emerald-600 text-white font-medium py-2.5 rounded transition">
            {isLogin ? 'Log In' : 'Continue'}
          </button>
        </form>
        <p className="text-sm text-gray-400 mt-4 text-center">
          <span className="cursor-pointer hover:underline text-brandGreen" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Create an account' : 'Already have an account?'}
          </span>
        </p>
      </div>
    </div>
  );
}
