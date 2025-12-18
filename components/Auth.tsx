
import React, { useState } from 'react';
import { User } from '../types';

interface AuthProps {
  onLogin: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const users = JSON.parse(localStorage.getItem('novel-craft-users') || '[]');

    if (isLogin) {
      const user = users.find((u: any) => u.email === email && u.password === password);
      if (user) {
        onLogin({ id: user.id, email: user.email, name: user.name });
        localStorage.setItem('novel-craft-user', JSON.stringify({ id: user.id, email: user.email, name: user.name }));
      } else {
        setError('Invalid credentials.');
      }
    } else {
      if (users.find((u: any) => u.email === email)) {
        setError('Email already exists.');
        return;
      }
      const newUser = { id: Math.random().toString(36).substr(2, 9), email, password, name };
      users.push(newUser);
      localStorage.setItem('novel-craft-users', JSON.stringify(users));
      onLogin({ id: newUser.id, email: newUser.email, name: newUser.name });
      localStorage.setItem('novel-craft-user', JSON.stringify({ id: newUser.id, email: newUser.email, name: newUser.name }));
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-black p-6 relative overflow-hidden">
      {/* Decorative Blobs */}
      <div className="absolute top-[-10%] left-[-10%] size-96 bg-primary/20 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] size-96 bg-blue-500/10 blur-[120px] rounded-full"></div>

      <div className="w-full max-w-md bg-surface-dark border border-border-dark p-10 rounded-3xl shadow-2xl relative z-10 backdrop-blur-md">
        <div className="text-center mb-8">
          <div className="size-16 bg-primary rounded-2xl flex items-center justify-center text-black mx-auto mb-6">
            <span className="material-symbols-outlined text-4xl font-bold">edit_note</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">NovelAIcraft</h1>
          <p className="text-gray-500 text-sm">{isLogin ? 'Welcome back to your studio' : 'Create your professional writing account'}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2 px-1">Full Name</label>
              <input 
                className="w-full bg-black border border-border-dark rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                placeholder="George Orwell"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2 px-1">Email Address</label>
            <input 
              type="email"
              className="w-full bg-black border border-border-dark rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-primary focus:border-primary transition-all"
              placeholder="writer@studio.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2 px-1">Password</label>
            <input 
              type="password"
              className="w-full bg-black border border-border-dark rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-primary focus:border-primary transition-all"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="text-red-500 text-xs text-center font-medium">{error}</p>}

          <button className="w-full bg-primary hover:bg-primary-dark text-black font-bold py-4 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98] mt-4">
            {isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-border-dark text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-gray-400 hover:text-white text-sm transition-colors"
          >
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
